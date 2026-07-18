import './style.css';
import { attachSymbolPalette } from './symbol-palette';
import { transpileEmlToPython, CrystalCache } from '@eml/transpiler-python';
import { parse } from '@eml/parser';
import type { CtsFunction, Program } from '@eml/types';
import {
  transpilePythonToEml,
  parsePython,
  roundTripFromEml,
  roundTripFromPython,
} from '@eml/transpiler-eml';
import { interpretProgram, type InterpResult } from '@eml/interp';
import { summarize, findAnomalies, toJsonl, type TraceEvent } from '@eml/trace';

// Persistent crystallization cache (whitepaper §7.3), stored in localStorage so
// cold logic crystallized in one session is a cache hit in the next. The cache
// is read-only during editing; the per-function "結晶化" button commits a hash.
const CACHE_KEY = 'eml.crystal.v1';
function loadPersistentCache(): CrystalCache {
  try {
    return CrystalCache.fromJSON(JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null'));
  } catch {
    return new CrystalCache();
  }
}
let persistentCache = loadPersistentCache();
function savePersistentCache(): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(persistentCache.toJSON()));
  } catch {
    /* storage unavailable — cache stays in-memory for this session */
  }
}

type Direction = 'eml2py' | 'py2eml';

const COLD_HOT_EXAMPLE = [
  '# 冷邏輯：純函數，可結晶化快取',
  '@cold',
  'def square_sum(N):',
  '    Σ(i^2, i in [1:N]) => r',
  '    return r',
  '',
  '# 熱狀態：含 I/O，動態狀態',
  '@hot',
  'def greet(name):',
  '    name^0',
  '    return name',
  '',
  'square_sum(100) => total',
  'total^0',
].join('\n');

const EXAMPLES: Record<Direction, Record<string, string>> = {
  eml2py: {
    'Cold / Hot functions': COLD_HOT_EXAMPLE,
    'Sum of squares': 'N^+100\nΣ(i^2, i in [1:N]) => r\nr^0',
    Conditional: 'x^+50\nx > 40 ? 1 : 0 => y\ny^0',
    'Matrix transpose': '<M>([[1, 2], [3, 4]]) => m\nm^T => t\nt^0',
    'Augmented assign': 'x^+100\nx^+10\nx^*2\nx^0',
    'List + call': 'list^+[1, 2, 3]\nf^+(a, b) => r',
    'Unicode form': 'Σ(i², i∈[1:N]) ⇒ r',
  },
  py2eml: {
    'Sum of squares': 'N = 100\nr = sum(i**2 for i in range(1, N+1))\nprint(r)',
    Conditional: 'x = 50\ny = 1 if x > 40 else 0\nprint(y)',
    'Matrix transpose': 'import numpy as np\nm = np.array([[1, 2], [3, 4]])\nt = np.transpose(m)\nprint(t)',
    Augmented: 'x = 100\nx += 10\nx *= 2\nprint(x)',
  },
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Partial<Record<string, string>> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) node.setAttribute(k, v);
  for (const c of children) node.append(c);
  return node;
}

let direction: Direction = 'eml2py';

const inputArea = el('textarea', { id: 'eml', spellcheck: 'false' });
const exampleSelect = el('select', { id: 'examples' });
const dirButton = el('button', { id: 'dir', class: 'dirbtn' });
const paletteHint = el('span', { class: 'symbol-palette-hint', title: 'open symbol palette (or Ctrl+Space)' }, '⌃Space symbols');

const statusBadge = el('span', { class: 'badge' }, 'ready');
const rtBadge = el('span', { class: 'badge' }, '⇄');
const outCode = el('pre', { class: 'code python' });
const astOut = el('pre', { class: 'code' });
const diagOut = el('div', { class: 'diag' });
const metaOut = el('div', { class: 'meta' });
const fnOut = el('div', { class: 'fns' });
const traceOut = el('div', { class: 'trace' });
const inHead = el('div', { class: 'pane-head' }, 'EML / Py⁺', statusBadge);
const outHead = el('div', { class: 'pane-head' }, 'Python', rtBadge);

