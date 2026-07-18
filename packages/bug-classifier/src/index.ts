/**
 * @eml/bug-classifier — BUG 5-level classification (whitepaper §8.3, MVP form).
 *
 * The MVP de-scaling records and classifies; it NEVER auto-fixes. For each issue
 * it reports: a severity LEVEL, the EML source location, the affected node, the
 * Python expansion, and a suggested fix direction. Output doubles as an
 * EML phosphor-jsonl-v1 event stream via {@link emitBugReport}.
 *
 * Two inputs are supported:
 *  - compile-time {@link Diagnostic}s (mapped back to EML source via spans + CTS),
 *  - a runtime Python traceback (best-effort mapped back to the producing node).
 */
import type { Diagnostic, Severity, Program, Cts } from '@eml/types';
import type { Emitter } from '@eml/trace';

/** Five severity levels, from must-stop to ignorable (whitepaper §8.3). */
export type BugLevel = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL' | 'COSMETIC';

/** Highest (0) to lowest; used to compute the worst level in a report. */
const LEVEL_ORDER: BugLevel[] = ['CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL', 'COSMETIC'];

export interface BugLocation {
  line: number;
  column: number;
  /** The offending EML source text. */
  source: string;
}

export interface BugNode {
  id: string;
  semanticType: string;
  /** The Python this node expands to (the "Python 展開碼對應位置"). */
  python: string;
}

export interface ClassifiedBug {
  level: BugLevel;
  code: string;
  message: string;
  /** 'error' | 'warning' | 'info' for compile-time; 'runtime' for execution errors. */
  origin: Severity | 'runtime';
  /** EML source location, or null when the diagnostic carries no span. */
  eml: BugLocation | null;
  /** The affected CTS node, or null when it can't be resolved. */
  node: BugNode | null;
  /** Suggested fix DIRECTION (never an auto-fix). */
  fix: string;
}

export interface BugReport {
  file: string;
  bugs: ClassifiedBug[];
  /** Count per level (all five keys present). */
  counts: Record<BugLevel, number>;
  /** Worst level present, or null when there are no bugs. */
  worst: BugLevel | null;
}

// ── Classification tables ─────────────────────────────────────────────────────

/** Diagnostic code -> level. Unlisted codes fall back to severity-based defaults. */
const LEVEL_BY_CODE: Record<string, BugLevel> = {
  // Can't proceed at all -> CRITICAL.
  E_LEX: 'CRITICAL',
  E_PARSE: 'CRITICAL',
  E_INTERNAL: 'CRITICAL',
  // Localized, blocking, but with a clear fix -> MAJOR.
  E_ALIAS_COLLISION: 'MAJOR',
  E_RANGE_NONINT: 'MAJOR',
  E_RETURN_OUTSIDE_FN: 'MAJOR',
  // Warnings that affect soundness/runtime but don't block -> MINOR.
  W_COLD_SIDE_EFFECT: 'MINOR',
  W_AUG_UNDECLARED: 'MINOR',
  // Advisory hygiene -> TRIVIAL.
  W_TEMP_CONFLICT: 'TRIVIAL',
  W_UNKNOWN_DECORATOR: 'TRIVIAL',
  W_FN_REDECLARED: 'TRIVIAL',
};

/** Diagnostic code -> suggested fix direction (zh-Hant). */
const FIX_BY_CODE: Record<string, string> = {
  E_LEX: '檢查無法識別的字元；EML 以 ASCII canonical 為主，Unicode 需可被 normalizer 對應。',
  E_PARSE: '檢查語法：縮排、括號、`=>` 目標、`def` 區塊是否完整。',
  E_INTERNAL: '轉譯器內部錯誤；請回報並附上最小重現輸入。',
  E_ALIAS_COLLISION: '重新命名與內建遮蔽別名衝突的識別子（例如把函數 `list` 改名為 `my_list`）。',
  E_RANGE_NONINT: '區間上下界需為整數；Python `range()` 不接受非整數。',
  E_RETURN_OUTSIDE_FN: '`return` 只能用在函數 body 內。',
  W_COLD_SIDE_EFFECT: '把含 I/O／動態狀態的部分移出 `@cold`，或改標記 `@hot`。',
  W_AUG_UNDECLARED: '在使用 `^-`／`^*`／`^/` 之前先宣告該變數。',
  W_TEMP_CONFLICT: '一個函數只標一種溫度（`@cold` 或 `@hot`）。',
  W_UNKNOWN_DECORATOR: '只有 `@cold` / `@hot` 具語意；移除或改用支援的裝飾器。',
  W_FN_REDECLARED: '重新命名重複定義的函數。',
};

