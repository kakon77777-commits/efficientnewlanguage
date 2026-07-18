import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, join, dirname, resolve } from 'node:path';
import type { Diagnostic } from '@eml/types';
import { transpileEmlToPython, analyzeSemantics, formatPython, CrystalCache } from '@eml/transpiler-python';
import { transpilePythonToEml, roundTripFromEml, roundTripFromPython } from '@eml/transpiler-eml';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { suggestEml, ClaudeClient, type Suggestion } from '@eml/ai-converter';
import { parse } from '@eml/parser';
import { generateCts } from '@eml/cts-generator';
import { EML_SYMBOLS } from '@eml/symbols';
import { createEmitter, memorySink, multiSink, findAnomalies, type TraceEvent } from '@eml/trace';
import { fileSink } from '@eml/trace/node';
import { interpret } from '@eml/interp';
import {
  classifyBugs,
  classifyPythonError,
  emitBugReport,
  type BugReport,
  type ClassifiedBug,
  type BugLevel,
} from '@eml/bug-classifier';

interface ParsedArgs {
  positionals: string[];
  flags: Record<string, string | boolean>;
}

/**
 * Boolean flags never consume a following token as their value (so they can't
 * swallow a file positional). A value, if any, must be given with `=`.
 */
const BOOLEAN_FLAGS = new Set(['cache', 'always-ai', 'verbose', 'v', 'run', 'deterministic']);

function parseArgs(args: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    const isFlag = a.startsWith('--') || (a.startsWith('-') && a.length > 1 && !/^-\d/.test(a));
    if (isFlag) {
      const body = a.replace(/^-+/, '');
      // Support the GNU `--key=value` form explicitly.
      const eq = body.indexOf('=');
      if (eq >= 0) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
        continue;
      }
      const next = args[i + 1];
      if (!BOOLEAN_FLAGS.has(body) && next !== undefined && !next.startsWith('-')) {
        flags[body] = next;
        i++;
      } else {
        flags[body] = true;
      }
    } else {
      positionals.push(a);
    }
  }
  return { positionals, flags };
}

const flag = (a: ParsedArgs, ...names: string[]): string | boolean | undefined => {
  for (const n of names) if (n in a.flags) return a.flags[n];
  return undefined;
};

/** Resolve a usable Python interpreter; honors $EML_PYTHON, else probes candidates. */
function resolvePython(): string | null {
  const override = process.env.EML_PYTHON;
  const candidates = override
    ? [override]
    : process.platform === 'win32'
      ? ['python', 'py', 'python3']
      : ['python3', 'python'];
  for (const cand of candidates) {
    const probe = spawnSync(cand, ['--version'], { encoding: 'utf8' });
    if (!probe.error && probe.status === 0) return cand;
  }
  return null;
}

function readSource(file: string): string {
  if (!existsSync(file)) {
    console.error(`error: file not found: ${file}`);
    process.exit(1);
  }
  return readFileSync(file, 'utf8');
}

function formatDiagnostic(d: Diagnostic): string {
  const loc = d.span ? ` (line ${d.span.line}, col ${d.span.column})` : '';
  return `  [${d.severity}] ${d.code}: ${d.message}${loc}`;
}

function reportDiagnostics(diags: Diagnostic[]): void {
  for (const d of diags) console.error(formatDiagnostic(d));
}

function emitOut(content: string, out: string | boolean | undefined): void {
  if (typeof out === 'string') {
    mkdirSync(dirname(out) || '.', { recursive: true });
    writeFileSync(out, content);
    console.log(`wrote ${out}`);
  } else {
    process.stdout.write(content.endsWith('\n') ? content : content + '\n');
  }
}

const DEFAULT_CACHE_PATH = join('.eml-cache', 'crystal.json');