const tabNames = ['Trace', 'Functions', 'AST', 'Diagnostics', 'Meta'] as const;
const tabPanes: Record<string, HTMLElement> = {
  Trace: el('div', { class: 'tabpane active' }, traceOut),
  Functions: el('div', { class: 'tabpane' }, fnOut),
  AST: el('div', { class: 'tabpane' }, astOut),
  Diagnostics: el('div', { class: 'tabpane' }, diagOut),
  Meta: el('div', { class: 'tabpane' }, metaOut),
};
const tabButtons: Record<string, HTMLButtonElement> = {};
const tabbar = el('div', { class: 'tabbar' });
for (const name of tabNames) {
  const b = el('button', name === 'Trace' ? { class: 'active' } : {}, name);
  b.addEventListener('click', () => selectTab(name));
  tabButtons[name] = b;
  tabbar.append(b);
}
// The Trace tab runs the interpreter; only do that work when it is actually
// visible (keystroke-cheap), and re-run it when the user switches to it.
let activeTab: string = 'Trace';
let lastTraceAst: Program | null = null;
/** Bound the in-browser interpreter so a large Σ can't freeze the editor thread. */
const EDITOR_MAX_STEPS = 500_000;

function runTrace(): void {
  if (direction !== 'eml2py') return; // reverse mode: renderPyToEml owns the trace pane
  renderTrace(activeTab === 'Trace' && lastTraceAst ? interpretProgram(lastTraceAst, { maxSteps: EDITOR_MAX_STEPS }) : null);
}

function selectTab(name: string): void {
  for (const n of tabNames) {
    tabButtons[n]!.classList.toggle('active', n === name);
    tabPanes[n]!.classList.toggle('active', n === name);
  }
  activeTab = name;
  if (name === 'Trace') runTrace();
}

const app = document.querySelector<HTMLDivElement>('#app')!;
app.append(
  el(
    'header',
    {},
    el('h1', {}, 'EML Workbench ', el('span', { class: 'dim' }, '· EML 2026')),
    dirButton,
    paletteHint,
    el('span', { class: 'spacer' }),
    el('label', { for: 'examples' }, 'example'),
    exampleSelect,
  ),
  el(
    'main',
    {},
    el('div', { class: 'pane' }, inHead, inputArea),
    el(
      'div',
      { class: 'pane right' },
      el('div', { class: 'pane python-pane' }, outHead, outCode),
      el('div', { class: 'tabs' }, tabbar, el('div', { class: 'tabpanes' }, ...Object.values(tabPanes))),
    ),
  ),
);

function refreshExamples(): void {
  exampleSelect.replaceChildren();
  for (const name of Object.keys(EXAMPLES[direction])) {
    exampleSelect.append(el('option', { value: name }, name));
  }
}

function applyDirectionLabels(): void {
  if (direction === 'eml2py') {
    dirButton.textContent = 'EML → Python';
    inHead.firstChild!.textContent = 'EML / Py⁺';
    outHead.firstChild!.textContent = 'Python';
    outCode.className = 'code python';
  } else {
    dirButton.textContent = 'Python → EML';
    inHead.firstChild!.textContent = 'Python';
    outHead.firstChild!.textContent = 'EML / Py⁺';
    outCode.className = 'code';
  }
}

function setBadge(badge: HTMLElement, ok: boolean, text: string): void {
  badge.className = 'badge ' + (ok ? 'ok' : 'bad');
  badge.textContent = text;
}

function renderEmlToPy(src: string): void {
  const result = transpileEmlToPython(src);
  outCode.textContent = result.python.trimEnd() || '# (empty)';
  try {
    astOut.textContent = JSON.stringify(parse(src), null, 2);
  } catch (e) {
    astOut.textContent = `// parse error\n${e instanceof Error ? e.message : String(e)}`;
  }
  const errors = result.diagnostics.filter((d) => d.severity === 'error');
  setBadge(statusBadge, errors.length === 0, errors.length === 0 ? 'transpiled ✓' : `${errors.length} error(s)`);
  renderDiagnostics(result.diagnostics);
  renderMeta(result.metadata.emlLines, result.metadata.pythonLines, result.metadata.declaredNames, result.imports, result.metadata.symbolsUsed);
  renderFunctions(result.metadata.functions);
  // Execution-truth trace: actually run the resolved program in-browser (no Python
  // needed) and visualize the phosphor-jsonl-v1 events. Equivalence to Python is
  // gated by tests/interp.test.ts. Lazy: only interpret when the Trace tab is shown.
  lastTraceAst = errors.length === 0 ? result.ast : null;
  runTrace();
  // Functions are a forward-only construct: round-trip applies to the statement
  // subset only, so show a neutral badge (not a misleading "mismatch") for them.
  if (result.metadata.functions.length > 0) {
    rtBadge.className = 'badge';
    rtBadge.textContent = '⇄ n/a · 函數單向';
  } else {
    const rt = roundTripFromEml(src);
    setBadge(rtBadge, rt.ok, rt.ok ? '⇄ fixpoint ✓' : '⇄ mismatch');
  }
}

