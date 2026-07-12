/**
 * @eml/interp — a deterministic, browser-safe interpreter for the EML supported
 * subset that doubles as a PHOSPHOR `phosphor-jsonl-v1` trace producer.
 *
 * WHY THIS EXISTS (the iron rule: "PHOSPHOR trace is the execution-truth layer,
 * not decorative UI"): the Cogni-Editor runs in the browser and cannot launch
 * Python, yet the whitepaper's workbench vision (§13.1) is "open → type EML →
 * see Python → EXECUTE → trace → explain". So we compute the program's REAL
 * values here, faithfully to CPython (see `values.ts`), and emit a trace as we
 * go. Faithfulness is not asserted, it is *gated*: `tests/interp.test.ts` runs
 * every runnable example through BOTH this interpreter and a real `python` and
 * fails if stdout differs. The CLI `eml trace` bakes that same equivalence check
 * into each artifact as an `eml:equiv` event. The interpreter never replaces the
 * transpiler — Python remains the execution target; this is a second, validated
 * implementation purely so a trace can exist without a runtime.
 *
 * Constructs a faithful interpreter cannot reproduce — numpy matrices (`<M>` /
 * `^T`) and asyncio temporal loops (`async`/`await`/`@temporal_loop`) — are not
 * executed: the interpreter records an `eml:unsupported` event and stops cleanly
 * (the CLI defers those programs to a real Python run). This module has zero node
 * imports; the only dependency that touches the filesystem (`@eml/trace/node`)
 * is never imported here.
 */
import type {
  Program,
  Statement,
  Expression,
  FunctionDef,
  Diagnostic,
} from '@eml/types';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { createEmitter, findAnomalies, type Emitter, type PhosphorEvent } from '@eml/trace';
import {
  type PyVal,
  PyError,
  INT,
  FLOAT,
  STR,
  BOOL,
  NONE,
  LIST,
  arith,
  power,
  compare,
  contains,
  truthy,
  pyStr,
  pyRepr,
  typeName,
  isHashable,
} from './values';

export { type PyVal, PyError } from './values';

export interface InterpOptions {
  /** Injectable clock for deterministic traces; defaults to wall-clock ISO-8601. */
  now?: () => string;
  /** Stream id stamped on every event (default 'eml'). */
  stream?: string;
  /** Source file label for the `eml:run:start` event. */
  file?: string;
  /** Hard cap on evaluation steps (loop iterations + calls) to bound the browser. */
  maxSteps?: number;
  /** Reuse an emitter (e.g. to fan trace events to a live sink); created if absent. */
  emitter?: Emitter;
}

export interface InterpResult {
  /** True iff the program ran to completion without a runtime error or an unsupported abort. */
  ok: boolean;
  /** Concatenated stdout, exactly as the transpiled Python's `print()` would produce it. */
  output: string;
  /** stdout split into lines (no trailing empty element). */
  outputLines: string[];
  /** The phosphor-jsonl-v1 event stream. */
  events: PhosphorEvent[];
  /** Runtime error (Python exception class + message), if execution faulted. */
  error?: { type: string; message: string };
  /** Constructs that prevented full execution (numpy / temporal). */
  unsupported: string[];
  /** Error-severity transpile diagnostics, if the program did not compile. */
  diagnostics: Diagnostic[];
}

const DEFAULT_MAX_STEPS = 5_000_000;
const RECURSION_LIMIT = 1000;

/** Signal used to unwind a `return` out of a function body. */
class ReturnSignal {
  constructor(public readonly value: PyVal) {}
}
/** Signal raised when a construct cannot be faithfully interpreted. */
class Unsupported {
  constructor(
    public readonly construct: string,
    public readonly reason: string,
  ) {}
}
/** Signal raised when the step budget is exhausted (browser safety). */
class StepLimit {
  constructor(public readonly steps: number) {}
}

