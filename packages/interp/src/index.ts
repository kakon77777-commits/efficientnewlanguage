/**
 * @eml/interp — a deterministic, browser-safe interpreter for the EML supported
 * subset that doubles as an EML `phosphor-jsonl-v1` trace producer (a frozen
 * compatibility wire-format id, not an external runtime dependency).
 *
 * WHY THIS EXISTS (the iron rule: "trace is the execution-truth layer, not
 * decorative UI"): the EML Workbench runs in the browser and cannot launch
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
  AssignTarget,
  ExceptHandler,
  ClassDef,
  Diagnostic,
} from '@eml/types';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { createEmitter, findAnomalies, type Emitter, type TraceEvent } from '@eml/trace';
import {
  type PyVal,
  PyError,
  INT,
  FLOAT,
  STR,
  BOOL,
  NONE,
  LIST,
  TUPLE,
  DICT,
  SET,
  canonicalKey,
  arith,
  power,
  compare,
  contains,
  truthy,
  pyStr,
  pyRepr,
  typeName,
  isHashable,
  percentFormat,
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
  events: TraceEvent[];
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
/** Signals used to unwind `break`/`continue` to the nearest enclosing loop
 *  (caught in `execStmt`'s While/ForIn cases, NOT at the function-call boundary
 *  like ReturnSignal — must not escape past the loop). */