function renderPyToEml(src: string): void {
  const result = transpilePythonToEml(src);
  outCode.textContent = result.ok ? result.eml.trimEnd() : `# reverse failed\n# ${result.error ?? ''}`;
  try {
    astOut.textContent = JSON.stringify(parsePython(src), null, 2);
  } catch (e) {
    astOut.textContent = `// parse error\n${e instanceof Error ? e.message : String(e)}`;
  }
  setBadge(statusBadge, result.ok, result.ok ? 'compressed ✓' : 'reverse error');
  diagOut.replaceChildren(
    el('div', { class: `item ${result.ok ? 'clean' : 'error'}` }, result.ok ? 'Parsed Python subset — no errors.' : result.error ?? 'error'),
  );
  metaOut.replaceChildren(el('div', { class: 'row' }, el('span', { class: 'k' }, 'Direction'), el('span', {}, 'Python → EML (deterministic, subset)')));
  fnOut.replaceChildren(
    el('div', { class: 'fn-empty' }, '函數分析僅在 EML → Python 方向提供（函數為單向構造）。'),
  );
  lastTraceAst = null;
  traceOut.replaceChildren(
    el('div', { class: 'trace-empty' }, '執行 trace 僅在 EML → Python 方向提供。切換方向以執行並觀測 phosphor-jsonl-v1 trace。'),
  );
  const rt = roundTripFromPython(src);
  setBadge(rtBadge, rt.ok, rt.ok ? '⇄ fixpoint ✓' : '⇄ mismatch');
}

function renderDiagnostics(diags: { severity: string; code: string; message: string; span?: { line: number; column: number } }[]): void {
  diagOut.replaceChildren();
  if (diags.length === 0) {
    diagOut.append(el('div', { class: 'item clean' }, 'No diagnostics — clean.'));
    return;
  }
  for (const d of diags) {
    const loc = d.span ? ` (line ${d.span.line}, col ${d.span.column})` : '';
    diagOut.append(el('div', { class: `item ${d.severity}` }, `[${d.severity}] ${d.code}: ${d.message}${loc}`));
  }
}

function renderMeta(emlLines: number, pyLines: number, declared: string[], imports: string[], symbols: string[]): void {
  metaOut.replaceChildren();
  const symBox = el('div', {});
  for (const s of symbols) symBox.append(el('span', { class: 'sym' }, s));
  if (symbols.length === 0) symBox.append(el('span', { class: 'k' }, '—'));
  metaOut.append(
    el('div', { class: 'row' }, el('span', { class: 'k' }, 'EML lines'), el('span', {}, String(emlLines))),
    el('div', { class: 'row' }, el('span', { class: 'k' }, 'Python lines'), el('span', {}, String(pyLines))),
    el('div', { class: 'row' }, el('span', { class: 'k' }, 'Declared names'), el('span', {}, declared.join(', ') || '—')),
    el('div', { class: 'row' }, el('span', { class: 'k' }, 'Imports'), el('span', {}, imports.join('; ') || '—')),
    el('div', { class: 'row' }, el('span', { class: 'k' }, 'Symbols used')),
    symBox,
  );
}