/**
 * Resolve a persistent crystallization cache from `--cache` / `--cache=path`.
 * Absent the flag, returns no cache (fresh per-call, no files written) so the
 * default behavior — and golden tests — stay deterministic. With the flag, the
 * cache is loaded from disk; only `crystallize` calls `save()`, so read-only
 * commands preview against the cache without committing to it (whitepaper §7.3).
 * The path must end in `.json` so the cache can never clobber a source file
 * (Iron rule 4), and `save()` is best-effort so a bad path never discards output.
 */
function resolveCache(a: ParsedArgs): { cache?: CrystalCache; save: () => void } {
  const f = flag(a, 'cache');
  if (f === undefined) return { save: () => {} };
  const path = typeof f === 'string' ? f : DEFAULT_CACHE_PATH;
  if (!/\.json$/i.test(path)) {
    console.error(`error: --cache path must end in .json (got '${path}'); refusing to write the crystal cache over a non-.json file`);
    process.exit(1);
  }
  let cache: CrystalCache;
  try {
    cache = existsSync(path) ? CrystalCache.fromJSON(JSON.parse(readFileSync(path, 'utf8'))) : new CrystalCache();
  } catch {
    cache = new CrystalCache(); // tolerate a corrupt/unreadable cache file
  }
  const save = (): void => {
    try {
      mkdirSync(dirname(path) || '.', { recursive: true });
      writeFileSync(path, JSON.stringify(cache.toJSON(), null, 2));
    } catch (e) {
      console.error(`warning: could not write crystal cache to ${path}: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  return { cache, save };
}

// ── commands ──────────────────────────────────────────────────────────────────

function cmdParse(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('parse <file> [--out file]');
  const src = readSource(file);
  const ast = parse(src);
  emitOut(JSON.stringify(ast, null, 2), flag(a, 'out', 'o'));
}

function cmdTranspile(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('transpile <file> [--target python|cpp] [--out file]');
  const target = flag(a, 'target') ?? 'python';
  if (target !== 'python' && target !== 'cpp') {
    console.error(`error: unsupported target '${target}' (use 'python' or 'cpp')`);
    process.exit(1);
  }
  if (target === 'cpp') {
    const cppResult = transpileEmlToCpp(readSource(file));
    if (!cppResult.ok) {
      console.error('transpile to C++ failed:');
      reportDiagnostics(cppResult.diagnostics);
      process.exit(1);
    }
    if (cppResult.diagnostics.length > 0) reportDiagnostics(cppResult.diagnostics);
    emitOut(cppResult.cpp, flag(a, 'out', 'o'));
    return;
  }
  const src = readSource(file);
  // Read-only: preview against the cache (cached flags in metadata) but do not
  // commit — only `eml crystallize` persists.
  const { cache } = resolveCache(a);
  const result = transpileEmlToPython(src, { fileName: basename(file), crystalCache: cache });
  if (!result.ok) {
    console.error('transpile failed:');
    reportDiagnostics(result.diagnostics);
    process.exit(1);
  }
  if (result.diagnostics.length > 0) reportDiagnostics(result.diagnostics);
  emitOut(result.python, flag(a, 'out', 'o'));
}

function cmdRun(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('run <file>');
  const src = readSource(file);
  const { cache } = resolveCache(a); // read-only preview; does not commit
  const result = transpileEmlToPython(src, { fileName: basename(file), crystalCache: cache });
  if (!result.ok) {
    console.error('transpile failed:');
    reportDiagnostics(result.diagnostics);
    process.exit(1);
  }
  if (result.diagnostics.length > 0) reportDiagnostics(result.diagnostics);
  mkdirSync('.tmp', { recursive: true });
  const tmp = join('.tmp', basename(file).replace(/\.[^.]+$/, '') + '.py');
  writeFileSync(tmp, result.python);
  const python = resolvePython();
  if (!python) {
    console.error('error: no Python interpreter found (tried python/py/python3; set EML_PYTHON to override)');
    process.exit(1);
  }
  const py = spawnSync(python, [tmp], { encoding: 'utf8' });
  if (py.error) {
    console.error(`error: failed to launch ${python}: ${py.error.message}`);
    process.exit(1);
  }
  if (py.stdout) process.stdout.write(py.stdout);
  if (py.stderr) process.stderr.write(py.stderr);
  process.exit(py.status ?? 0);
}

function cmdAst(a: ParsedArgs): void {
  cmdParse(a);
}

function cmdCts(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('cts <file> [--out file]');
  const src = readSource(file);
  const { cache } = resolveCache(a); // read-only preview; does not commit
  const result = transpileEmlToPython(src, { fileName: basename(file), crystalCache: cache });
  if (!result.ok) {
    console.error('cannot build CTS, transpile failed:');
    reportDiagnostics(result.diagnostics);
    process.exit(1);
  }
  const semantic = analyzeSemantics(parse(src));
  const cts = generateCts({
    fileName: basename(file),
    normalized: result.normalized,
    program: semantic.program,
    symbolsUsed: semantic.symbolsUsed,
    functions: result.metadata.functions,
    loops: result.metadata.loops,
  });
  emitOut(JSON.stringify(cts, null, 2), flag(a, 'out', 'o'));
}

function cmdCheck(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('check <file>');
  const src = readSource(file);
  const result = transpileEmlToPython(src, { fileName: basename(file) });
  if (result.ok && result.diagnostics.length === 0) {
    console.log(`ok: ${file} (${result.metadata.emlLines} EML lines -> ${result.metadata.pythonLines} Python lines)`);
    return;
  }
  reportDiagnostics(result.diagnostics);
  if (!result.ok) process.exit(1);
}

function cmdExplain(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('explain <file>');
  const src = readSource(file);
  const { cache } = resolveCache(a); // read-only preview; does not commit
  const result = transpileEmlToPython(src, { fileName: basename(file), crystalCache: cache });
  if (!result.ok) {
    reportDiagnostics(result.diagnostics);
    process.exit(1);
  }
  const semantic = analyzeSemantics(parse(src));
  const cts = generateCts({
    fileName: basename(file),
    normalized: result.normalized,
    program: semantic.program,
    symbolsUsed: semantic.symbolsUsed,
    functions: result.metadata.functions,
    loops: result.metadata.loops,
  });
  console.log(`EML explain: ${file}`);
  console.log('');
  console.log('Symbols used:');
  for (const s of semantic.symbolsUsed) {
    const def = EML_SYMBOLS[s];
    if (def) console.log(`  ${s}  →  ${def.name} (${def.category}): ${def.description}`);
    else console.log(`  ${s}  →  (no definition)`);
  }
  if (cts.functions.length > 0) {
    console.log('');
    console.log('Functions (cold/hot · crystallization · importance):');
    for (const fn of cts.functions) {
      const temp =
        fn.temperature === 'cold' ? '🧊 cold' : fn.temperature === 'hot' ? '🔥 hot' : '· neutral';
      const cache = fn.temperature === 'cold' ? (fn.cached ? ' · cache HIT' : ' · cacheable') : '';
      console.log(`  ${fn.name}()  ${temp}${cache}`);
      console.log(`    pure:       ${fn.pure ? 'yes' : 'no'}`);
      if (fn.sideEffects.length) console.log(`    sideEffects: ${fn.sideEffects.join('; ')}`);
      console.log(`    astHash:    ${fn.astHash}`);
      console.log(
        `    importance: ${fn.importance.score}  (freq=${fn.importance.callFrequency}, risk=${fn.importance.riskLevel}, depth=${fn.importance.dependencyDepth})`,
      );
    }
  }

  if (cts.loops.length > 0) {
    console.log('');
    console.log('Loops (kind · deterministic · terminating):');
    for (const loop of cts.loops) {
      const det = loop.deterministic ? 'deterministic' : 'non-deterministic';
      const term = loop.terminating ? 'terminating' : 'unbounded';
      console.log(`  ${loop.loopKind}${loop.ref ? ` (${loop.ref})` : ''}  ·  ${det} · ${term}`);
      console.log(`    EML: ${loop.source}`);
    }
  }

  console.log('');
  console.log('Statements:');
  for (const node of cts.nodes) {
    console.log(`  ${node.id} [${node.semanticType}] ${cts.commentTable[node.id] ?? ''}`);
    console.log(`    EML:    ${node.source}`);
    console.log(`    Python: ${node.python}`);
    if (node.dependencies.length) console.log(`    deps:   ${node.dependencies.join(', ')}`);
  }
}

function cmdCrystallize(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('crystallize <file> [--cache=path]');
  const src = readSource(file);
  // crystallize always persists; default the cache path if --cache is omitted.
  if (flag(a, 'cache') === undefined) a.flags['cache'] = true;
  const cachePath = typeof flag(a, 'cache') === 'string' ? (flag(a, 'cache') as string) : DEFAULT_CACHE_PATH;
  const { cache, save } = resolveCache(a);
  const result = transpileEmlToPython(src, { fileName: basename(file), crystalCache: cache });
  if (!result.ok) {
    console.error('crystallize failed, transpile error:');
    reportDiagnostics(result.diagnostics);
    process.exit(1);
  }
  save();
  const fns = result.metadata.functions;
  console.log(`crystallize ${file}  (cache: ${cachePath})`);
  console.log('');
  if (fns.length === 0) {
    console.log('  (no functions to crystallize)');
    return;
  }
  for (const fn of fns) {
    if (fn.temperature !== 'cold') {
      console.log(`  ${fn.name}()  —  ${fn.temperature} (not crystallizable)`);
      continue;
    }
    const status = fn.cached ? 'CACHE HIT ♻  (seen in a previous run)' : 'NEW ✦  (crystallized this run)';
    const purity = fn.pure ? '' : '  ⚠ impure — not safely cacheable';
    console.log(`  ${fn.name}()  [${fn.astHash}]  ${status}${purity}`);
  }
  console.log('');
  console.log(`cache now holds ${cache!.size} distinct cold-logic hash(es). Re-run to see hits.`);
}

const LEVEL_MARK: Record<BugLevel, string> = {
  CRITICAL: '🛑 CRITICAL',
  MAJOR: '❌ MAJOR',
  MINOR: '⚠ MINOR',
  TRIVIAL: '· TRIVIAL',
  COSMETIC: '◦ COSMETIC',
};

/** First line of a (possibly multi-line) snippet, with a "+N more" hint. */
function oneLine(s: string): string {
  const lines = s.split('\n');
  return lines.length > 1 ? `${lines[0]} … (+${lines.length - 1} more)` : lines[0] ?? '';
}

function printBug(b: ClassifiedBug): void {
  console.log(`  [${LEVEL_MARK[b.level]}] ${b.code}: ${b.message}`);
  if (b.eml && (b.eml.line || b.eml.column)) {
    console.log(`    EML:    line ${b.eml.line}, col ${b.eml.column}  ·  ${oneLine(b.eml.source)}`);
  } else if (b.eml?.source) {
    console.log(`    EML:    ${oneLine(b.eml.source)}`);
  }
  if (b.node) console.log(`    node:   ${b.node.id} [${b.node.semanticType}]  →  ${oneLine(b.node.python)}`);
  console.log(`    fix:    ${b.fix}`);
}

function printBugReport(report: BugReport): void {
  const c = report.counts;
  console.log(`EML bugs: ${report.file}`);
  console.log(
    `worst: ${report.worst ?? 'none'}  (CRITICAL ${c.CRITICAL} · MAJOR ${c.MAJOR} · MINOR ${c.MINOR} · TRIVIAL ${c.TRIVIAL} · COSMETIC ${c.COSMETIC})`,
  );
  console.log('');
  if (report.bugs.length === 0) {
    console.log('  no bugs — clean ✓');
    return;
  }
  for (const b of report.bugs) printBug(b);
}

function cmdBugs(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('bugs <file> [--run] [--trace=out.jsonl] [--json]');
  const src = readSource(file);
  const result = transpileEmlToPython(src, { fileName: basename(file) });

  // CTS gives each diagnostic its affected node + Python expansion. Best-effort:
  // unavailable on a hard parse failure (empty program).
  let cts;
  try {
    const semantic = analyzeSemantics(parse(src));
    cts = generateCts({
      fileName: basename(file),
      normalized: result.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: result.metadata.functions,
    });
  } catch {
    cts = undefined;
  }

  const report = classifyBugs({
    diagnostics: result.diagnostics,
    program: result.ast,
    normalized: result.normalized,
    cts,
    fileName: basename(file),
  });

  // Optional runtime classification: run the emitted Python and classify a crash.
  if (flag(a, 'run') && result.ok) {
    const python = resolvePython();
    if (!python) {
      console.error('warning: --run skipped — no Python interpreter found (set EML_PYTHON to override)');
    } else {
      mkdirSync('.tmp', { recursive: true });
      const tmp = join('.tmp', basename(file).replace(/\.[^.]+$/, '') + '.py');
      writeFileSync(tmp, result.python);
      const run = spawnSync(python, [tmp], { encoding: 'utf8' });
      if ((run.status ?? 0) !== 0 && run.stderr) {
        const rb = classifyPythonError({ stderr: run.stderr, python: result.python, cts, pyFile: tmp, fileName: basename(file) });
        if (rb) {
          report.bugs.push(rb);
          report.counts[rb.level]++;
          const order: BugLevel[] = ['CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL', 'COSMETIC'];
          if (report.worst === null || order.indexOf(rb.level) < order.indexOf(report.worst)) {
            report.worst = rb.level;
          }
        }
      }
    }
  }

  // Emit an EML phosphor-jsonl-v1 trace (always to memory; also to a file with --trace).
  const buffer: TraceEvent[] = [];
  const traceOut = flag(a, 'trace');
  const sink =
    typeof traceOut === 'string' ? multiSink(memorySink(buffer), fileSink(traceOut)) : memorySink(buffer);
  emitBugReport(report, createEmitter({ stream: 'eml', sink }));

  if (flag(a, 'json')) {
    emitOut(JSON.stringify(report, null, 2), undefined);
  } else {
    printBugReport(report);
  }
  // To stderr so `--json` stdout stays pure machine-readable JSON.
  if (typeof traceOut === 'string') console.error(`wrote phosphor-jsonl-v1 trace to ${traceOut} (${buffer.length} events)`);

  // CRITICAL/MAJOR are failures (whitepaper: CRITICAL stops execution).
  if (report.worst === 'CRITICAL' || report.worst === 'MAJOR') process.exitCode = 1;
}

/** Envelope fields stamped by the emitter; stripped before re-emitting foreign events. */
const TRACE_ENVELOPE = new Set(['stream', 'proto', 'seq', 'ts', 'type', 'writer', 'mono']);

/**
 * `eml trace` — produce an EML `phosphor-jsonl-v1` execution trace.
 *
 * The trace is generated by @eml/interp (the browser-safe execution-truth
 * interpreter), so it carries real computed values. With `--run`, when a Python
 * interpreter is present, the command bakes an `eml:equiv` check into the trace
 * comparing the interpreter's stdout to a real Python run — a self-validating
 * artifact. For numpy/temporal programs the interpreter defers; `--run` then
 * splices in the real `eml:temporal:*` events from the Python process's stderr.
 * `--deterministic` uses a fixed clock so the artifact is byte-reproducible
 * (used for the committed per-example golden traces).
 */
function cmdTrace(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('trace <file> [--out f.jsonl] [--run] [--deterministic]');
  const src = readSource(file);
  const result = transpileEmlToPython(src, { fileName: basename(file) });
  if (!result.ok) {
    console.error('transpile failed:');
    reportDiagnostics(result.diagnostics);
    process.exit(1);
  }
  if (result.diagnostics.length > 0) reportDiagnostics(result.diagnostics);

  const deterministic = flag(a, 'deterministic') === true;
  const now = deterministic ? () => '1970-01-01T00:00:00.000Z' : undefined;
  const em = createEmitter({ stream: 'eml', ...(now ? { now } : {}) });
  const ir = interpret(src, { emitter: em, file: basename(file), ...(now ? { now } : {}) });

  // With --run, prove (or supply) execution truth against a real Python process.
  if (flag(a, 'run')) {
    const python = resolvePython();
    if (!python) {
      console.error('warning: --run skipped — no Python interpreter found (set EML_PYTHON to override)');
    } else {
      mkdirSync('.tmp', { recursive: true });
      const tmp = join('.tmp', basename(file).replace(/\.[^.]+$/, '') + '.trace.py');
      writeFileSync(tmp, result.python);
      const py = spawnSync(python, [tmp], { encoding: 'utf8' });
      const pyStdout = (py.stdout ?? '').replace(/\r\n/g, '\n');
      if (ir.unsupported.length === 0 && ir.error === undefined) {
        // Self-validating: the interpreter's stdout must equal Python's.
        em.check('eml:equiv', ir.output, pyStdout, { source: 'interp', target: 'python' });
      } else {
        // numpy / temporal: the interpreter deferred — splice Python's own trace.
        em.emit('eml:python:stdout', { text: pyStdout });
        for (const line of (py.stderr ?? '').split('\n')) {
          const t = line.trim();
          if (!t.startsWith('{')) continue;
          try {
            const ev = JSON.parse(t) as TraceEvent;
            if (ev.proto === 'phosphor-jsonl-v1' && typeof ev.type === 'string') {
              const fields = Object.fromEntries(
                Object.entries(ev).filter(([k]) => !TRACE_ENVELOPE.has(k)),
              );
              em.emit(ev.type, fields);
            }
          } catch {
            /* non-JSON stderr line (e.g. a traceback) — skip */
          }
        }
      }
      em.emit('eml:python:exit', { code: py.status ?? 0 });
    }
  }

  const events = em.events;
  const jsonl = events.map((e) => JSON.stringify(e)).join('\n') + '\n';
  // Iron rule 4: never clobber a source file. Refuse a trace --out that would
  // overwrite this (or any) .eml/.py source; the trace belongs in a .jsonl.
  const out = flag(a, 'out', 'o');
  if (typeof out === 'string') {
    if (resolve(out) === resolve(file)) {
      console.error(`error: --out must not be the source file (${file}); write the trace to a .jsonl`);
      process.exit(1);
    }
    if (/\.(eml|py)$/i.test(out)) {
      console.error(`error: --out '${out}' looks like source; use a .jsonl path for a trace`);
      process.exit(1);
    }
  }
  emitOut(jsonl, out);
  const anomalies = findAnomalies(events).length;
  console.error(
    `phosphor-jsonl-v1: ${events.length} events, ${anomalies} anomal${anomalies === 1 ? 'y' : 'ies'}` +
      (ir.unsupported.length ? ` (interp deferred: ${ir.unsupported.join(', ')})` : ''),
  );
  // Make a --run divergence (eml:equiv ok:false / non-zero python exit / runtime
  // fault) scriptable: anomalies set a non-zero exit (mirrors cmdBugs/cmdRun).
  if (anomalies > 0) process.exitCode = 1;
}

/**
 * `eml test` — the practical companion to `docs/conformance.md`: an external,
 * vitest-independent check that a fixture set's EML sources transpile to the
 * exact committed Python text (grammar-mapping conformance, §11). Fixtures are
 * deliberately statement/expression-level mapping snippets (Appendix B's "14
 * cases" and their Phase 6/7 successors) — several reference names that are
 * never bound (`m`, `x`, `f`, `data`, ...) because they exist to pin down a
 * single construct's expansion, not to run standalone. Execution-truth
 * conformance (does a real, complete program run correctly) is a separate,
 * already-existing layer: `examples/*.trace.jsonl` + `eml trace <file> --run`
 * (see docs/conformance.md).
 */
function cmdTest(a: ParsedArgs): void {
  const dir = (flag(a, 'dir') as string) ?? join('tests', 'fixtures');
  if (!existsSync(dir)) {
    console.error(`error: fixtures dir not found: ${dir}`);
    process.exit(1);
  }
  const emlFiles = readdirSync(dir)
    .filter((f) => f.endsWith('.eml'))
    .sort();
  let pass = 0;
  let fail = 0;
  for (const f of emlFiles) {
    const base = f.replace(/\.eml$/, '');
    const expectedPath = join(dir, `${base}.expected.py`);
    if (!existsSync(expectedPath)) {
      console.error(`  SKIP ${base}: missing ${base}.expected.py`);
      continue;
    }
    const src = readFileSync(join(dir, f), 'utf8');
    const expected = formatPython(readFileSync(expectedPath, 'utf8'));
    const result = transpileEmlToPython(src, { fileName: f });
    const actual = result.python;
    if (result.ok && actual === expected) {
      pass++;
      console.log(`  PASS ${base}`);
    } else {
      fail++;
      console.log(`  FAIL ${base}`);
      if (!result.ok) reportDiagnostics(result.diagnostics);
      else {
        console.log('    --- expected ---');
        console.log(expected.replace(/\n/g, '\n    '));
        console.log('    --- actual ---');
        console.log(actual.replace(/\n/g, '\n    '));
      }
    }
  }
  console.log('');
  console.log(`${pass} passed, ${fail} failed, ${pass + fail} total`);
  if (fail > 0) process.exit(1);
}

function cmdCompress(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('compress <file.py> [--out f]');
  const src = readSource(file);
  const result = transpilePythonToEml(src);
  if (!result.ok) {
    console.error(`compress failed: ${result.error}`);
    process.exit(1);
  }
  emitOut(result.eml, flag(a, 'out', 'o'));
}

function cmdRoundtrip(a: ParsedArgs): void {
  const file = a.positionals[0];
  if (!file) return usageError('roundtrip <file.eml | file.py>');
  const src = readSource(file);
  const rt = file.endsWith('.py') ? roundTripFromPython(src) : roundTripFromEml(src);
  console.log(`roundtrip ${file}: ${rt.ok ? 'OK ✓' : 'MISMATCH ✗'}`);
  console.log(`  ${rt.message}`);
  if (!rt.ok || flag(a, 'verbose', 'v')) {
    for (const [k, v] of Object.entries(rt.steps)) {
      console.log(`  --- ${k} ---`);
      console.log('  ' + v.replace(/\n/g, '\n  ').trimEnd());
    }
  }
  if (!rt.ok) process.exit(1);
}

function printSuggestion(s: Suggestion): void {
  const mark = s.validated ? '✓ validated' : '✗ rejected';
  console.log(`  [${mark} · ${s.source} · ${s.confidence}]`);
  console.log('    EML:');
  console.log('      ' + s.eml.replace(/\n/g, '\n      '));
  if (s.compiledPython) {
    console.log('    → compiles to:');
    console.log('      ' + s.compiledPython.replace(/\n/g, '\n      '));
  }
  if (s.rationale) console.log(`    why: ${s.rationale}`);
  console.log(`    ${s.validationDetail}`);
  console.log('');
}

async function cmdSuggest(a: ParsedArgs): Promise<void> {
  const file = a.positionals[0];
  if (!file) return usageError('suggest <file.py> [--out f] [--always-ai]');
  const out = flag(a, 'out', 'o');
  // Iron rule 4: never overwrite source. --out must resolve to a different file.
  if (typeof out === 'string' && resolve(out) === resolve(file)) {
    console.error(`error: --out must not be the source file (${file}); EML is written to a separate file`);
    process.exit(1);
  }
  const src = readSource(file);
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  const llm = hasKey ? new ClaudeClient() : undefined;

  let result;
  try {
    result = await suggestEml(src, { llm, alwaysAskLlm: Boolean(flag(a, 'always-ai')) });
  } catch (e) {
    console.error(`error: suggestion failed: ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 1;
    return;
  }

  console.log(`suggest ${file}:`);
  console.log('');
  if (result.llmError) {
    console.log(`  ⚠ AI backend unavailable (${result.llmError}); showing deterministic suggestions only`);
    console.log('');
  }
  if (result.suggestions.length === 0) {
    console.log('  (no EML suggestions — not expressible in the current subset)');
    if (!llm) console.log('  hint: set ANTHROPIC_API_KEY to enable AI-assisted suggestions for non-subset Python.');
    return;
  }
  for (const s of result.suggestions) printSuggestion(s);

  if (typeof out === 'string') {
    const best = result.suggestions.find((s) => s.validated);
    if (!best) {
      console.error('error: no validated suggestion to write');
      process.exitCode = 1;
      return;
    }
    mkdirSync(dirname(out) || '.', { recursive: true });
    writeFileSync(out, best.eml.endsWith('\n') ? best.eml : best.eml + '\n');
    console.log(`wrote validated suggestion to ${out}`);
  }
}

function usageError(usage: string): void {
  console.error(`usage: eml ${usage}`);
  process.exit(1);
}

function printHelp(): void {
  console.log(`eml — EML 2026 MVP transpiler CLI

Usage:
  eml parse <file> [--out f]         Parse to normalized AST (JSON)
  eml ast <file> [--out f]           Alias of parse
  eml transpile <file> [--out f]     Transpile EML/Py+ to Python
  eml transpile <file> --target cpp  Transpile EML/C+++ to C++ (Phase 4 prototype)
  eml run <file>                     Transpile and execute via python
  eml cts <file> [--out f]           Emit the EML semantic table (CTS JSON)
  eml check <file>                   Report diagnostics only
  eml explain <file>                 Human-readable symbol + node explanation
  eml compress <file.py> [--out f]   Reverse: Python (subset) -> EML/Py+
  eml suggest <file.py> [--out f]    AI-assisted Python -> EML, round-trip validated
  eml roundtrip <file> [-v]          EML->Py->EML->Py (or Py->EML->Py) fixpoint check
  eml crystallize <file> [--cache=p] Crystallize @cold logic into a persistent cache
  eml bugs <file> [--run] [--trace=f] [--json]  Classify errors (5 levels) mapped to EML source
  eml trace <file> [--out f] [--run] EML phosphor-jsonl-v1 execution trace (interp;
                                     --run adds an eml:equiv check vs real Python)
  eml test [--dir d]                 Run golden fixtures (default tests/fixtures); the practical
                                     grammar-mapping conformance check (docs/conformance.md).

  --cache[=path]                     preview against a persistent crystallization
                                     cache (default .eml-cache/crystal.json, must end .json).
                                     Only 'crystallize' commits; transpile/run/cts/explain
                                     preview read-only. Use --cache=path for a custom file.
`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const a = parseArgs(argv.slice(1));
  switch (command) {
    case 'parse':
      return cmdParse(a);
    case 'ast':
      return cmdAst(a);
    case 'transpile':
      return cmdTranspile(a);
    case 'run':
      return cmdRun(a);
    case 'cts':
      return cmdCts(a);
    case 'check':
      return cmdCheck(a);
    case 'explain':
      return cmdExplain(a);
    case 'compress':
      return cmdCompress(a);
    case 'roundtrip':
      return cmdRoundtrip(a);
    case 'suggest':
      return cmdSuggest(a);
    case 'crystallize':
      return cmdCrystallize(a);
    case 'bugs':
      return cmdBugs(a);
    case 'trace':
      return cmdTrace(a);
    case 'test':
      return cmdTest(a);
    case undefined:
    case '-h':
    case '--help':
    case 'help':
      return printHelp();
    default:
      console.error(`error: unknown command '${command}'`);
      printHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  // Set exitCode (don't process.exit) so in-flight sockets drain cleanly —
  // a synchronous exit during SDK/undici teardown can abort with a libuv error.
  process.exitCode = 1;
});
