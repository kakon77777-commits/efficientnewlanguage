import type { FunctionDef, Statement, Expression } from '@eml/types';

/**
 * Rule-based purity checker for the cold/hot separation (whitepaper §7.2).
 *
 * A `@cold` function is meant to be a pure, cacheable computation. This pass
 * statically flags the side effects the whitepaper calls out — I/O and external
 * effects — so `@cold` on an impure body surfaces a warning rather than silently
 * producing an unsound `@functools.cache`. It is intentionally conservative:
 * it reports *observed* effects, not a proof of purity.
 */

/** Builtins whose call is a side effect (I/O / external / non-deterministic). */
const IMPURE_CALLS = new Set<string>([
  // I/O & external
  'print',
  'open',
  'input',
  'requests',
  'eval',
  'exec',
  'write',
  'read',
  // non-determinism (random/time): the cold/hot split exists to separate these,
  // and caching them would freeze a single value — so they are side effects.
  'random',
  'randint',
  'randrange',
  'uniform',
  'choice',
  'choices',
  'sample',
  'shuffle',
  'getrandbits',
  'gauss',
  'time',
  'monotonic',
  'perf_counter',
  'sleep',
  'now',
  'today',
]);

export interface PurityResult {
  pure: boolean;
  /** Human-readable findings, in source order, e.g. "呼叫 input()（I/O）". */
  sideEffects: string[];
}

function scanExpression(expr: Expression, effects: string[], userFns: Set<string>): void {
  switch (expr.type) {
    case 'Call':
      if (expr.callee.type === 'Identifier') {
        // A user-defined function shadows a builtin of the same name; its purity is
        // resolved interprocedurally, so only treat NON-user names as impure here.
        if (IMPURE_CALLS.has(expr.callee.name) && !userFns.has(expr.callee.name)) {
          effects.push(`呼叫 ${expr.callee.name}()（I/O 或外部副作用）`);
        }
      } else {
        // An Attribute callee (`math.sqrt(x)`, `mod.write(x)`, ...) is an
        // unknown quantity — conservatively treat ANY attribute call as a
        // potential side effect rather than attempting an unwinnable
        // per-module allowlist (matches this file's own "reports observed
        // effects, not proof of purity" stance).
        effects.push(`呼叫 ${expr.callee.object.type === 'Identifier' ? expr.callee.object.name + '.' : ''}${expr.callee.attr}()（未知模組/物件呼叫，保守視為副作用）`);
        scanExpression(expr.callee.object, effects, userFns);
      }
      for (const a of expr.args) scanExpression(a, effects, userFns);
      break;
    case 'Power':
      scanExpression(expr.base, effects, userFns);
      scanExpression(expr.exponent, effects, userFns);
      break;
    case 'Binary':
    case 'Comparison':
    case 'Logical':
      scanExpression(expr.left, effects, userFns);
      scanExpression(expr.right, effects, userFns);
      break;
    case 'Not':
      scanExpression(expr.operand, effects, userFns);
      break;
    case 'Conditional':
      scanExpression(expr.test, effects, userFns);
      scanExpression(expr.consequent, effects, userFns);
      scanExpression(expr.alternate, effects, userFns);
      break;
    case 'Range':
      scanExpression(expr.start, effects, userFns);
      scanExpression(expr.end, effects, userFns);
      break;
    case 'Sum':
      scanExpression(expr.expr, effects, userFns);
      scanExpression(expr.range, effects, userFns);
      break;
    case 'Membership':
      scanExpression(expr.element, effects, userFns);
      scanExpression(expr.collection, effects, userFns);
      break;
    case 'Matrix':
      scanExpression(expr.data, effects, userFns);
      break;
    case 'Transpose':
      scanExpression(expr.operand, effects, userFns);
      break;
    case 'List':
      for (const e of expr.elements) scanExpression(e, effects, userFns);
      break;
    case 'Tuple':
      for (const e of expr.elements) scanExpression(e, effects, userFns);
      break;
    case 'Await':
      scanExpression(expr.argument, effects, userFns);
      break;
    case 'Dict':
      for (const e of expr.entries) {
        scanExpression(e.key, effects, userFns);
        scanExpression(e.value, effects, userFns);
      }
      break;
    case 'Set':
      for (const e of expr.elements) scanExpression(e, effects, userFns);
      break;
    case 'Subscript':
      scanExpression(expr.object, effects, userFns);
      scanExpression(expr.index, effects, userFns);
      break;
    case 'Attribute':
      // A bare attribute READ (not a call) is not itself a side effect —
      // only the Call case above treats an attribute *call* as one.
      scanExpression(expr.object, effects, userFns);
      break;
    case 'Slice':
      if (expr.start) scanExpression(expr.start, effects, userFns);
      if (expr.stop) scanExpression(expr.stop, effects, userFns);
      break;
    case 'ListComp':
      scanExpression(expr.expr, effects, userFns);
      scanExpression(expr.iterable, effects, userFns);
      if (expr.condition) scanExpression(expr.condition, effects, userFns);
      break;
    case 'Identifier':
    case 'NumberLiteral':
    case 'StringLiteral':
      break;
  }
}