/** Runtime Python exception type -> level. A crash stops execution -> CRITICAL. */
const RUNTIME_LEVEL_BY_EXCEPTION: Record<string, BugLevel> = {
  SyntaxError: 'CRITICAL',
  IndentationError: 'CRITICAL',
  RecursionError: 'CRITICAL',
};

function levelOf(d: Diagnostic): BugLevel {
  const byCode = LEVEL_BY_CODE[d.code];
  if (byCode) return byCode;
  return d.severity === 'error' ? 'MAJOR' : d.severity === 'warning' ? 'MINOR' : 'COSMETIC';
}

function worstOf(levels: BugLevel[]): BugLevel | null {
  let worst: BugLevel | null = null;
  for (const l of levels) {
    if (worst === null || LEVEL_ORDER.indexOf(l) < LEVEL_ORDER.indexOf(worst)) worst = l;
  }
  return worst;
}

function emptyCounts(): Record<BugLevel, number> {
  return { CRITICAL: 0, MAJOR: 0, MINOR: 0, TRIVIAL: 0, COSMETIC: 0 };
}

// ── Compile-time classification ───────────────────────────────────────────────

export interface ClassifyInput {
  diagnostics: Diagnostic[];
  /** Resolved program (post semantic analysis) — carries statement spans. */
  program: Program;
  /** ASCII-canonical source, for slicing the offending text. */
  normalized: string;
  /** Generated CTS, used to resolve the affected node + Python expansion. */
  cts?: Cts;
  fileName?: string;
}

/** Find the index of the top-level statement whose span contains `offset`. */
function containingStatementIndex(program: Program, offset: number): number {
  for (let i = 0; i < program.body.length; i++) {
    const span = program.body[i]!.span;
    if (span && span.start <= offset && offset < span.end) return i;
  }
  return -1;
}

export function classifyBugs(input: ClassifyInput): BugReport {
  const { diagnostics, program, normalized, cts } = input;
  const bugs: ClassifiedBug[] = diagnostics.map((d) => {
    const level = levelOf(d);
    let eml: BugLocation | null = null;
    let node: BugNode | null = null;

    if (d.span) {
      eml = {
        line: d.span.line,
        column: d.span.column,
        source: normalized.slice(d.span.start, d.span.end).trim(),
      };
      const idx = containingStatementIndex(program, d.span.start);
      const ctsNode = idx >= 0 ? cts?.nodes[idx] : undefined;
      if (ctsNode) {
        node = { id: ctsNode.id, semanticType: ctsNode.semanticType, python: ctsNode.python };
      }
    }

    return {
      level,
      code: d.code,
      message: d.message,
      origin: d.severity,
      eml,
      node,
      fix: FIX_BY_CODE[d.code] ?? '檢視診斷訊息並修正對應的 EML 來源。',
    };
  });

  const counts = emptyCounts();
  for (const b of bugs) counts[b.level]++;

  return {
    file: input.fileName ?? input.cts?.file ?? '(source)',
    bugs,
    counts,
    worst: worstOf(bugs.map((b) => b.level)),
  };
}

// ── Runtime classification (best-effort) ──────────────────────────────────────

export interface RuntimeClassifyInput {
  /** stderr from running the emitted Python. */
  stderr: string;
  /** The emitted Python source (to map a traceback line back to a node). */
  python: string;
  cts?: Cts;
  /** Path/basename of the emitted .py file, to pick the user frame from the traceback. */
  pyFile?: string;
  fileName?: string;
}

interface PyFrame {
  file: string;
  line: number;
}

const baseName = (p: string): string => p.replace(/\\/g, '/').split('/').pop() ?? p;

function parseFrames(lines: string[]): PyFrame[] {
  const frames: PyFrame[] = [];
  for (const l of lines) {
    const m = /File "(.*?)", line (\d+)/.exec(l);
    if (m) frames.push({ file: m[1]!, line: Number(m[2]) });
  }
  return frames;
}

/**
 * The CTS node that OWNS line `pyLine` of the emitted Python. Each node's start
 * line is found by a sequential first-line match (so duplicate emitted lines and
 * multi-line function bodies map by position, not by ambiguous text), and the
 * owner is the last node starting at or before `pyLine`.
 */
