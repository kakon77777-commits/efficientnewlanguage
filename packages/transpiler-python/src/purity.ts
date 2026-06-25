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
      // A user-defined function shadows a builtin of the same name; its purity is
      // resolved interprocedurally, so only treat NON-user names as impure here.
      if (IMPURE_CALLS.has(expr.callee.name) && !userFns.has(expr.callee.name)) {
        effects.push(`呼叫 ${expr.callee.name}()（I/O 或外部副作用）`);
      }
      for (const a of expr.args) scanExpression(a, effects, userFns);
      break;
    case 'Power':
      scanExpression(expr.base, effects, userFns);
      scanExpression(expr.exponent, effects, userFns);
      break;
    case 'Binary':
    case 'Comparison':
      scanExpression(expr.left, effects, userFns);
      scanExpression(expr.right, effects, userFns);
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
    case 'Await':
      scanExpression(expr.argument, effects, userFns);
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
      break;
    case 'Assignment':
    case 'AugmentedAssign':
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
      into.add(expr.callee.name);
      for (const a of expr.args) collectCallsExpr(a, into);
      break;
    case 'Power':
      collectCallsExpr(expr.base, into);
      collectCallsExpr(expr.exponent, into);
      break;
    case 'Binary':
    case 'Comparison':
      collectCallsExpr(expr.left, into);
      collectCallsExpr(expr.right, into);
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
    case 'Await':
      collectCallsExpr(expr.argument, into);
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
        if (stmt.type === 'Output') collectCallsExpr(stmt.value, names);
        else if (stmt.value) collectCallsExpr(stmt.value, names);
        break;
      case 'Assignment':
      case 'AugmentedAssign':
      case 'OverlayAssign':
        collectCallsExpr(stmt.value, names);
        break;
      case 'ExpressionStatement':
        collectCallsExpr(stmt.expression, names);
        break;
      case 'FunctionDef':
        break; // nested function's calls belong to it, not the enclosing scope
    }
  };
  for (const stmt of fn.body) visit(stmt);
  return [...names];
}
