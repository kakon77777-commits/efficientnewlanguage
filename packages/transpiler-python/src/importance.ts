import type { Program, Statement, Expression, FunctionDef, CtsImportance } from '@eml/types';

/**
 * Dynamic-compiler importance scoring (whitepaper §8.5), MVP de-scaled form:
 *
 *   Importance = w1*callFrequency + w2*riskLevel + w3*dependencyDepth
 *
 * The three raw components are reported alongside a normalized 0..1 composite so
 * PHOSPHOR can decide whether to trace, require tests, or allow agent refactors.
 * Everything here is deterministic and rule-based — no profiling, no runtime.
 *
 * Determinism notes:
 *  - Depth uses a per-root DFS with a cycle guard and NO shared memo, so a node's
 *    depth never depends on which sibling was scored first (declaration order).
 *  - Call counting is scope-aware: a call to a name shadowed by an enclosing
 *    parameter is attributed to the local, not the module-level function.
 */

const W_FREQ = 0.4;
const W_RISK = 0.4;
const W_DEPTH = 0.2;

/** Diminishing-returns squash to 0..1: 0 -> 0, 1 -> 0.5, large -> ~1. */
const squash = (x: number): number => 1 - 1 / (1 + Math.max(0, x));

const round3 = (x: number): number => Math.round(x * 1000) / 1000;

/**
 * Visit every Call in an expression, skipping callees shadowed by `bound`
 * (parameters/locals in scope). Calls invoke `onCall(name)` for unshadowed
 * callees; arguments are always walked.
 */
function walkExpr(expr: Expression, bound: Set<string>, onCall: (name: string) => void): void {
  switch (expr.type) {
    case 'Call':
      if (expr.callee.type === 'Identifier') {
        if (!bound.has(expr.callee.name)) onCall(expr.callee.name);
      } else {
        // Key an Attribute callee by its full dotted name (`"math.sqrt"`) so
        // it can never collide with an unrelated bare user function sharing
        // just the tail name (e.g. a user's own `sqrt`).
        const objName = expr.callee.object.type === 'Identifier' ? expr.callee.object.name : '…';
        onCall(`${objName}.${expr.callee.attr}`);
        walkExpr(expr.callee.object, bound, onCall);
      }
      for (const a of expr.args) walkExpr(a, bound, onCall);
      break;
    case 'Power':
      walkExpr(expr.base, bound, onCall);
      walkExpr(expr.exponent, bound, onCall);
      break;
    case 'Binary':
    case 'Comparison':
    case 'Logical':
      walkExpr(expr.left, bound, onCall);
      walkExpr(expr.right, bound, onCall);
      break;
    case 'Conditional':
      walkExpr(expr.test, bound, onCall);
      walkExpr(expr.consequent, bound, onCall);
      walkExpr(expr.alternate, bound, onCall);
      break;
    case 'Range':
      walkExpr(expr.start, bound, onCall);
      walkExpr(expr.end, bound, onCall);
      break;
    case 'Sum':
      walkExpr(expr.expr, bound, onCall);
      walkExpr(expr.range, bound, onCall);
      break;
    case 'Membership':
      walkExpr(expr.element, bound, onCall);
      walkExpr(expr.collection, bound, onCall);
      break;
    case 'Matrix':
      walkExpr(expr.data, bound, onCall);
      break;
    case 'Transpose':
      walkExpr(expr.operand, bound, onCall);
      break;
    case 'List':
      for (const e of expr.elements) walkExpr(e, bound, onCall);
      break;
    case 'Await':
      walkExpr(expr.argument, bound, onCall);
      break;
    case 'Dict':
      for (const e of expr.entries) {
        walkExpr(e.key, bound, onCall);
        walkExpr(e.value, bound, onCall);
      }
      break;
    case 'Set':
      for (const e of expr.elements) walkExpr(e, bound, onCall);
      break;
    case 'Subscript':
      walkExpr(expr.object, bound, onCall);
      walkExpr(expr.index, bound, onCall);
      break;
    case 'Attribute':
      // A bare attribute READ (not a call) isn't itself a call site.
      walkExpr(expr.object, bound, onCall);
      break;
    default:
      break;
  }
}