interface Scope {
  vars: Map<string, PyVal>;
  parent?: Scope;
  /**
   * Names that are statically local to this (function) frame — assigned somewhere
   * in the body. Reading one before it is bound is an UnboundLocalError, and it
   * must NOT fall through to an enclosing/module binding (Python's rule).
   */
  locals?: Set<string>;
}

/** Interpret EML source: transpile to resolve the AST, then execute. */
export function interpret(source: string, opts: InterpOptions = {}): InterpResult {
  const transpiled = transpileEmlToPython(source);
  const errors = transpiled.diagnostics.filter((d) => d.severity === 'error');
  const emitter = opts.emitter ?? createEmitter({ stream: opts.stream ?? 'eml', now: opts.now });

  if (errors.length > 0) {
    emitter.emit('eml:compile:error', { count: errors.length, codes: errors.map((d) => d.code) });
    return {
      ok: false,
      output: '',
      outputLines: [],
      events: [...emitter.events],
      unsupported: [],
      diagnostics: errors,
    };
  }
  return runProgram(transpiled.ast, emitter, opts, errors);
}

/** Execute an already-resolved program (every OverlayAssign rewritten). */
export function interpretProgram(program: Program, opts: InterpOptions = {}): InterpResult {
  const emitter = opts.emitter ?? createEmitter({ stream: opts.stream ?? 'eml', now: opts.now });
  return runProgram(program, emitter, opts, []);
}

