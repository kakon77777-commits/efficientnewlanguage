import type {
  Program,
  Statement,
  Expression,
  Diagnostic,
  FunctionDef,
  CtsFunction,
  ExceptHandler,
  ClassDef,
} from '@eml/types';
import { aliasIdentifier } from './emitter';
import { checkPurity, collectCalledNames, type PurityResult } from './purity';
import { hashFunction } from './crystallize';
import { computeImportance } from './importance';
import { classifyLoops, type LoopFact } from './loop-classifier';

export interface SemanticOptions {
  /** Names treated as already declared before analysis (used by transpileLine). */
  declared?: string[];
}

/** Per-function analysis without the crystallization `cached` flag (set later). */
export type FunctionInfo = Omit<CtsFunction, 'cached'>;

export interface SemanticResult {
  /** Resolved program: every OverlayAssign has become Assignment / AugmentedAssign. */
  program: Program;
  /** Deterministically ordered import statements, e.g. "import numpy as np". */
  imports: string[];
  diagnostics: Diagnostic[];
  /** Names bound at module scope (in first-seen order). */
  declaredNames: string[];
  /** EML symbols encountered, for metadata / CTS (in first-seen order). */
  symbolsUsed: string[];
  /** Per-function cold/hot + purity + importance analysis (Phase 2). */
  functions: FunctionInfo[];
  /** True when the program uses `@temporal_loop` (Phase 3 — needs the temporal runtime). */
  usesTemporal: boolean;
  /** Classified loops (loopKind + determinism/termination), Phase 4. Source filled by caller. */
  loops: LoopFact[];
  /**
   * Bare module names from user `import module` statements (Phase 7c),
   * distinct from `imports` (full compiler-synthesized lines like numpy's).
   * Consumed by `@eml/interp` to decide when an attribute call defers as
   * `Unsupported` (real Python only) rather than raising a NameError.
   */
  importedModules: string[];
}

const KNOWN_DECORATORS = new Set(['cold', 'hot', 'temporal_loop']);
const TEMPORAL_ARGS = new Set(['max_wait', 'check_interval', 'timeout_action']);

/**
 * Resolve overlay assignments, track declarations, collect imports, and analyze
 * functions (cold/hot separation, purity, importance).
 *
 * The `x^+n` disambiguation lives here: if `x` has not yet been declared in the
 * active scope it is an initialization (`x = n`); otherwise an augmented add
 * (`x += n`). Function bodies analyze in their own scope (seeded with the
 * parameters), so locals never leak to module scope.
 */