class BreakSignal {}
class ContinueSignal {}

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
  // `True`/`False`/`None` lex as plain identifiers (Python keywords, but EML
  // never reserves them) — the emitter passes them through unchanged since
  // real Python already binds them, but this interpreter has its own scope
  // and never pre-declared them, so a bare literal reference (as opposed to
  // one produced by a comparison/`and`/`or`) threw a spurious NameError.
  module.vars.set('True', BOOL(true));
  module.vars.set('False', BOOL(false));
  module.vars.set('None', NONE);
  /** functools.cache emulation for @cold (non-async) functions, keyed by repr(args). */
  const coldCache = new Map<string, PyVal>();
  let steps = 0;
  let depth = 0;
  let error: InterpResult['error'];
  /** The exception currently being handled by an `except` block, for a bare
   *  `raise` re-raise (Phase 7d). Saved/restored around each handler so nested
   *  try/except blocks don't clobber an outer one's in-flight exception. */
  let currentException: PyError | undefined;

  const tick = (): void => {
    if (++steps > maxSteps) throw new StepLimit(steps);
  };

  const write = (text: string, end = '\n'): void => {
    out.push(text + end);
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
      case 'Binary': {
        const left = evalExpr(expr.left, scope);
        const right = evalExpr(expr.right, scope);
        // `%` on a string is Python's printf-style string-formatting operator
        // (`"%s" % (a, b)`), not numeric modulo — a tuple right-hand side
        // supplies multiple substitution values in order; anything else is
        // treated as the single value (verified against real Python: `'%s' %
        // 5` and `'%s' % (5,)` are identical). Phase 9 item 3a.
        if (expr.op === '%' && left.k === 'str') {
          const args = right.k === 'tuple' ? right.v : [right];
          return STR(percentFormat(left.v, args));
        }
        if (expr.op === '%' && right.k === 'str') {
          // Left isn't a string but right is — a genuine cross-type TypeError
          // in real Python (`5 % 'x'`), verified directly, not `arith()`'s own
          // generic (and here, wrong) numeric-only message.
          throw new PyError('TypeError', `unsupported operand type(s) for %: '${typeName(left)}' and 'str'`);
        }
        return arith(expr.op, left, right);
      }
      case 'Comparison':
        return compare(expr.op, evalExpr(expr.left, scope), evalExpr(expr.right, scope));
      case 'Logical': {
        // Short-circuit: Python's `and`/`or` return an OPERAND, not always a
        // bool, and the right side is never evaluated unless needed.
        const left = evalExpr(expr.left, scope);
        if (expr.op === 'and') return truthy(left) ? evalExpr(expr.right, scope) : left;
        return truthy(left) ? left : evalExpr(expr.right, scope);
      }
      case 'Not':
        // Unlike `and`/`or`, `not` always returns a real bool.
        return BOOL(!truthy(evalExpr(expr.operand, scope)));
      case 'Conditional':
        return truthy(evalExpr(expr.test, scope))
          ? evalExpr(expr.consequent, scope)
          : evalExpr(expr.alternate, scope);
      case 'List':
        return LIST(expr.elements.map((e) => evalExpr(e, scope)));
      case 'Tuple':
        return TUPLE(expr.elements.map((e) => evalExpr(e, scope)));
      case 'Membership':
        return contains(evalExpr(expr.element, scope), evalExpr(expr.collection, scope));
      case 'Range':
        return LIST(rangeInts(expr, scope));
      case 'Sum':
        return evalSum(expr, scope);
      case 'ListComp':
        return evalListComp(expr, scope);
      case 'Call':
        return evalCall(expr, scope);
      case 'Matrix':
        throw new Unsupported('<M> matrix', 'numpy arrays run only under a real Python runtime');
      case 'Transpose':
        throw new Unsupported('^T transpose', 'numpy transpose runs only under a real Python runtime');
      case 'Await':
        throw new Unsupported('await', 'asyncio temporal loops run only under a real Python runtime');
      case 'Dict':
        return DICT(expr.entries.map((e) => ({ key: evalExpr(e.key, scope), value: evalExpr(e.value, scope) })));
      case 'Set':
        return SET(expr.elements.map((e) => evalExpr(e, scope)));
      case 'Subscript': {
        const obj = evalExpr(expr.object, scope);
        if (expr.index.type === 'Slice') {
          const start = expr.index.start ? evalExpr(expr.index.start, scope) : undefined;
          const stop = expr.index.stop ? evalExpr(expr.index.stop, scope) : undefined;
          return sliceGet(obj, start, stop);
        }
        return subscriptGet(obj, evalExpr(expr.index, scope));
      }
      case 'Slice':
        // Only ever meaningful as a Subscript's `index` (intercepted above before
        // falling through to a bare evalExpr call) — reaching this case bare would
        // be an EML-internal invariant violation, not a modeled Python error.
        throw new Error('internal error: bare Slice expression outside Subscript');
      case 'Attribute': {
        // A bare Identifier object may be an unbound module name (`math`) —
        // resolve via readVar (never throws) rather than evalExpr, so that
        // case still defers as Unsupported exactly as before Phase 7e. Any
        // other object shape (Subscript, Call, nested Attribute, ...) is
        // evaluated normally; if it turns out to be a real instance
        // (Phase 7e), read from its attrs — otherwise defer.
        const objVal = expr.object.type === 'Identifier' ? readVar(scope, expr.object.name) : evalExpr(expr.object, scope);
        if (objVal !== undefined && objVal.k === 'instance') {
          const v = objVal.attrs.get(expr.attr);
          if (v === undefined) {
            throw new PyError('AttributeError', `'${objVal.className}' object has no attribute '${expr.attr}'`);
          }
          return v;
        }
        const objLabel = expr.object.type === 'Identifier' ? expr.object.name : 'value';
        throw new Unsupported(
          `read .${expr.attr}`,
          `attribute access on '${objLabel}' runs only under a real Python runtime (not modeled by the interpreter yet)`,
        );
      }
    }
  };

  /** Read an `AssignTarget` for an augmented-assign's current value (Phase 7b/7c). */
  const readTarget = (target: AssignTarget, scope: Scope): PyVal => {
    if (target.type === 'Identifier') {
      const v = readVar(scope, target.name);
      if (v === undefined) throw new PyError('NameError', `name '${target.name}' is not defined`);
      return v;
    }
    if (target.type === 'Subscript') {
      const obj = evalExpr(target.object, scope);
      if (target.index.type === 'Slice') {
        const start = target.index.start ? evalExpr(target.index.start, scope) : undefined;
        const stop = target.index.stop ? evalExpr(target.index.stop, scope) : undefined;
        return sliceGet(obj, start, stop);
      }
      return subscriptGet(obj, evalExpr(target.index, scope));
    }
    // Attribute target read (part of `+=` etc.) — same defer as evalExpr's Attribute case.
    return evalExpr(target, scope);
  };

  /** Write an `AssignTarget` (Phase 7b: Subscript; Phase 7c: Attribute). */
  const writeTarget = (target: AssignTarget, value: PyVal, scope: Scope): void => {
    if (target.type === 'Identifier') {
      assign(scope, target.name, value);
      return;
    }
    if (target.type === 'Subscript') {
      if (target.index.type === 'Slice') {
        // Real Python supports slice assignment (splicing an iterable into a
        // sub-range) — genuinely valid, just not modeled by this interpreter
        // (no corpus evidence needs it). Defer rather than silently misinterpreting
        // the Slice as a plain index.
        throw new Unsupported(
          'slice assignment',
          'obj[a:b] = ... runs only under a real Python runtime (not modeled by the interpreter yet)',
        );
      }
      subscriptSet(evalExpr(target.object, scope), evalExpr(target.index, scope), value);
      return;
    }
    // Attribute target write (`self.x = v` / `obj.x = v`, Phase 7e). Same
    // module-name leniency as evalExpr's Attribute case: a bare Identifier
    // object resolves via readVar (never throws), so an unbound module name
    // still defers as Unsupported rather than crashing with a NameError.
    const objVal = target.object.type === 'Identifier' ? readVar(scope, target.object.name) : evalExpr(target.object, scope);
    if (objVal !== undefined && objVal.k === 'instance') {
      objVal.attrs.set(target.attr, value);
      return;
    }
    const objLabel = target.object.type === 'Identifier' ? target.object.name : 'value';
    throw new Unsupported(
      `write .${target.attr}`,
      `attribute assignment on '${objLabel}' runs only under a real Python runtime (not modeled by the interpreter yet)`,
    );
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
    if (v.k === 'list' || v.k === 'tuple') return v.v;
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

  /** `[expr for x in iterable if cond]` (Phase 9) — mirrors `evalSum` but reuses
   *  `iterableItems()` (already generalizes over list/tuple/str, not just a numeric
   *  range) and collects into a list instead of summing, with an optional filter. */
  const evalListComp = (expr: Extract<Expression, { type: 'ListComp' }>, scope: Scope): PyVal => {
    const items = iterableItems(evalExpr(expr.iterable, scope));
    const result: PyVal[] = [];
    for (const item of items) {
      tick();
      const iterScope: Scope = { vars: new Map([[expr.iterator.name, item]]), parent: scope };
      if (expr.condition && !truthy(evalExpr(expr.condition, iterScope))) continue;
      result.push(evalExpr(expr.expr, iterScope));
    }
    return LIST(result);
  };

  const evalCall = (expr: Extract<Expression, { type: 'Call' }>, scope: Scope): PyVal => {
    if (expr.callee.type === 'Attribute') {
      // Same module-name leniency as evalExpr's Attribute case: resolve a
      // bare Identifier object via readVar (never throws), so an unbound
      // module name (`math.sqrt(x)`) still defers as Unsupported rather than
      // crashing with a NameError. If the object turns out to be a real
      // instance (Phase 7e), dispatch to its method — otherwise defer
      // (module calls / built-in container methods are real, correct Python
      // once emitted; the interpreter just doesn't model those yet).
      const objExpr = expr.callee.object;
      const objVal = objExpr.type === 'Identifier' ? readVar(scope, objExpr.name) : evalExpr(objExpr, scope);
      if (objVal !== undefined && objVal.k === 'instance') {
        return callMethod(objVal, expr.callee.attr, expr.args.map((a) => evalExpr(a, scope)));
      }
      const objLabel = objExpr.type === 'Identifier' ? objExpr.name : 'value';
      throw new Unsupported(
        `call ${objLabel}.${expr.callee.attr}()`,
        'attribute/method calls run only under a real Python runtime (not modeled by the interpreter yet)',
      );
    }
    const name = expr.callee.name;
    const args = expr.args.map((a) => evalExpr(a, scope));
    // Resolve the callee by lexical lookup (functions are values in their defining
    // scope), falling back to a supported builtin when the name is unbound.
    const callee = readVar(scope, name);
    if (callee === undefined) return callBuiltin(name, args);
    if (callee.k === 'class') return instantiateClass(callee, args);
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

  /** Look up a method by name in a class body (Phase 7e) — `undefined` if absent. */
  const findMethod = (def: ClassDef, methodName: string): FunctionDef | undefined =>
    def.body.find((s): s is FunctionDef => s.type === 'FunctionDef' && s.name === methodName);

  /**
   * `ClassName(args)` construction (Phase 7e): look up `__init__`, bind a
   * fresh instance as `self`, run its body, return the instance. No
   * `__init__` at all is a valid zero-arg construction (an empty instance);
   * extra args with no `__init__` to absorb them is a TypeError, mirroring
   * real Python's default `object.__init__`.
   */
  const instantiateClass = (cls: Extract<PyVal, { k: 'class' }>, args: PyVal[]): PyVal => {
    const def = cls.def as ClassDef;
    const instance: Extract<PyVal, { k: 'instance' }> = { k: 'instance', className: cls.name, classDef: def, attrs: new Map() };
    const init = findMethod(def, '__init__');
    if (init) {
      runMethodBody(instance, init, args);
    } else if (args.length > 0) {
      throw new PyError('TypeError', `${cls.name}() takes no arguments (${args.length} given)`);
    }
    return instance;
  };

  /** Dispatch `instance.methodName(args)` (Phase 7e) — AttributeError if the
   *  class defines no such method. */
  const callMethod = (instance: Extract<PyVal, { k: 'instance' }>, methodName: string, args: PyVal[]): PyVal => {
    const method = findMethod(instance.classDef as ClassDef, methodName);
    if (!method) {
      throw new PyError('AttributeError', `'${instance.className}' object has no attribute '${methodName}'`);
    }
    return runMethodBody(instance, method, args);
  };

  /**
   * Execute a method body with `self` bound to `instance` and the remaining
   * params bound to `args` — mirrors evalCall's function-call machinery
   * (recursion guard, tick, ReturnSignal) but WITHOUT @cold/@hot caching
   * (methods are excluded from the whole cold/hot analysis stack this round —
   * see semantic.ts's resolveMethod). Methods close over the top-level module
   * scope, not a captured lexical closure: `{k:'class', ...}` carries no
   * `closure` field (unlike `{k:'func', ...}`), a deliberate "minimal viable
   * OOP" simplification — a class nested inside a function whose methods
   * reference that function's locals is not modeled faithfully this round.
   */
  const runMethodBody = (instance: Extract<PyVal, { k: 'instance' }>, method: FunctionDef, args: PyVal[]): PyVal => {
    if (++depth > RECURSION_LIMIT) {
      depth--;
      throw new PyError('RecursionError', 'maximum recursion depth exceeded');
    }
    tick();
    const qualifiedName = `${instance.className}.${method.name}`;
    emitter.emit('eml:call', { fn: qualifiedName, args: args.map(pyRepr), temperature: 'neutral' });
    const local: Scope = { vars: new Map(), parent: module, locals: localNames(method.body) };
    const [selfParam, ...restParams] = method.params;
    if (selfParam) local.vars.set(selfParam.name, instance);
    restParams.forEach((p, i) => local.vars.set(p.name, args[i] ?? NONE));
    let result: PyVal = NONE;
    try {
      for (const s of method.body) execStmt(s, local);
    } catch (e) {
      if (e instanceof ReturnSignal) result = e.value;
      else {
        depth--;
        throw e;
      }
    }
    depth--;
    emitter.emit('eml:return', { fn: qualifiedName, value: pyRepr(result) });
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
        if (a.k === 'dict' || a.k === 'set') return INT(BigInt(a.v.size));
        throw new PyError('TypeError', `object of type '${typeName(a)}' has no len()`);
      }
      case 'set': {
        // Zero-arg only — `{}` is a dict literal (Python parity), so `set()` is
        // the only way to spell an empty set; `set(iterable)` conversion is out
        // of scope this round.
        if (args.length > 0) throw new Unsupported('set(iterable)', 'converting an iterable to a set is not modeled yet');
        return SET([]);
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
        writeTarget(stmt.target, v, scope);
        emitter.emit('eml:assign', { name: targetLabel(stmt.target), value: pyRepr(v), declares: stmt.declares });
        return;
      }
      case 'AugmentedAssign': {
        const cur = readTarget(stmt.target, scope);
        const v = arith(stmt.op, cur, evalExpr(stmt.value, scope));
        writeTarget(stmt.target, v, scope);
        emitter.emit('eml:augment', { name: targetLabel(stmt.target), op: stmt.op, value: pyRepr(v) });
        return;
      }
      case 'Output': {
        const end = stmt.end !== undefined ? pyStr(evalExpr(stmt.end, scope)) : '\n';
        write(pyStr(evalExpr(stmt.value, scope)), end);
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
          try {
            for (const s of stmt.body) execStmt(s, scope);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        return;
      }
      case 'ForIn': {
        const items = iterableItems(evalExpr(stmt.iterable, scope));
        for (const item of items) {
          tick();
          assign(scope, stmt.target.name, item);
          try {
            for (const s of stmt.body) execStmt(s, scope);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        return;
      }
      case 'Break':
        throw new BreakSignal();
      case 'Continue':
        throw new ContinueSignal();
      case 'Import':
        // No-op: the interpreter doesn't model real module objects, but a
        // program that imports something and never actually calls into it
        // should still run cleanly — only USE of the module defers (see
        // evalCall's/evalExpr's Attribute handling), not the import itself.
        return;
      case 'Try': {
        // Lean entirely on native JS try/finally: it already runs `finally`
        // exactly once regardless of success / matched-throw / unmatched-throw
        // / break-continue-return inside the body, and before a rethrown
        // exception continues propagating — a direct match for Python's own
        // `finally` guarantee, with zero manual pending-exception bookkeeping.
        try {
          try {
            for (const s of stmt.body) execStmt(s, scope);
          } catch (e) {
            if (e instanceof PyError) {
              const handler = stmt.handlers.find((h) => matchesHandler(h, e));
              if (handler) {
                const hScope: Scope = handler.name
                  ? { vars: new Map([[handler.name, STR(e.message)]]), parent: scope }
                  : scope;
                const prevException = currentException;
                currentException = e;
                try {
                  for (const s of handler.body) execStmt(s, hScope);
                } finally {
                  currentException = prevException;
                }
                return;
              }
            }
            // Wrong exception type, or a non-PyError signal (Break/Continue/
            // Return/Unsupported/StepLimit) — passes through untouched; the
            // outer `finally` below still runs before it keeps propagating.
            throw e;
          }
        } finally {
          for (const s of stmt.finallyBody) execStmt(s, scope);
        }
        return;
      }
      case 'Raise': {
        if (!stmt.exception) {
          if (!currentException) throw new PyError('RuntimeError', 'No active exception to re-raise');
          throw currentException;
        }
        const exc = stmt.exception;
        if (exc.type === 'Call' && exc.callee.type === 'Identifier') {
          const args = exc.args.map((a) => evalExpr(a, scope));
          throw new PyError(exc.callee.name, args.length > 0 ? pyStr(args[0]!) : '');
        }
        if (exc.type === 'Identifier' && readVar(scope, exc.name) === undefined) {
          // Not a bound variable — a bare exception class reference (`raise ValueError`).
          throw new PyError(exc.name, '');
        }
        // A bound variable (e.g. `raise e` from `except ... as e`), an
        // attribute-qualified exception class, or anything else — no real
        // exception-object model exists this round, so defer rather than
        // fabricate a wrong exception type/message.
        throw new Unsupported(
          'raise <expression>',
          'raising anything other than a bare `raise`, `raise ExceptionClass`, or `raise ExceptionClass("msg")` is not modeled by the interpreter yet',
        );
      }
      case 'With': {
        // Real __enter__/__exit__ protocol dispatch (Phase 9 item 6), reusing
        // the existing findMethod/runMethodBody machinery (Phase 7e) rather
        // than building new dispatch — no built-in context manager (like a
        // real `open()` file handle) is modeled, so this only works for a
        // user-defined class instance with both methods defined, matching
        // real Python's own protocol exactly (including its check ORDER —
        // verified directly: a value missing both methods reports "missed
        // __exit__ method" first, not __enter__).
        const ctxVal = evalExpr(stmt.contextExpr, scope);
        const exitMethod = ctxVal.k === 'instance' ? findMethod(ctxVal.classDef as ClassDef, '__exit__') : undefined;
        if (!exitMethod) {
          throw new PyError(
            'TypeError',
            `'${typeName(ctxVal)}' object does not support the context manager protocol (missed __exit__ method)`,
          );
        }
        const enterMethod = findMethod((ctxVal as Extract<PyVal, { k: 'instance' }>).classDef as ClassDef, '__enter__');
        if (!enterMethod) {
          throw new PyError(
            'TypeError',
            `'${typeName(ctxVal)}' object does not support the context manager protocol (missed __enter__ method)`,
          );
        }
        const instance = ctxVal as Extract<PyVal, { k: 'instance' }>;
        const entered = runMethodBody(instance, enterMethod, []);
        if (stmt.target) assign(scope, stmt.target.name, entered);
        try {
          for (const s of stmt.body) execStmt(s, scope);
          runMethodBody(instance, exitMethod, [NONE, NONE, NONE]);
        } catch (e) {
          if (e instanceof PyError) {
            // exc_type/exc_val as plain strings (not a real exception
            // object) — the same deliberate simplification `except`'s own
            // exception binding already uses; exc_tb is always NONE (no
            // traceback model exists anywhere in this interpreter).
            const suppressed = truthy(runMethodBody(instance, exitMethod, [STR(e.pyType), STR(e.message), NONE]));
            if (!suppressed) throw e;
          } else {
            // Break/Continue/Return/Unsupported/StepLimit — with is an
            // implicit finally, so __exit__ still runs before this
            // propagates, matching real Python's guarantee for non-exception
            // exits too.
            runMethodBody(instance, exitMethod, [NONE, NONE, NONE]);
            throw e;
          }
        }
        return;
      }
      case 'ClassDef':
        // Bind a first-class class value, parallel to how FunctionDef binds
        // {k:'func',...}. Methods are looked up from `def.body` by name at
        // call time (instantiateClass/callMethod), not pre-materialized —
        // see docs for why (no per-method closure is modeled this round).
        assign(scope, stmt.name, { k: 'class', name: stmt.name, def: stmt });
        emitter.emit('eml:classdef', {
          name: stmt.name,
          methods: stmt.body.filter((s): s is FunctionDef => s.type === 'FunctionDef').map((s) => s.name),
        });
        return;
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
    if (e instanceof BreakSignal || e instanceof ContinueSignal) {
      // A break/continue outside a loop is normally caught by the semantic
      // pass (E_BREAK_OUTSIDE_LOOP/E_CONTINUE_OUTSIDE_LOOP) before the
      // interpreter ever sees it; `interpretProgram()` skips that gate for an
      // already-resolved AST, so defend the same way ReturnSignal does above.
      emitter.emit('eml:run:incomplete', {
        reason: e instanceof BreakSignal ? 'break-outside-loop' : 'continue-outside-loop',
      });
      return finalize(false);
    }
    throw e;
  }

  function finalize(ok: boolean): InterpResult {
    // Each `write()` already embeds its own terminator (default '\n', or a
    // custom one from Output.end) — just join.
    const output = out.join('');
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

/** Whether `handler` catches `e` — exact `pyType` string match; `except:`
 *  (no type) and `except Exception:` both act as catch-all. No hierarchical
 *  matching (Phase 7d fidelity gap: `except ArithmeticError:` will not catch
 *  a `ZeroDivisionError` here, though it would in real transpiled Python). */
function matchesHandler(handler: ExceptHandler, e: PyError): boolean {
  if (!handler.exceptionType || handler.exceptionType === 'Exception') return true;
  return handler.exceptionType === e.pyType;
}

/** Human-readable trace label for an assignment target (Phase 7b: Identifier or Subscript). */
function targetLabel(target: AssignTarget): string {
  if (target.type === 'Identifier') return target.name;
  const objLabel = target.object.type === 'Identifier' ? target.object.name : '…';
  return `${objLabel}[…]`;
}

/** Resolve a list/str index, supporting Python negative indices; IndexError if out of range. */
function normalizeIndex(idx: PyVal, length: number, containerType: string): number {
  if (idx.k !== 'int' && idx.k !== 'bool') {
    throw new PyError('TypeError', `${containerType} indices must be integers, not ${typeName(idx)}`);
  }
  const raw = idx.k === 'bool' ? (idx.v ? 1 : 0) : Number(idx.v);
  const resolved = raw < 0 ? raw + length : raw;
  if (resolved < 0 || resolved >= length) {
    throw new PyError('IndexError', `${containerType} index out of range`);
  }
  return resolved;
}

/** `obj[index]` read (Phase 7b) — list/str (negative indices) + dict (KeyError). */
function subscriptGet(obj: PyVal, index: PyVal): PyVal {
  if (obj.k === 'list') return obj.v[normalizeIndex(index, obj.v.length, 'list')]!;
  // Read-only — `subscriptSet` intentionally has no 'tuple' case, so writing
  // through a tuple subscript still falls through to its existing "does not
  // support item assignment" error, which is already the correct Python
  // message for an immutable tuple.
  if (obj.k === 'tuple') return obj.v[normalizeIndex(index, obj.v.length, 'tuple')]!;
  if (obj.k === 'str') return STR(obj.v[normalizeIndex(index, obj.v.length, 'string')]!);
  if (obj.k === 'dict') {
    if (!isHashable(index)) throw new PyError('TypeError', `unhashable type: '${typeName(index)}'`);
    const entry = obj.v.get(canonicalKey(index));
    if (!entry) throw new PyError('KeyError', pyRepr(index));
    return entry.value;
  }
  throw new PyError('TypeError', `'${typeName(obj)}' object is not subscriptable`);
}

/** Resolve a slice bound's PyVal to a plain number (Phase 9) — int/bool only, like `normalizeIndex`. */
function sliceIndexNumber(v: PyVal): number {
  if (v.k === 'int') return Number(v.v);
  if (v.k === 'bool') return v.v ? 1 : 0;
  throw new PyError('TypeError', `slice indices must be integers, not ${typeName(v)}`);
}

/** Clamp a slice bound into `[0, length]`, resolving a negative index and defaulting to
 *  `fallback` when the bound is omitted — Python slicing never raises `IndexError` for an
 *  out-of-range bound, unlike a plain `obj[i]` subscript. */
function clampSliceBound(v: PyVal | undefined, length: number, fallback: number): number {
  if (v === undefined) return fallback;
  const raw = sliceIndexNumber(v);
  const resolved = raw < 0 ? raw + length : raw;
  return Math.max(0, Math.min(length, resolved));
}

/** `obj[start:stop]` read (Phase 9) — list/tuple/str only, no step form (see `SliceExpression`). */
function sliceGet(obj: PyVal, startVal: PyVal | undefined, stopVal: PyVal | undefined): PyVal {
  let length: number;
  if (obj.k === 'list' || obj.k === 'tuple') length = obj.v.length;
  else if (obj.k === 'str') length = [...obj.v].length;
  else throw new PyError('TypeError', `'${typeName(obj)}' object is not subscriptable`);
  const start = clampSliceBound(startVal, length, 0);
  const stop = clampSliceBound(stopVal, length, length);
  if (obj.k === 'str') return STR([...obj.v].slice(start, stop).join(''));
  if (obj.k === 'list') return LIST(obj.v.slice(start, stop));
  return TUPLE(obj.v.slice(start, stop));
}

/** `obj[index] = value` write (Phase 7b) — list (in place) + dict (insert-or-update). */
function subscriptSet(obj: PyVal, index: PyVal, value: PyVal): void {
  if (obj.k === 'list') {
    obj.v[normalizeIndex(index, obj.v.length, 'list')] = value;
    return;
  }
  if (obj.k === 'str') throw new PyError('TypeError', "'str' object does not support item assignment");
  if (obj.k === 'dict') {
    if (!isHashable(index)) throw new PyError('TypeError', `unhashable type: '${typeName(index)}'`);
    const ck = canonicalKey(index);
    const existing = obj.v.get(ck);
    obj.v.set(ck, { key: existing ? existing.key : index, value });
    return;
  }
  throw new PyError('TypeError', `'${typeName(obj)}' object does not support item assignment`);
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
      // A Subscript target (Phase 7b: `d[k] = v`) mutates an existing object —
      // it does not bind a new Python-function-local name, unlike a bare name.
      if ((s.type === 'Assignment' || s.type === 'AugmentedAssign') && s.target.type === 'Identifier') {
        out.add(s.target.name);
      } else if (s.type === 'FunctionDef') out.add(s.name); // a nested def binds a local
      else if (s.type === 'ClassDef') out.add(s.name); // a nested class binds a local too
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