function runProgram(
  program: Program,
  emitter: Emitter,
  opts: InterpOptions,
  diagnostics: Diagnostic[],
): InterpResult {
  const maxSteps = opts.maxSteps ?? DEFAULT_MAX_STEPS;
  const out: string[] = [];
  const unsupported: string[] = [];
  const module: Scope = { vars: new Map() };
  /** functools.cache emulation for @cold (non-async) functions, keyed by repr(args). */
  const coldCache = new Map<string, PyVal>();
  let steps = 0;
  let depth = 0;
  let error: InterpResult['error'];

  const tick = (): void => {
    if (++steps > maxSteps) throw new StepLimit(steps);
  };

  const write = (text: string): void => {
    out.push(text);
    emitter.emit('eml:output', { text });
  };

  // ── Expression evaluation ──────────────────────────────────────────────────
  const evalExpr = (expr: Expression, scope: Scope): PyVal => {
    switch (expr.type) {
      case 'NumberLiteral':
        // A literal is an int unless it carries a '.' / exponent (matches lexer).
        return /[.eE]/.test(expr.raw) ? FLOAT(expr.value) : INT(BigInt(expr.raw));
      case 'StringLiteral':
        return STR(expr.value);
      case 'Identifier': {
        // Functions are first-class values bound in their defining scope (see the
        // FunctionDef case), so a plain name lookup resolves them — including a
        // function passed as an argument (e.g. `run_temporal(wait_ready, …)`).
        const v = readVar(scope, expr.name);
        if (v !== undefined) return v;
        throw new PyError('NameError', `name '${expr.name}' is not defined`);
      }
      case 'Power': {
        const base = evalExpr(expr.base, scope);
        const exp = evalExpr(expr.exponent, scope);
        // CPython returns a COMPLEX for a negative base ** non-integer exponent;
        // we have no complex type, so defer rather than emit a fabricated 'nan'.
        const negBase =
          (base.k === 'int' && base.v < 0n) || (base.k === 'float' && base.v < 0);
        if (negBase && exp.k === 'float' && !Number.isInteger(exp.v)) {
          throw new Unsupported(
            'complex power',
            'negative base ** non-integer exponent yields a complex number (real Python only)',
          );
        }
        return power(base, exp);
      }
      case 'Binary':
        return arith(expr.op, evalExpr(expr.left, scope), evalExpr(expr.right, scope));
      case 'Comparison':
        return compare(expr.op, evalExpr(expr.left, scope), evalExpr(expr.right, scope));
      case 'Conditional':
        return truthy(evalExpr(expr.test, scope))
          ? evalExpr(expr.consequent, scope)
          : evalExpr(expr.alternate, scope);
      case 'List':
        return LIST(expr.elements.map((e) => evalExpr(e, scope)));
      case 'Membership':
        return contains(evalExpr(expr.element, scope), evalExpr(expr.collection, scope));
      case 'Range':
        return LIST(rangeInts(expr, scope));
      case 'Sum':
        return evalSum(expr, scope);
      case 'Call':
        return evalCall(expr, scope);
      case 'Matrix':
        throw new Unsupported('<M> matrix', 'numpy arrays run only under a real Python runtime');
      case 'Transpose':
        throw new Unsupported('^T transpose', 'numpy transpose runs only under a real Python runtime');
      case 'Await':
        throw new Unsupported('await', 'asyncio temporal loops run only under a real Python runtime');
    }
  };

  /** Materialize an inclusive/exclusive integer range to a list of ints. */
  const rangeInts = (
    expr: Extract<Expression, { type: 'Range' }>,
    scope: Scope,
  ): PyVal[] => {
    // Python range() accepts int and bool (bool is an int subtype) but not float.
    const toIdx = (v: PyVal): bigint => {
      if (v.k === 'int') return v.v;
      if (v.k === 'bool') return v.v ? 1n : 0n;
      throw new PyError('TypeError', `'${typeName(v)}' object cannot be interpreted as an integer`);
    };
    const start = toIdx(evalExpr(expr.start, scope));
    const endN = toIdx(evalExpr(expr.end, scope));
    const stop = expr.inclusiveEnd ? endN + 1n : endN; // EML [a:b] is inclusive
    const items: PyVal[] = [];
    for (let i = start; i < stop; i++) {
      tick();
      items.push(INT(i));
    }
    return items;
  };

  /** Materialize a `for ... in <iterable>` target into concrete items — Python
   *  iterates lists element-by-element and strings character-by-character. */
  const iterableItems = (v: PyVal): PyVal[] => {
    if (v.k === 'list') return v.v;
    if (v.k === 'str') return [...v.v].map((ch) => STR(ch));
    throw new PyError('TypeError', `'${typeName(v)}' object is not iterable`);
  };

  const evalSum = (expr: Extract<Expression, { type: 'Sum' }>, scope: Scope): PyVal => {
    const items = rangeInts(expr.range, scope);
    let acc: PyVal = INT(0n); // Python sum() starts at int 0
    for (const item of items) {
      tick();
      const iterScope: Scope = { vars: new Map([[expr.iterator.name, item]]), parent: scope };
      acc = arith('+', acc, evalExpr(expr.expr, iterScope));
    }
    emitter.emit('eml:sum', {
      iterator: expr.iterator.name,
      count: items.length,
      result: pyRepr(acc),
    });
    return acc;
  };

  const evalCall = (expr: Extract<Expression, { type: 'Call' }>, scope: Scope): PyVal => {
    const name = expr.callee.name;
    const args = expr.args.map((a) => evalExpr(a, scope));
    // Resolve the callee by lexical lookup (functions are values in their defining
    // scope), falling back to a supported builtin when the name is unbound.
    const callee = readVar(scope, name);
    if (callee === undefined) return callBuiltin(name, args);
    if (callee.k !== 'func' || callee.def === undefined) {
      throw new PyError('TypeError', `'${typeName(callee)}' object is not callable`);
    }
    const fn = callee.def as FunctionDef;
    if (fn.isAsync) throw new Unsupported('async function', `'${name}' is async (temporal runtime only)`);

    // @cold non-async functions are emitted with @functools.cache; emulate it so
    // the trace (and any side effects like prints) match Python exactly: a cache
    // hit does NOT re-run the body.
    const cacheable = fn.temperature === 'cold';
    let key = '';
    if (cacheable) {
      // functools.cache requires hashable args; a list arg raises at call time.
      const bad = args.find((a) => !isHashable(a));
      if (bad) throw new PyError('TypeError', `unhashable type: '${typeName(bad)}'`);
      key = `${name}(${args.map(pyRepr).join(',')})`;
      if (coldCache.has(key)) {
        const cached = coldCache.get(key)!;
        emitter.emit('eml:cache:hit', { fn: name, args: args.map(pyRepr), result: pyRepr(cached) });
        return cached;
      }
    }

    if (++depth > RECURSION_LIMIT) {
      depth--;
      throw new PyError('RecursionError', 'maximum recursion depth exceeded');
    }
    tick();
    emitter.emit('eml:call', { fn: name, args: args.map(pyRepr), temperature: fn.temperature ?? 'neutral' });
    // Lexical scoping: free variables resolve through the function's DEFINING
    // scope (its closure), not the caller's. Python also computes binding scope
    // statically — a name assigned anywhere in the body is local for the WHOLE
    // body, so a read before assignment is an UnboundLocalError (it must not see
    // an enclosing/module binding). Seed `locals` with those names.
    const local: Scope = {
      vars: new Map(),
      parent: callee.closure as Scope,
      locals: localNames(fn.body),
    };
    fn.params.forEach((p, i) => local.vars.set(p.name, args[i] ?? NONE));
    let result: PyVal = NONE;
    try {
      for (const s of fn.body) execStmt(s, local);
    } catch (e) {
      if (e instanceof ReturnSignal) result = e.value;
      else {
        depth--;
        throw e;
      }
    }
    depth--;
    if (cacheable) {
      emitter.emit('eml:cache:miss', { fn: name, args: args.map(pyRepr) });
      coldCache.set(key, result);
    }
    emitter.emit('eml:return', { fn: name, value: pyRepr(result) });
    return result;
  };

  const callBuiltin = (name: string, args: PyVal[]): PyVal => {
    switch (name) {
      case 'abs': {
        const a = need(args, 0, name);
        if (a.k === 'int') return INT(a.v < 0n ? -a.v : a.v);
        if (a.k === 'bool') return INT(a.v ? 1n : 0n); // bool is an int subtype
        if (a.k === 'float') return FLOAT(Math.abs(a.v));
        throw new PyError('TypeError', `bad operand type for abs(): '${typeName(a)}'`);
      }
      case 'len': {
        const a = need(args, 0, name);
        if (a.k === 'str') return INT(BigInt([...a.v].length));
        if (a.k === 'list') return INT(BigInt(a.v.length));
        throw new PyError('TypeError', `object of type '${typeName(a)}' has no len()`);
      }
      case 'int': {
        const a = args[0] ?? INT(0n);
        if (a.k === 'int') return a;
        if (a.k === 'bool') return INT(a.v ? 1n : 0n);
        if (a.k === 'float') return INT(BigInt(Math.trunc(a.v)));
        if (a.k === 'str') {
          const t = a.v.trim();
          if (!/^[+-]?\d+$/.test(t)) throw new PyError('ValueError', `invalid literal for int() with base 10: ${pyRepr(a)}`);
          return INT(BigInt(t));
        }
        throw new PyError('TypeError', `int() argument must be a string or a number, not '${typeName(a)}'`);
      }
      case 'float': {
        const a = args[0] ?? FLOAT(0);
        if (a.k === 'float') return a;
        if (a.k === 'int') return FLOAT(Number(a.v));
        if (a.k === 'bool') return FLOAT(a.v ? 1 : 0);
        if (a.k === 'str') {
          const n = Number(a.v.trim());
          if (Number.isNaN(n) && !/nan/i.test(a.v)) throw new PyError('ValueError', `could not convert string to float: ${pyRepr(a)}`);
          return FLOAT(n);
        }
        throw new PyError('TypeError', `float() argument must be a string or a number, not '${typeName(a)}'`);
      }
      case 'str':
        return STR(args.length === 0 ? '' : pyStr(need(args, 0, name)));
      case 'min':
      case 'max':
        return minmax(name, args);
      case 'sum': {
        const a = need(args, 0, name);
        if (a.k !== 'list') throw new PyError('TypeError', `'${typeName(a)}' object is not iterable`);
        let acc: PyVal = args[1] ?? INT(0n);
        for (const x of a.v) acc = arith('+', acc, x);
        return acc;
      }
      default:
        // The temporal runtime intrinsics are "known but unsupported" — defer to
        // real Python. Any other unbound callee is a NameError, like CPython.
        if (name === 'run_temporal' || name === 'temporal_wait') {
          throw new Unsupported(`call ${name}()`, 'temporal runtime intrinsic — real Python only');
        }
        throw new PyError('NameError', `name '${name}' is not defined`);
    }
  };

  // ── Statement execution ────────────────────────────────────────────────────
  const execStmt = (stmt: Statement, scope: Scope): void => {
    switch (stmt.type) {
      case 'FunctionDef':
        // Bind a first-class function value capturing the DEFINING scope, so it
        // closes over enclosing locals (nested defs) and is callable by name.
        assign(scope, stmt.name, { k: 'func', name: stmt.name, def: stmt, closure: scope });
        emitter.emit('eml:def', {
          fn: stmt.name,
          params: stmt.params.map((p) => p.name),
          temperature: stmt.temperature ?? 'neutral',
          async: !!stmt.isAsync,
        });
        return;
      case 'Assignment': {
        const v = evalExpr(stmt.value, scope);
        assign(scope, stmt.target.name, v);
        emitter.emit('eml:assign', { name: stmt.target.name, value: pyRepr(v), declares: stmt.declares });
        return;
      }
      case 'AugmentedAssign': {
        const cur = readVar(scope, stmt.target.name);
        if (cur === undefined) throw new PyError('NameError', `name '${stmt.target.name}' is not defined`);
        const v = arith(stmt.op, cur, evalExpr(stmt.value, scope));
        assign(scope, stmt.target.name, v);
        emitter.emit('eml:augment', { name: stmt.target.name, op: stmt.op, value: pyRepr(v) });
        return;
      }
      case 'Output': {
        write(pyStr(evalExpr(stmt.value, scope)));
        return;
      }
      case 'ExpressionStatement':
        evalExpr(stmt.expression, scope);
        return;
      case 'Return':
        throw new ReturnSignal(stmt.value ? evalExpr(stmt.value, scope) : NONE);
      case 'OverlayAssign':
        // Should never reach the interpreter — the semantic pass resolves these.
        throw new Unsupported('OverlayAssign', 'unresolved overlay assignment (internal)');
      case 'If': {
        if (truthy(evalExpr(stmt.test, scope))) {
          for (const s of stmt.body) execStmt(s, scope);
        } else {
          for (const s of stmt.orelse) execStmt(s, scope);
        }
        return;
      }
      case 'While': {
        while (truthy(evalExpr(stmt.test, scope))) {
          tick(); // bounds runaway loops against maxSteps — same role as rangeInts/evalSum
          for (const s of stmt.body) execStmt(s, scope);
        }
        return;
      }
      case 'ForIn': {
        const items = iterableItems(evalExpr(stmt.iterable, scope));
        for (const item of items) {
          tick();
          assign(scope, stmt.target.name, item);
          for (const s of stmt.body) execStmt(s, scope);
        }
        return;
      }
    }
  };

  // ── Run ────────────────────────────────────────────────────────────────────
  emitter.emit('eml:run:start', { ...(opts.file ? { file: opts.file } : {}), statements: program.body.length });
  try {
    for (const s of program.body) execStmt(s, module);
    emitter.emit('eml:run:done', {
      ok: true,
      outputs: out.length,
      anomalies: findAnomalies(emitter.events).length,
    });
    return finalize(true);
  } catch (e) {
    if (e instanceof Unsupported) {
      unsupported.push(e.construct);
      emitter.emit('eml:unsupported', { construct: e.construct, reason: e.reason });
      emitter.emit('eml:run:incomplete', { reason: 'unsupported', construct: e.construct });
      return finalize(false);
    }
    if (e instanceof StepLimit) {
      error = { type: 'StepLimitExceeded', message: `evaluation exceeded ${maxSteps} steps` };
      emitter.emit('eml:run:error', { error: error.type, message: error.message });
      return finalize(false);
    }
    if (e instanceof PyError) {
      error = { type: e.pyType, message: e.message };
      emitter.emit('eml:run:error', { error: e.pyType, message: e.message });
      return finalize(false);
    }
    if (e instanceof ReturnSignal) {
      // `return` at module scope: Python raises SyntaxError at compile, but our
      // grammar lets it parse; treat as a clean stop rather than crashing the host.
      emitter.emit('eml:run:incomplete', { reason: 'return-at-module-scope' });
      return finalize(false);
    }
    throw e;
  }

  function finalize(ok: boolean): InterpResult {
    // Each `print()` (Output) emits its value followed by a newline.
    const output = out.map((s) => s + '\n').join('');
    return {
      ok,
      output,
      outputLines: output === '' ? [] : output.replace(/\n$/, '').split('\n'),
      events: [...emitter.events],
      ...(error ? { error } : {}),
      unsupported,
      diagnostics,
    };
  }
}