function scanStatement(stmt: Statement, effects: string[], userFns: Set<string>): void {
  switch (stmt.type) {
    case 'Output':
      // `x^0` -> print(...), an I/O effect.
      effects.push('輸出語句 ^0（print，I/O 副作用）');
      scanExpression(stmt.value, effects, userFns);
      if (stmt.end !== undefined) scanExpression(stmt.end, effects, userFns);
      break;
    case 'Assignment':
    case 'AugmentedAssign':
      // A Subscript target's object/index (e.g. `d[compute_index()] = v`) can
      // itself hide a side effect — scan it too, not just the RHS value.
      scanExpression(stmt.value, effects, userFns);
      if (stmt.target.type !== 'Identifier') scanExpression(stmt.target, effects, userFns);
      break;
    case 'OverlayAssign':
      scanExpression(stmt.value, effects, userFns);
      break;
    case 'ExpressionStatement':
      scanExpression(stmt.expression, effects, userFns);
      break;
    case 'Return':
      if (stmt.value) scanExpression(stmt.value, effects, userFns);
      break;
    case 'FunctionDef':
      // A nested function's own body is analyzed independently; defining it is
      // not itself a side effect of the enclosing function.
      break;
    case 'If':
      scanExpression(stmt.test, effects, userFns);
      for (const s of stmt.body) scanStatement(s, effects, userFns);
      for (const s of stmt.orelse) scanStatement(s, effects, userFns);
      break;
    case 'While':
      scanExpression(stmt.test, effects, userFns);
      for (const s of stmt.body) scanStatement(s, effects, userFns);
      break;
    case 'ForIn':
      scanExpression(stmt.iterable, effects, userFns);
      for (const s of stmt.body) scanStatement(s, effects, userFns);
      break;
    case 'Break':
    case 'Continue':
    case 'Import':
      break; // no expressions, no side effects
    case 'Try':
      for (const s of stmt.body) scanStatement(s, effects, userFns);
      for (const h of stmt.handlers) for (const s of h.body) scanStatement(s, effects, userFns);
      for (const s of stmt.finallyBody) scanStatement(s, effects, userFns);
      break;
    case 'Raise':
      // Raising is not itself treated as an impurity/side effect (it's still
      // deterministic given the same inputs) — but an expression hidden
      // inside it (e.g. a call) is scanned like anywhere else.
      if (stmt.exception) scanExpression(stmt.exception, effects, userFns);
      break;
    case 'ClassDef':
      // Method bodies are opaque to this analysis stack this round (see
      // semantic.ts's resolveMethod) — a nested class definition is not
      // itself a side effect, and its methods are analyzed independently
      // (never, since they're excluded from fnRecords).
      break;
    case 'With':
      scanExpression(stmt.contextExpr, effects, userFns);
      for (const s of stmt.body) scanStatement(s, effects, userFns);
      break;
  }
}

/**
 * Intrinsic purity of a function body: I/O builtins and `^0` output count as
 * side effects. Calls to user-defined functions (in `userFns`) are NOT judged
 * here — their purity is propagated interprocedurally by the caller.
 */
export function checkPurity(fn: FunctionDef, userFns: Set<string> = new Set()): PurityResult {
  const effects: string[] = [];
  for (const stmt of fn.body) scanStatement(stmt, effects, userFns);
  // De-duplicate while preserving first-seen order.
  const sideEffects = [...new Set(effects)];
  return { pure: sideEffects.length === 0, sideEffects };
}