function renderFunctions(fns: CtsFunction[]): void {
  fnOut.replaceChildren();

  const header = el('div', { class: 'fns-head' }, el('span', {}, `${fns.length} function(s)`));
  if (persistentCache.size > 0) {
    const clear = el('button', { class: 'clear-btn', title: 'clear the persistent crystal cache' }, `清除快取 (${persistentCache.size})`);
    clear.addEventListener('click', () => {
      persistentCache = new CrystalCache();
      savePersistentCache();
      render();
    });
    header.append(clear);
  }
  fnOut.append(header);

  if (fns.length === 0) {
    fnOut.append(el('div', { class: 'fn-empty' }, '這個程式沒有函數定義。切換到「Cold / Hot functions」範例試試 @cold / @hot。'));
    return;
  }

  for (const fn of fns) {
    const card = el('div', { class: `fn-card ${fn.temperature}` });
    const tempLabel =
      fn.temperature === 'cold' ? '🧊 cold' : fn.temperature === 'hot' ? '🔥 hot' : '· neutral';
    card.append(
      el(
        'div',
        { class: 'fn-head' },
        el('span', { class: 'fn-name' }, `${fn.name}()`),
        el('span', { class: `temp ${fn.temperature}` }, tempLabel),
      ),
    );

    card.append(
      el(
        'div',
        { class: 'fn-flags' },
        el('span', { class: fn.pure ? 'flag pure' : 'flag impure' }, fn.pure ? 'pure' : 'impure'),
        el('span', { class: 'flag hash' }, `#${fn.astHash}`),
      ),
    );
    if (!fn.pure && fn.sideEffects.length > 0) {
      card.append(el('div', { class: 'fn-warn' }, `⚠ ${fn.sideEffects.join('；')}`));
    }

    // importance bar
    const fill = el('div', { class: 'imp-fill' });
    fill.style.width = `${Math.round(fn.importance.score * 100)}%`;
    card.append(
      el(
        'div',
        { class: 'fn-row' },
        el('span', { class: 'k' }, 'importance'),
        el('div', { class: 'imp-bar' }, fill),
        el('span', { class: 'imp-val' }, fn.importance.score.toFixed(2)),
      ),
      el(
        'div',
        { class: 'fn-sub' },
        `freq ${fn.importance.callFrequency} · risk ${fn.importance.riskLevel} · depth ${fn.importance.dependencyDepth}`,
      ),
    );

    // crystallization control (cold functions only)
    if (fn.temperature === 'cold') {
      const persisted = persistentCache.count(fn.astHash);
      if (persisted > 0) {
        card.append(el('div', { class: 'fn-cryst on' }, `🔷 已結晶化 · 快取命中 ×${persisted}`));
      } else if (!fn.pure) {
        card.append(el('div', { class: 'fn-cryst warn' }, '不可結晶化（含副作用）'));
      } else {
        const btn = el('button', { class: 'cryst-btn' }, '結晶化 →');
        btn.addEventListener('click', () => {
          persistentCache.store(fn.astHash);
          savePersistentCache();
          render();
        });
        card.append(el('div', { class: 'fn-cryst' }, btn));
      }
    }

    fnOut.append(card);
  }
}

/** Per-event presentation: icon, short label, detail string, and a colour class. */
function describeEvent(e: TraceEvent): { icon: string; label: string; detail: string; cls: string } {
  const f = e as Record<string, unknown>;
  const s = (k: string): string => (f[k] === undefined ? '' : String(f[k]));
  switch (e.type) {
    case 'eml:run:start':
      return { icon: '▶', label: 'run', detail: `${s('statements')} statement(s)`, cls: 'muted' };
    case 'eml:def':
      return { icon: 'ƒ', label: `def ${s('fn')}(${(f.params as string[] | undefined)?.join(', ') ?? ''})`, detail: s('temperature'), cls: s('temperature') };
    case 'eml:assign':
      return { icon: f.declares ? '≔' : '=', label: s('name'), detail: `= ${s('value')}`, cls: '' };
    case 'eml:augment':
      return { icon: '±', label: s('name'), detail: `${s('op')}= → ${s('value')}`, cls: '' };
    case 'eml:sum':
      return { icon: 'Σ', label: `${s('iterator')} ×${s('count')}`, detail: `→ ${s('result')}`, cls: 'accent' };
    case 'eml:call':
      return { icon: '→', label: `${s('fn')}(${(f.args as string[] | undefined)?.join(', ') ?? ''})`, detail: s('temperature'), cls: s('temperature') };
    case 'eml:return':
      return { icon: '↩', label: s('fn'), detail: `→ ${s('value')}`, cls: 'muted' };
    case 'eml:cache:hit':
      return { icon: '🔷', label: `cache hit · ${s('fn')}`, detail: `→ ${s('result')}`, cls: 'cold' };
    case 'eml:cache:miss':
      return { icon: '◇', label: `cache miss · ${s('fn')}`, detail: '', cls: 'muted' };
    case 'eml:output':
      return { icon: '»', label: 'print', detail: s('text'), cls: 'out' };
    case 'eml:unsupported':
      return { icon: '⚠', label: `unsupported · ${s('construct')}`, detail: s('reason'), cls: 'warn' };
    case 'eml:run:incomplete':
      return { icon: '⊘', label: 'incomplete', detail: s('reason'), cls: 'warn' };
    case 'eml:run:error':
      return { icon: '✗', label: `${s('error')}`, detail: s('message'), cls: 'err' };
    case 'eml:run:done':
      return { icon: '✓', label: 'done', detail: `${s('outputs')} output(s) · ${s('anomalies')} anomal${f.anomalies === 1 ? 'y' : 'ies'}`, cls: 'ok' };
    default:
      return { icon: '·', label: e.type, detail: '', cls: 'muted' };
  }
}