// ── Scope helpers ──────────────────────────────────────────────────────────────
/**
 * Resolve a name up the scope chain. Throws UnboundLocalError if the name is a
 * static local of a frame but not yet bound (Python semantics: a function-local
 * name must NOT fall through to an enclosing/module binding). Returns undefined
 * only if the name is unknown everywhere (caller decides function-ref / NameError).
 */
function readVar(scope: Scope, name: string): PyVal | undefined {
  for (let s: Scope | undefined = scope; s; s = s.parent) {
    const v = s.vars.get(name);
    if (v !== undefined) return v;
    if (s.locals?.has(name)) {
      throw new PyError(
        'UnboundLocalError',
        `cannot access local variable '${name}' where it is not associated with a value`,
      );
    }
  }
  return undefined;
}
function assign(scope: Scope, name: string, value: PyVal): void {
  scope.vars.set(name, value);
}

/**
 * Names bound anywhere in a function body — Python's static locals. Recurses
 * into if/while/for bodies (they don't introduce a new scope in real Python),
 * including a for-loop's own target, which stays bound after the loop ends.
 */
function localNames(body: Statement[]): Set<string> {
  const out = new Set<string>();
  const visit = (stmts: Statement[]): void => {
    for (const s of stmts) {
      if (s.type === 'Assignment' || s.type === 'AugmentedAssign') out.add(s.target.name);
      else if (s.type === 'FunctionDef') out.add(s.name); // a nested def binds a local
      else if (s.type === 'If') {
        visit(s.body);
        visit(s.orelse);
      } else if (s.type === 'While') visit(s.body);
      else if (s.type === 'ForIn') {
        out.add(s.target.name);
        visit(s.body);
      }
    }
  };
  visit(body);
  return out;
}

function need(args: PyVal[], i: number, name: string): PyVal {
  const a = args[i];
  if (a === undefined) throw new PyError('TypeError', `${name}() missing required argument`);
  return a;
}

function minmax(name: 'min' | 'max', args: PyVal[]): PyVal {
  let items: PyVal[];
  if (args.length === 1 && args[0]!.k === 'list') items = (args[0] as { k: 'list'; v: PyVal[] }).v;
  else items = args;
  if (items.length === 0) throw new PyError('ValueError', `${name}() arg is an empty sequence`);
  let best = items[0]!;
  // Replace only on a STRICT change (max: x > best, min: x < best) so a tie keeps
  // the first occurrence — exactly as Python's min()/max() do.
  for (const x of items.slice(1)) {
    const c = compare(name === 'max' ? '>' : '<', x, best);
    if (c.k === 'bool' && c.v) best = x;
  }
  return best;
}