function collectCallsExpr(expr: Expression, into: Set<string>): void {
  switch (expr.type) {
    case 'Call':
      // Only an Identifier callee can NAME a user-defined function (what this
      // interprocedural taint set tracks) — an Attribute callee (`math.sqrt`)
      // never refers to one by bare name, so there's nothing to add for it,
      // though its object may itself hide a user-function call worth recursing into.
      if (expr.callee.type === 'Identifier') into.add(expr.callee.name);
      else collectCallsExpr(expr.callee.object, into);
      for (const a of expr.args) collectCallsExpr(a, into);
      break;
    case 'Power':
      collectCallsExpr(expr.base, into);
      collectCallsExpr(expr.exponent, into);
      break;
    case 'Binary':
    case 'Comparison':
    case 'Logical':
      collectCallsExpr(expr.left, into);
      collectCallsExpr(expr.right, into);
      break;
    case 'Not':
      collectCallsExpr(expr.operand, into);
      break;
    case 'Conditional':
      collectCallsExpr(expr.test, into);
      collectCallsExpr(expr.consequent, into);
      collectCallsExpr(expr.alternate, into);
      break;
    case 'Range':
      collectCallsExpr(expr.start, into);
      collectCallsExpr(expr.end, into);
      break;
    case 'Sum':
      collectCallsExpr(expr.expr, into);
      collectCallsExpr(expr.range, into);
      break;
    case 'Membership':
      collectCallsExpr(expr.element, into);
      collectCallsExpr(expr.collection, into);
      break;
    case 'Matrix':
      collectCallsExpr(expr.data, into);
      break;
    case 'Transpose':
      collectCallsExpr(expr.operand, into);
      break;
    case 'List':
      for (const e of expr.elements) collectCallsExpr(e, into);
      break;
    case 'Tuple':
      for (const e of expr.elements) collectCallsExpr(e, into);
      break;
    case 'Await':
      collectCallsExpr(expr.argument, into);
      break;
    case 'Dict':
      for (const e of expr.entries) {
        collectCallsExpr(e.key, into);
        collectCallsExpr(e.value, into);
      }
      break;
    case 'Set':
      for (const e of expr.elements) collectCallsExpr(e, into);
      break;
    case 'Subscript':
      collectCallsExpr(expr.object, into);
      collectCallsExpr(expr.index, into);
      break;
    case 'Attribute':
      collectCallsExpr(expr.object, into);
      break;
    case 'Slice':
      if (expr.start) collectCallsExpr(expr.start, into);
      if (expr.stop) collectCallsExpr(expr.stop, into);
      break;
    case 'ListComp':
      collectCallsExpr(expr.expr, into);
      collectCallsExpr(expr.iterable, into);
      if (expr.condition) collectCallsExpr(expr.condition, into);
      break;
    default:
      break;
  }
}

/**
 * All callee names referenced directly in a function body, for interprocedural
 * purity analysis. Does NOT descend into nested function definitions — a nested
 * function's calls are its own, not the enclosing function's.
 */
export function collectCalledNames(fn: FunctionDef): string[] {
  const names = new Set<string>();
  const visit = (stmt: Statement): void => {
    switch (stmt.type) {
      case 'Output':
      case 'Return':
        if (stmt.type === 'Output') {
          collectCallsExpr(stmt.value, names);
          if (stmt.end !== undefined) collectCallsExpr(stmt.end, names);
        } else if (stmt.value) collectCallsExpr(stmt.value, names);
        break;
      case 'Assignment':
      case 'AugmentedAssign':
        collectCallsExpr(stmt.value, names);
        if (stmt.target.type !== 'Identifier') collectCallsExpr(stmt.target, names);
        break;
      case 'OverlayAssign':
        collectCallsExpr(stmt.value, names);
        break;
      case 'ExpressionStatement':
        collectCallsExpr(stmt.expression, names);
        break;
      case 'FunctionDef':
        break; // nested function's calls belong to it, not the enclosing scope
      case 'If':
        collectCallsExpr(stmt.test, names);
        stmt.body.forEach(visit);
        stmt.orelse.forEach(visit);
        break;
      case 'While':
        collectCallsExpr(stmt.test, names);
        stmt.body.forEach(visit);
        break;
      case 'ForIn':
        collectCallsExpr(stmt.iterable, names);
        stmt.body.forEach(visit);
        break;
      case 'Break':
      case 'Continue':
      case 'Import':
        break;
      case 'Try':
        stmt.body.forEach(visit);
        stmt.handlers.forEach((h) => h.body.forEach(visit));
        stmt.finallyBody.forEach(visit);
        break;
      case 'Raise':
        if (stmt.exception) collectCallsExpr(stmt.exception, names);
        break;
      case 'ClassDef':
        break; // methods are analyzed independently, never via fnRecords
      case 'With':
        collectCallsExpr(stmt.contextExpr, names);
        stmt.body.forEach(visit);
        break;
    }
  };
  for (const stmt of fn.body) visit(stmt);
  return [...names];
}