/** Visit a statement's expressions; entering a nested function adds its params to `bound`. */
function walkStmt(stmt: Statement, bound: Set<string>, onCall: (name: string) => void): void {
  switch (stmt.type) {
    case 'Output':
      walkExpr(stmt.value, bound, onCall);
      break;
    case 'Assignment':
    case 'AugmentedAssign':
      walkExpr(stmt.value, bound, onCall);
      if (stmt.target.type !== 'Identifier') walkExpr(stmt.target, bound, onCall);
      break;
    case 'OverlayAssign':
      walkExpr(stmt.value, bound, onCall);
      break;
    case 'ExpressionStatement':
      walkExpr(stmt.expression, bound, onCall);
      break;
    case 'Return':
      if (stmt.value) walkExpr(stmt.value, bound, onCall);
      break;
    case 'FunctionDef': {
      const inner = new Set(bound);
      for (const p of stmt.params) inner.add(p.name);
      for (const s of stmt.body) walkStmt(s, inner, onCall);
      break;
    }
    case 'If':
      walkExpr(stmt.test, bound, onCall);
      for (const s of stmt.body) walkStmt(s, bound, onCall);
      for (const s of stmt.orelse) walkStmt(s, bound, onCall);
      break;
    case 'While':
      walkExpr(stmt.test, bound, onCall);
      for (const s of stmt.body) walkStmt(s, bound, onCall);
      break;
    case 'ForIn':
      walkExpr(stmt.iterable, bound, onCall);
      for (const s of stmt.body) walkStmt(s, bound, onCall);
      break;
    case 'Break':
    case 'Continue':
    case 'Import':
      break;
    case 'Try':
      for (const s of stmt.body) walkStmt(s, bound, onCall);
      for (const h of stmt.handlers) for (const s of h.body) walkStmt(s, bound, onCall);
      for (const s of stmt.finallyBody) walkStmt(s, bound, onCall);
      break;
    case 'Raise':
      if (stmt.exception) walkExpr(stmt.exception, bound, onCall);
      break;
    case 'ClassDef':
      // Method bodies are excluded from importance scoring this round (see
      // semantic.ts's resolveMethod) — no call sites to attribute here.
      break;
  }
}

function riskOf(temperature: FunctionDef['temperature'], pure: boolean): number {
  if (temperature === 'hot') return 0.8;
  if (temperature === 'cold') return pure ? 0.2 : 0.6; // impure cold = broken claim = risky
  return 0.5; // neutral
}

/**
 * Compute importance for every function, returned ALIGNED to the input `fns`
 * array (index-for-index) so functions that share a name do not collide.
 *
 * @param program  Resolved program (post semantic analysis), for call sites.
 * @param fns      Function definitions to score.
 * @param pureFlags Effective purity per function (same order as `fns`).
 */
export function computeImportance(
  program: Program,
  fns: FunctionDef[],
  pureFlags: boolean[],
): CtsImportance[] {
  const fnNames = new Set(fns.map((f) => f.name));

  // callFrequency: scope-aware call sites across the whole program, per name.
  const freq = new Map<string, number>();
  for (const stmt of program.body) {
    walkStmt(stmt, new Set(), (name) => freq.set(name, (freq.get(name) ?? 0) + 1));
  }

  // Direct user-function callees per name (union across same-named defs), for depth.
  const nameCallees = new Map<string, Set<string>>();
  for (const fn of fns) {
    const callees = nameCallees.get(fn.name) ?? new Set<string>();
    const bound = new Set(fn.params.map((p) => p.name));
    for (const stmt of fn.body) {
      walkStmt(stmt, bound, (name) => {
        if (fnNames.has(name) && name !== fn.name) callees.add(name);
      });
    }
    nameCallees.set(fn.name, callees);
  }

  // dependencyDepth: fresh per-root DFS with a cycle guard and NO shared memo, so
  // the result is independent of declaration order (determinism guarantee).
  const depthOf = (name: string, stack: Set<string>): number => {
    if (stack.has(name)) return 0; // cycle: contributes no extra depth
    stack.add(name);
    let maxChild = 0;
    for (const callee of nameCallees.get(name) ?? []) {
      maxChild = Math.max(maxChild, depthOf(callee, stack));
    }
    stack.delete(name);
    return 1 + maxChild;
  };

  return fns.map((fn, i) => {
    const callFrequency = freq.get(fn.name) ?? 0;
    const riskLevel = riskOf(fn.temperature, pureFlags[i] ?? true);
    const dependencyDepth = depthOf(fn.name, new Set());
    const score = round3(
      W_FREQ * squash(callFrequency) + W_RISK * riskLevel + W_DEPTH * squash(dependencyDepth - 1),
    );
    return { callFrequency, riskLevel, dependencyDepth, score };
  });
}