function renderTrace(ir: InterpResult | null): void {
  traceOut.replaceChildren();
  if (!ir) {
    traceOut.append(el('div', { class: 'trace-empty' }, '修正上方錯誤後即可在瀏覽器內執行並產生 trace。'));
    return;
  }
  const anomalies = new Set(findAnomalies(ir.events));
  const sum = summarize(ir.events);

  // 1) Execution result — the real stdout, computed in-browser (no Python).
  const statusCls = ir.error ? 'err' : ir.unsupported.length ? 'warn' : 'ok';
  const statusText = ir.error
    ? `✗ ${ir.error.type}`
    : ir.unsupported.length
      ? '⊘ 部分構造需 Python runtime'
      : '✓ executed';
  const head = el(
    'div',
    { class: 'trace-head' },
    el('span', { class: `trace-status ${statusCls}` }, statusText),
    el('span', { class: 'trace-stat' }, `${sum.total} events`),
    el('span', { class: `trace-stat ${sum.anomalies ? 'err' : ''}` }, `${sum.anomalies} anomal${sum.anomalies === 1 ? 'y' : 'ies'}`),
  );
  const copyBtn = el('button', { class: 'trace-copy', title: 'copy phosphor-jsonl-v1 to clipboard' }, 'copy JSONL');
  copyBtn.addEventListener('click', () => {
    const flash = (label: string): void => {
      copyBtn.textContent = label;
      window.setTimeout(() => (copyBtn.textContent = 'copy JSONL'), 1200);
    };
    // Only claim success on resolve; handle insecure-context / denied rejection.
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(toJsonl(ir.events)).then(() => flash('copied ✓'), () => flash('copy failed'));
    } else {
      flash('copy failed');
    }
  });
  head.append(copyBtn);
  traceOut.append(head);

  traceOut.append(el('div', { class: 'trace-out-label' }, 'stdout · 執行結果'));
  traceOut.append(el('pre', { class: 'trace-out' }, ir.output.trimEnd() || '(no output)'));
  if (ir.error) {
    traceOut.append(el('div', { class: 'trace-err' }, `${ir.error.type}: ${ir.error.message}`));
  }
  if (ir.unsupported.length > 0) {
    traceOut.append(
      el('div', { class: 'trace-note' }, `numpy / temporal 等構造由真實 Python runtime 執行：eml run / eml trace --run。`),
    );
  }

  // 2) The phosphor-jsonl-v1 event timeline.
  traceOut.append(el('div', { class: 'trace-out-label' }, 'phosphor-jsonl-v1 · 事件流'));
  const list = el('div', { class: 'trace-list' });
  ir.events.forEach((e, i) => {
    const d = describeEvent(e);
    const row = el(
      'div',
      { class: `trace-row ${d.cls}${anomalies.has(e) ? ' anomaly' : ''}` },
      el('span', { class: 'trace-seq' }, String(i + 1)),
      el('span', { class: 'trace-icon' }, d.icon),
      el('span', { class: 'trace-type' }, e.type.replace(/^eml:/, '')),
      el('span', { class: 'trace-label' }, d.label),
      el('span', { class: 'trace-detail' }, d.detail),
    );
    list.append(row);
  });
  traceOut.append(list);
}

function render(): void {
  if (direction === 'eml2py') renderEmlToPy(inputArea.value);
  else renderPyToEml(inputArea.value);
}

let timer = 0;
inputArea.addEventListener('input', () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(render, 120);
});
exampleSelect.addEventListener('change', () => {
  inputArea.value = EXAMPLES[direction][exampleSelect.value] ?? '';
  render();
});
dirButton.addEventListener('click', () => {
  direction = direction === 'eml2py' ? 'py2eml' : 'eml2py';
  applyDirectionLabels();
  refreshExamples();
  const firstKey = Object.keys(EXAMPLES[direction])[0]!;
  exampleSelect.value = firstKey;
  inputArea.value = EXAMPLES[direction][firstKey]!;
  render();
});

const symbolPalette = attachSymbolPalette(inputArea, render);
paletteHint.addEventListener('click', () => symbolPalette.open());
applyDirectionLabels();
refreshExamples();
inputArea.value = EXAMPLES.eml2py['Cold / Hot functions']!;
render();