export function analyzeSemantics(
  program: Program,
  options: SemanticOptions = {},
): SemanticResult {
  const moduleScope = new Set<string>(options.declared ?? []);
  const declaredOrder: string[] = [];
  const importsNeeded = new Set<string>();
  const importedModules = new Set<string>();
  const symbols = new Set<string>();
  const diagnostics: Diagnostic[] = [];
  // Span of the statement currently being resolved — a fallback for diagnostics
  // raised on expression nodes (which the parser does not give spans), so the
  // bug-classifier can still map them back to a statement / CTS node.
  let currentSpan: Statement['span'];
  interface FnRecord {
    def: FunctionDef;
    name: string;
    temperature: CtsFunction['temperature'];
    calledNames: string[];
    span?: FunctionDef['span'];
  }
  const fnRecords: FnRecord[] = [];
  let usesTemporal = false;

  /** Declare a name in a scope; record module-scope names in first-seen order. */
  const declareIn = (scope: Set<string>, name: string, isModule: boolean): boolean => {
    if (scope.has(name)) return false;
    scope.add(name);
    if (isModule) declaredOrder.push(name);
    return true;
  };

  const collectExpr = (expr: Expression): void => {
    switch (expr.type) {
      case 'Matrix':
        importsNeeded.add('import numpy as np');
        symbols.add('<M>');
        collectExpr(expr.data);
        break;
      case 'Transpose':
        importsNeeded.add('import numpy as np');
        symbols.add('^T');
        collectExpr(expr.operand);
        break;
      case 'Sum':
        symbols.add('Σ');
        symbols.add('∈');
        collectExpr(expr.expr);
        collectExpr(expr.range);
        break;
      case 'Membership':
        symbols.add('∈');
        collectExpr(expr.element);
        collectExpr(expr.collection);
        break;
      case 'Range':
        symbols.add('[:]');
        for (const bound of [expr.start, expr.end]) {
          if (bound.type === 'NumberLiteral' && !Number.isInteger(bound.value)) {
            diagnostics.push({
              severity: 'error',
              code: 'E_RANGE_NONINT',
              message: `Range bounds must be integers; got '${bound.raw}'. Python range() rejects non-integers.`,
              span: bound.span ?? currentSpan,
            });
          }
        }
        collectExpr(expr.start);
        collectExpr(expr.end);
        break;
      case 'Conditional':
        symbols.add('?:');
        collectExpr(expr.test);
        collectExpr(expr.consequent);
        collectExpr(expr.alternate);
        break;
      case 'Power':
        collectExpr(expr.base);
        collectExpr(expr.exponent);
        break;
      case 'Binary':
        collectExpr(expr.left);
        collectExpr(expr.right);
        break;
      case 'Comparison':
        collectExpr(expr.left);
        collectExpr(expr.right);
        break;
      case 'Logical':
        symbols.add(expr.op);
        collectExpr(expr.left);
        collectExpr(expr.right);
        break;
      case 'Not':
        symbols.add('not');
        collectExpr(expr.operand);
        break;
      case 'Call':
        // An Attribute callee (`math.sqrt(x)`) can itself hide nested
        // expressions in its object (e.g. `d[k].method()`) — recurse into it
        // like any other callee-adjacent expression. An Identifier callee has
        // nothing to collect (bare names aren't symbols/imports).
        if (expr.callee.type === 'Attribute') collectExpr(expr.callee);
        for (const a of expr.args) collectExpr(a);
        break;
      case 'List':
        for (const e of expr.elements) collectExpr(e);
        break;
      case 'Tuple':
        for (const e of expr.elements) collectExpr(e);
        break;
      case 'Await':
        symbols.add('await');
        collectExpr(expr.argument);
        break;
      case 'Dict':
        for (const e of expr.entries) {
          collectExpr(e.key);
          collectExpr(e.value);
        }
        break;
      case 'Set':
        for (const e of expr.elements) collectExpr(e);
        break;
      case 'Subscript':
        collectExpr(expr.object);
        collectExpr(expr.index);
        break;
      case 'Attribute':
        collectExpr(expr.object);
        break;
      case 'Slice':
        if (expr.start) collectExpr(expr.start);
        if (expr.stop) collectExpr(expr.stop);
        break;
      case 'ListComp':
        // `iterator` is never declared into scope — matches 'Sum' above (delegates to
        // the target language's own non-leaking comprehension/generator scoping).
        collectExpr(expr.expr);
        collectExpr(expr.iterable);
        if (expr.condition) collectExpr(expr.condition);
        break;
      case 'Identifier':
      case 'NumberLiteral':
      case 'StringLiteral':
        break;
    }
  };

  // `isModule` is passed explicitly rather than re-derived from `scope === moduleScope`:
  // if/elif/else branches resolve against a CLONED scope Set (see the 'If' case
  // below), which would break identity-based detection while still being at
  // module level. It never changes across if/while/for recursion — only
  // `resolveFunction` flips it to false for a function's own body. `inLoop`
  // mirrors `inFunction`'s pattern for the same reason: `while`/`for` set it
  // true for their own body, `if` passes it through unchanged, and a `def`
  // boundary resets it to false (a `break` inside a nested `def` must not
  // reach an outer loop — matches real Python's own static rule).
  const resolve = (
    stmt: Statement,
    scope: Set<string>,
    inFunction: boolean,
    isModule: boolean,
    inLoop: boolean,
  ): Statement => {
    currentSpan = stmt.span;
    switch (stmt.type) {
      case 'OverlayAssign': {
        collectExpr(stmt.value);
        if (stmt.op === '+') {
          const isNew = declareIn(scope, stmt.target.name, isModule);
          if (isNew) {
            symbols.add('^+');
            return {
              type: 'Assignment',
              target: stmt.target,
              value: stmt.value,
              declares: true,
              span: stmt.span,
            };
          }
          symbols.add('^+=');
          return {
            type: 'AugmentedAssign',
            target: stmt.target,
            op: '+',
            value: stmt.value,
            span: stmt.span,
          };
        }
        // ^-, ^*, ^/ are always augmented; warn if the target is undeclared.
        if (!scope.has(stmt.target.name)) {
          diagnostics.push({
            severity: 'warning',
            code: 'W_AUG_UNDECLARED',
            message: `Augmented assignment '${stmt.op}=' on undeclared variable '${stmt.target.name}'. This will raise NameError at runtime unless declared earlier.`,
            span: stmt.span,
          });
        }
        symbols.add('^' + stmt.op);
        return {
          type: 'AugmentedAssign',
          target: stmt.target,
          op: stmt.op,
          value: stmt.value,
          span: stmt.span,
        };
      }
      case 'Assignment': {
        collectExpr(stmt.value);
        if (stmt.value.type === 'List') symbols.add('list^+');
        else symbols.add('=>');
        // A Subscript (`d[k] = v`, Phase 7b) or Attribute (`self.x = v`, Phase
        // 7c) target mutates an existing object rather than binding a new
        // name — it never "declares", and its own sub-expressions need their
        // own symbol/import collection.
        if (stmt.target.type === 'Identifier') {
          const isNew = declareIn(scope, stmt.target.name, isModule);
          return { ...stmt, declares: isNew };
        }
        collectExpr(stmt.target);
        return { ...stmt, declares: false };
      }
      case 'AugmentedAssign': {
        collectExpr(stmt.value);
        if (stmt.target.type !== 'Identifier') collectExpr(stmt.target);
        return stmt;
      }
      case 'Output': {
        collectExpr(stmt.value);
        if (stmt.end !== undefined) collectExpr(stmt.end);
        symbols.add('^0');
        return stmt;
      }
      case 'ExpressionStatement': {
        collectExpr(stmt.expression);
        return stmt;
      }
      case 'Return': {
        if (!inFunction) {
          diagnostics.push({
            severity: 'error',
            code: 'E_RETURN_OUTSIDE_FN',
            message: "'return' is only valid inside a function body.",
            span: stmt.span,
          });
        }
        if (stmt.value) collectExpr(stmt.value);
        return stmt;
      }
      case 'FunctionDef':
        return resolveFunction(stmt, scope, isModule);
      case 'If': {
        collectExpr(stmt.test);
        // Branches are mutually exclusive: resolve each against its own scope
        // clone (a name first-assigned in one branch must not leak into the
        // sibling as "already declared" — see docs/agent-handoff.md and the
        // control-flow test suite for the concrete NameError this avoids), then
        // union whatever each branch newly declared back into the parent scope.
        const bodyScope = new Set(scope);
        const body = stmt.body.map((s) => resolve(s, bodyScope, inFunction, isModule, inLoop));
        const orelseScope = new Set(scope);
        const orelse = stmt.orelse.map((s) => resolve(s, orelseScope, inFunction, isModule, inLoop));
        for (const branchScope of [bodyScope, orelseScope]) {
          for (const name of branchScope) scope.add(name);
        }
        return { type: 'If', test: stmt.test, body, orelse, span: stmt.span };
      }
      case 'While': {
        collectExpr(stmt.test);
        // while/for don't introduce a new scope (0+ executions, not mutually
        // exclusive alternatives): resolve the body against the same live scope.
        const body = stmt.body.map((s) => resolve(s, scope, inFunction, isModule, true));
        return { ...stmt, body };
      }
      case 'ForIn': {
        collectExpr(stmt.iterable);
        declareIn(scope, stmt.target.name, isModule);
        const body = stmt.body.map((s) => resolve(s, scope, inFunction, isModule, true));
        return { ...stmt, body };
      }
      case 'Break': {
        if (!inLoop) {
          diagnostics.push({
            severity: 'error',
            code: 'E_BREAK_OUTSIDE_LOOP',
            message: "'break' is only valid inside a loop body.",
            span: stmt.span,
          });
        }
        return stmt;
      }
      case 'Continue': {
        if (!inLoop) {
          diagnostics.push({
            severity: 'error',
            code: 'E_CONTINUE_OUTSIDE_LOOP',
            message: "'continue' is only valid inside a loop body.",
            span: stmt.span,
          });
        }
        return stmt;
      }
      case 'Import': {
        // Emitted in-place (not hoisted) — the user wrote this line
        // themselves; relocating it would be surprising. No diagnostics: an
        // attribute call without a matching import is a runtime NameError in
        // real Python too, so EML doesn't statically validate the module name.
        importedModules.add(stmt.module);
        return stmt;
      }
      case 'Try': {
        // A try body can partially execute before an exception fires
        // mid-way, so (unlike while/for) it's genuinely ambiguous which of
        // its declarations are "safely bound" afterward — MORE reason to
        // scope-clone here than for if/else, not less. Resolve the try body
        // and EACH handler against its own clone (a handler must not assume
        // the try body's declarations are safely bound while it's running —
        // it clones the ORIGINAL scope, not the try body's clone), then union
        // every branch's newly-declared names back into the parent scope.
        const tryScope = new Set(scope);
        const body = stmt.body.map((s) => resolve(s, tryScope, inFunction, isModule, inLoop));
        const handlerScopes: Set<string>[] = [];
        const handlers: ExceptHandler[] = stmt.handlers.map((h) => {
          const hScope = new Set(scope);
          // `as name` is visible inside the handler but never escapes it —
          // Python implicitly `del`s it when the except block exits.
          if (h.name) hScope.add(h.name);
          const hBody = h.body.map((s) => resolve(s, hScope, inFunction, isModule, inLoop));
          if (h.name) hScope.delete(h.name);
          handlerScopes.push(hScope);
          return { ...h, body: hBody };
        });
        for (const branchScope of [tryScope, ...handlerScopes]) {
          for (const name of branchScope) scope.add(name);
        }
        // `finally` always eventually runs after whichever path concluded —
        // resolve it against the already-unioned, live parent scope.
        const finallyBody = stmt.finallyBody.map((s) => resolve(s, scope, inFunction, isModule, inLoop));
        return { type: 'Try', body, handlers, finallyBody, span: stmt.span };
      }
      case 'Raise': {
        if (stmt.exception) collectExpr(stmt.exception);
        return stmt;
      }
      case 'ClassDef':
        return resolveClass(stmt, scope, isModule);
      case 'With': {
        // Matches ForIn's "no new scope, live" reasoning, not Try's cautious
        // clone — with's body always executes in full (0 or 1 times, not
        // conditionally branching), so the `as` target is reliably bound
        // afterward, the same way a for-loop's target is.
        collectExpr(stmt.contextExpr);
        if (stmt.target) declareIn(scope, stmt.target.name, isModule);
        const body = stmt.body.map((s) => resolve(s, scope, inFunction, isModule, inLoop));
        return { ...stmt, body };
      }
    }
  };

  /**
   * Resolve a `class Name: <body>` (Phase 7e). The class name is declared in
   * the ENCLOSING scope (so `Counter(...)` resolves like any other call), but
   * the body's own methods/class-level names live in a fresh, never-leaking
   * `classScope` — a method name must not pollute the module namespace, and
   * two unrelated classes' same-named methods must not collide with each
   * other either (that's what `resolveMethod` below is for).
   */
  const resolveClass = (cls: ClassDef, scope: Set<string>, isModule: boolean): ClassDef => {
    symbols.add('class');
    const isNew = declareIn(scope, cls.name, isModule);
    if (!isNew) {
      diagnostics.push({
        severity: 'warning',
        code: 'W_CLASS_REDECLARED',
        message: `Class '${cls.name}' is already declared in this scope; the redefinition shadows it.`,
        span: cls.span,
      });
    }
    // Same builtin-shadow alias risk as a top-level function/method name: the
    // `class` line would be renamed but instantiation call sites (`Foo(...)`,
    // an Identifier callee — never aliased) would not, silently resolving to
    // the Python builtin instead.
    if (aliasIdentifier(cls.name) !== cls.name) {
      diagnostics.push({
        severity: 'error',
        code: 'E_ALIAS_COLLISION',
        message: `Class name '${cls.name}' collides with the builtin-shadow alias '${aliasIdentifier(cls.name)}': its definition would be renamed but its call sites would not. Rename it.`,
        span: cls.span,
      });
    }
    const classScope = new Set<string>();
    const body = cls.body.map((s) => {
      if (s.type === 'FunctionDef') return resolveMethod(s, classScope);
      if (s.type === 'Assignment' || s.type === 'OverlayAssign') return resolve(s, classScope, false, false, false);
      diagnostics.push({
        severity: 'error',
        code: 'E_CLASS_BODY_UNSUPPORTED',
        message: `A class body may only contain method definitions or simple assignments; '${s.type}' is not supported here.`,
        span: s.span ?? cls.span,
      });
      // Still resolve it (even though it's a diagnosed-unsupported shape) so
      // no unresolved OverlayAssign nodes reach the emitter, which would
      // otherwise crash with an internal error and mask this diagnostic —
      // the resolved form is never actually emitted since `ok` is false.
      return resolve(s, classScope, false, false, false);
    });
    return { type: 'ClassDef', name: cls.name, body, span: cls.span };
  };

  /**
   * Resolve a method body — parallel to `resolveFunction` (decorator
   * validation, `E_RETURN_OUTSIDE_FN` checking, body resolution) but
   * deliberately does NOT push into `fnRecords`: that array is keyed by bare
   * function name program-wide, so two unrelated classes each defining
   * `__init__` (or any other same-named method) would otherwise collide in
   * the whole-program purity/importance/crystallization analysis. The
   * documented consequence: class method bodies are opaque to that analysis
   * stack this round — no @cold/@hot caching, no interprocedural purity
   * taint, no importance scoring, no loop-classifier metadata for a loop
   * nested in a method. Still fully parsed, name-resolved, correctly
   * emitted, and correctly executed.
   */
  const resolveMethod = (fn: FunctionDef, classScope: Set<string>): FunctionDef => {
    symbols.add('def');
    const isNew = declareIn(classScope, fn.name, false);
    if (!isNew) {
      diagnostics.push({
        severity: 'warning',
        code: 'W_FN_REDECLARED',
        message: `'${fn.name}' is already declared in this scope; the redefinition shadows it (function analysis may be approximate).`,
        span: fn.span,
      });
    }
    // Same alias-collision risk resolveFunction guards against: a method
    // literally named `list` would emit its def line as `def lst(...)` while
    // call sites (`obj.list()`, never aliased — see emitter.ts's Attribute
    // case) stay `obj.list()`, silently binding to the wrong name.
    if (aliasIdentifier(fn.name) !== fn.name) {
      diagnostics.push({
        severity: 'error',
        code: 'E_ALIAS_COLLISION',
        message: `Method name '${fn.name}' collides with the builtin-shadow alias '${aliasIdentifier(fn.name)}': its definition would be renamed but its call sites would not. Rename it.`,
        span: fn.span,
      });
    }

    // cold/hot/temporal_loop carry semantics the method analysis stack never
    // sees this round (see docstring above) — warn rather than silently
    // pretending they took effect, and strip them so emission stays honest
    // (no @functools.cache / hot-comment / @temporal_loop on a method).
    let unsupportedDecorator = false;
    for (const d of fn.decorators) {
      if (d.name === 'cold' || d.name === 'hot' || d.name === 'temporal_loop') {
        unsupportedDecorator = true;
        diagnostics.push({
          severity: 'warning',
          code: 'W_METHOD_DECORATOR_UNSUPPORTED',
          message: `'@${d.name}' on method '${fn.name}' has no effect — method bodies are not analyzed for cold/hot/temporal semantics this round.`,
          span: fn.span,
        });
      } else if (!KNOWN_DECORATORS.has(d.name)) {
        diagnostics.push({
          severity: 'warning',
          code: 'W_UNKNOWN_DECORATOR',
          message: `Unknown decorator '@${d.name}'. It will be emitted as a comment.`,
          span: fn.span,
        });
      }
    }

    const fnScope = new Set<string>(fn.params.map((p) => p.name));
    const body = fn.body.map((s) => resolve(s, fnScope, true, false, false));
    return {
      ...fn,
      body,
      temperature: undefined,
      decorators: unsupportedDecorator ? fn.decorators.filter((d) => d.name !== 'cold' && d.name !== 'hot' && d.name !== 'temporal_loop') : fn.decorators,
    };
  };

  const resolveFunction = (fn: FunctionDef, outerScope: Set<string>, isModule: boolean): FunctionDef => {
    symbols.add('def');
    const isNew = declareIn(outerScope, fn.name, isModule);
    if (!isNew) {
      diagnostics.push({
        severity: 'warning',
        code: 'W_FN_REDECLARED',
        message: `'${fn.name}' is already declared in this scope; the redefinition shadows it (function analysis may be approximate).`,
        span: fn.span,
      });
    }
    // A function name that is a builtin-shadow alias key cannot be expressed: the
    // emitter would rename the `def` (e.g. `list`->`lst`) while call sites stay
    // `list(...)` and silently bind to the Python builtin. Fail loudly.
    if (aliasIdentifier(fn.name) !== fn.name) {
      diagnostics.push({
        severity: 'error',
        code: 'E_ALIAS_COLLISION',
        message: `Function name '${fn.name}' collides with the builtin-shadow alias '${aliasIdentifier(fn.name)}': its definition would be renamed but its call sites would resolve to the Python builtin. Rename it.`,
        span: fn.span,
      });
    }

    // Validate decorators.
    const names = fn.decorators.map((d) => d.name);
    for (const d of fn.decorators) {
      if (!KNOWN_DECORATORS.has(d.name)) {
        diagnostics.push({
          severity: 'warning',
          code: 'W_UNKNOWN_DECORATOR',
          message: `Unknown decorator '@${d.name}'. Only '@cold' and '@hot' carry semantics in the MVP; it will be emitted as a comment.`,
          span: fn.span,
        });
      }
    }
    if (names.includes('cold') && names.includes('hot')) {
      diagnostics.push({
        severity: 'warning',
        code: 'W_TEMP_CONFLICT',
        message: `Function '${fn.name}' is both @cold and @hot; treating it as @cold.`,
        span: fn.span,
      });
    }
    if (fn.temperature === 'cold') symbols.add('@cold');
    else if (fn.temperature === 'hot') symbols.add('@hot');

    // Temporal loop (Phase 3): a runtime decorator with timing args; needs async.
    const temporal = fn.decorators.find((d) => d.name === 'temporal_loop');
    if (temporal) {
      usesTemporal = true;
      symbols.add('@temporal_loop');
      if (!fn.isAsync) {
        diagnostics.push({
          severity: 'warning',
          code: 'W_TEMPORAL_NOT_ASYNC',
          message: `@temporal_loop on '${fn.name}' expects an 'async def' (it awaits temporal_wait).`,
          span: fn.span,
        });
      }
      for (const arg of temporal.args ?? []) {
        if (arg.name !== undefined && !TEMPORAL_ARGS.has(arg.name)) {
          diagnostics.push({
            severity: 'warning',
            code: 'W_TEMPORAL_ARG',
            message: `Unknown @temporal_loop argument '${arg.name}'. Known: max_wait, check_interval, timeout_action.`,
            span: fn.span,
          });
        }
      }
    }

    // Analyze the body in a fresh scope seeded with the parameters.
    const fnScope = new Set<string>(fn.params.map((p) => p.name));
    const body = fn.body.map((s) => resolve(s, fnScope, true, false, false));
    const resolved: FunctionDef = { ...fn, body };

    // @cold caches via functools.cache — but caching an async def memoizes the
    // coroutine object (crashes on reuse), so cold+async is unsound: warn and
    // skip the cache (the emitter omits @functools.cache for async too).
    if (fn.temperature === 'cold' && fn.isAsync) {
      diagnostics.push({
        severity: 'warning',
        code: 'W_COLD_ASYNC',
        message: `@cold cannot cache async function '${fn.name}' (functools.cache would memoize the coroutine); the cache is skipped.`,
        span: fn.span,
      });
    } else if (fn.temperature === 'cold') {
      importsNeeded.add('import functools');
    }

    // Record callees; intrinsic purity, transitive (interprocedural) purity, and
    // the W_COLD_SIDE_EFFECT warning are resolved in a post-pass once every
    // function name / temperature is known.
    fnRecords.push({
      def: resolved,
      name: fn.name,
      temperature: fn.temperature ?? 'neutral',
      calledNames: collectCalledNames(resolved),
      span: fn.span,
    });
    return resolved;
  };

  const body = program.body.map((s) => resolve(s, moduleScope, false, true, false));
  const resolvedProgram: Program = { type: 'Program', body, span: program.span };

  // ── Interprocedural purity (taint) ──────────────────────────────────────────
  // A @cold function is only safely cacheable if it is *transitively* pure. A
  // function is tainted when it is intrinsically impure OR it (transitively)
  // calls a @hot function or another tainted function. Caching a tainted cold
  // function would freeze a result that actually depends on I/O / dynamic state.
  const userFnNames = new Set(fnRecords.map((r) => r.name));
  const intrinsics = new Map<FnRecord, PurityResult>(
    fnRecords.map((r) => [r, checkPurity(r.def, userFnNames)]),
  );
  const hotNames = new Set(fnRecords.filter((r) => r.temperature === 'hot').map((r) => r.name));
  const tainted = new Set(fnRecords.filter((r) => !intrinsics.get(r)!.pure).map((r) => r.name));
  for (let changed = true; changed; ) {
    changed = false;
    for (const r of fnRecords) {
      if (tainted.has(r.name)) continue;
      if (r.calledNames.some((c) => c !== r.name && (hotNames.has(c) || tainted.has(c)))) {
        tainted.add(r.name);
        changed = true;
      }
    }
  }
  const reasonsFor = (r: FnRecord): string[] => {
    const out = [...intrinsics.get(r)!.sideEffects];
    for (const c of r.calledNames) {
      if (c === r.name) continue;
      if (hotNames.has(c)) out.push(`呼叫 @hot 函數 ${c}（動態狀態）`);
      else if (tainted.has(c)) out.push(`呼叫帶副作用的函數 ${c}`);
    }
    return [...new Set(out)];
  };

  // Importance needs the whole resolved program (call sites) + the function set,
  // returned aligned to fnRecords order so same-named functions don't collide.
  const importance = computeImportance(
    resolvedProgram,
    fnRecords.map((r) => r.def),
    fnRecords.map((r) => !tainted.has(r.name)),
  );

  const functions: FunctionInfo[] = fnRecords.map((r, i) => {
    const isTainted = tainted.has(r.name);
    if (r.temperature === 'cold' && isTainted) {
      diagnostics.push({
        severity: 'warning',
        code: 'W_COLD_SIDE_EFFECT',
        message: `@cold function '${r.name}' has side effects (${reasonsFor(r).join('; ')}); it is not safely cacheable as pure logic.`,
        span: r.span,
      });
    }
    return {
      name: r.name,
      temperature: r.temperature,
      pure: !isTainted,
      astHash: hashFunction(r.def),
      sideEffects: isTainted ? reasonsFor(r) : [],
      importance: importance[i] ?? { callFrequency: 0, riskLevel: 0.5, dependencyDepth: 1, score: 0 },
    };
  });

  // Builtin-shadow alias collisions: if two distinct declared names map to the
  // same emitted Python name (e.g. `list` -> `lst` while `lst` is also bound),
  // fail loudly instead of silently clobbering one binding.
  const seenPyName = new Map<string, string>();
  for (const raw of declaredOrder) {
    const py = aliasIdentifier(raw);
    const prev = seenPyName.get(py);
    if (prev !== undefined && prev !== raw) {
      diagnostics.push({
        severity: 'error',
        code: 'E_ALIAS_COLLISION',
        message: `Identifiers '${prev}' and '${raw}' both map to Python name '${py}' (builtin-shadow alias). Rename one of them.`,
      });
    } else if (prev === undefined) {
      seenPyName.set(py, raw);
    }
  }

  return {
    program: resolvedProgram,
    imports: [...importsNeeded].sort(),
    diagnostics,
    // Report the emitted (aliased) Python names so metadata matches the code.
    declaredNames: [...new Set(declaredOrder.map(aliasIdentifier))],
    symbolsUsed: [...symbols],
    functions,
    usesTemporal,
    loops: classifyLoops(
      resolvedProgram,
      fnRecords.map((r) => ({ name: r.name, def: r.def, calledNames: r.calledNames, span: r.span })),
    ),
    importedModules: [...importedModules],
  };
}