function nodeOwningLine(python: string, cts: Cts, pyLine: number): Cts['nodes'][number] | null {
  const out = python.split('\n');
  let cursor = 0;
  let owner: Cts['nodes'][number] | null = null;
  for (const n of cts.nodes) {
    const first = n.python.split('\n').map((s) => s.trim()).find((s) => s !== '');
    if (first === undefined) continue;
    let idx = -1;
    for (let i = cursor; i < out.length; i++) {
      if (out[i]!.trim() === first) {
        idx = i;
        break;
      }
    }
    if (idx < 0) continue;
    cursor = idx + 1;
    if (idx + 1 <= pyLine) owner = n;
    else break; // nodes are emitted in order; once a start passes pyLine, stop
  }
  return owner;
}

/**
 * Classify a Python runtime traceback. Returns null if stderr is not a Python
 * traceback (requires a "Traceback" header or a "File ..." frame, so a bare
 * stderr log line is not mistaken for a crash). The failing line is mapped back
 * to a CTS node by position (best-effort).
 */
export function classifyPythonError(input: RuntimeClassifyInput): ClassifiedBug | null {
  const { stderr, python, cts, pyFile } = input;
  const lines = stderr.split('\n').map((l) => l.replace(/\r$/, ''));

  const hasHeader = lines.some((l) => /^Traceback \(most recent call last\):/.test(l));
  const frames = parseFrames(lines);
  if (!hasHeader && frames.length === 0) return null; // not a Python traceback

  // The exception line is the first flush-left, non-"File" line AFTER the last
  // frame (Python prints it after all frames; a multi-line message follows it).
  let lastFileIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/File ".*", line \d+/.test(lines[i]!)) lastFileIdx = i;
  }
  let exceptionType: string | null = null;
  let message = '';
  for (let i = Math.max(lastFileIdx, 0); i < lines.length; i++) {
    const l = lines[i]!;
    if (l === '' || /^\s/.test(l)) continue; // skip blanks + indented source lines
    if (/^Traceback /.test(l) || /File ".*", line \d+/.test(l)) continue;
    const m = /^([A-Za-z_][A-Za-z0-9_.]*)(?::\s?(.*))?$/.exec(l);
    if (m) {
      exceptionType = m[1]!;
      message = (m[2] ?? '').trim();
      break;
    }
  }
  if (!exceptionType) return null;

  // Candidate failing lines in the emitted file, deepest frame first.
  const want = pyFile ? baseName(pyFile) : null;
  const candidateLines = (want ? frames.filter((f) => baseName(f.file) === want) : frames)
    .map((f) => f.line)
    .reverse();

  const level: BugLevel = RUNTIME_LEVEL_BY_EXCEPTION[exceptionType] ?? 'CRITICAL';

  let node: BugNode | null = null;
  let eml: BugLocation | null = null;
  // Prefer the deepest frame that maps to a user node (so a crash inside the
  // injected runtime preamble is attributed to the user's calling statement,
  // not a preamble line).
  if (cts) {
    for (const ln of candidateLines) {
      const hit = nodeOwningLine(python, cts, ln);
      if (hit) {
        node = { id: hit.id, semanticType: hit.semanticType, python: hit.python };
        if (hit.source) eml = { line: 0, column: 0, source: hit.source };
        break;
      }
    }
  }

  return {
    level,
    code: `RUNTIME_${exceptionType}`,
    message: message || exceptionType,
    origin: 'runtime',
    eml,
    node,
    fix:
      level === 'CRITICAL'
        ? '執行時崩潰並停止；請依例外類型修正對應的 EML 節點後重跑。'
        : '檢視執行時例外並修正對應的 EML 來源。',
  };
}

// ── EML trace emission ────────────────────────────────────────────────────────

/**
 * Emit a {@link BugReport} as `phosphor-jsonl-v1` events: one `eml:bug` per bug
 * (CRITICAL/MAJOR carry `ok:false` so a standard anomaly scan flags them) plus a
 * final `eml:bug:summary`.
 */
export function emitBugReport(report: BugReport, emitter: Emitter): void {
  for (const b of report.bugs) {
    const isFailure = b.level === 'CRITICAL' || b.level === 'MAJOR';
    emitter.emit('eml:bug', {
      level: b.level,
      code: b.code,
      origin: b.origin,
      message: b.message,
      eml: b.eml,
      node: b.node,
      fix: b.fix,
      ...(isFailure ? { ok: false } : {}),
    });
  }
  emitter.emit('eml:bug:summary', {
    file: report.file,
    counts: report.counts,
    worst: report.worst,
    total: report.bugs.length,
  });
}
