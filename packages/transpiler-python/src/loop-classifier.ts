import type { Program, Statement, Expression, FunctionDef, SourceSpan, CtsLoop } from '@eml/types';

/**
 * Loop classification (whitepaper §8.4, MVP de-scaling of the "twelve loop
 * kinds"). Rather than a runtime, we statically tag each loop-like construct in
 * the AST with a `loopKind` plus determinism/termination flags. Deterministic
 * and rule-based — no profiling.
 *
 * EML's loop-like constructs map to:
 *  - `Σ(...)`                 -> algebraic_sum (deterministic, terminating)
 *  - `i in [a:b]` (range)     -> basic_repeat  (deterministic, terminating)
 *  - `@temporal_loop` fn      -> temporal      (non-deterministic, terminating via max_wait)
 *  - self/cyclic-recursive fn -> recursive     (deterministic, not provably terminating)
 */

/** A classified loop, minus the source text (filled in by the caller from `span`). */
export type LoopFact = Omit<CtsLoop, 'source'> & { span?: SourceSpan };

/** Minimal function shape the classifier needs (a subset of the analyzer's records). */
export interface LoopFnInput {
  name: string;
  def: FunctionDef;
  calledNames: string[];
  span?: SourceSpan;
}

/** Walk a statement's own expressions (not nested function bodies) for `Sum` / range membership. */
function scanStatementExpr(stmt: Statement, visit: (e: Expression) => void): void {
  const walk = (e: Expression): void => {
    visit(e);
    switch (e.type) {
      case 'Power':
        walk(e.base);
        walk(e.exponent);
        break;
      case 'Binary':
      case 'Comparison':
        walk(e.left);
        walk(e.right);
        break;
      case 'Conditional':
        walk(e.test);
        walk(e.consequent);
        walk(e.alternate);
        break;
      case 'Range':
        walk(e.start);
        walk(e.end);
        break;
      case 'Sum':
        walk(e.expr);
        walk(e.range);
        break;
      case 'Membership':
        walk(e.element);
        walk(e.collection);
        break;
      case 'Call':
        for (const a of e.args) walk(a);
        break;
      case 'Matrix':
        walk(e.data);
        break;
      case 'Transpose':
        walk(e.operand);
        break;
      case 'List':
        for (const el of e.elements) walk(el);
        break;
      case 'Await':
        walk(e.argument);
        break;
      default:
        break;
    }
  };
  switch (stmt.type) {
    case 'Assignment':
    case 'AugmentedAssign':
    case 'OverlayAssign':
      walk(stmt.value);
      break;
    case 'Output':
      walk(stmt.value);
      break;
    case 'ExpressionStatement':
      walk(stmt.expression);
      break;
    case 'Return':
      if (stmt.value) walk(stmt.value);
      break;
    case 'FunctionDef':
      break; // nested bodies are visited separately
    case 'If':
      walk(stmt.test);
      break; // body/orelse are visited separately (see visitStmt)
    case 'While':
      walk(stmt.test);
      break; // body is visited separately
    case 'ForIn':
      walk(stmt.iterable);
      break; // body is visited separately
  }
}

export function classifyLoops(program: Program, fns: LoopFnInput[]): LoopFact[] {
  const loops: LoopFact[] = [];

  // ── Σ and range-iteration loops, attributed to their containing statement ──
  const visitStmt = (stmt: Statement): void => {
    if (stmt.type === 'FunctionDef') {
      for (const s of stmt.body) visitStmt(s);
      return;
    }
    let hasSum = false;
    let hasRangeIteration = false;
    scanStatementExpr(stmt, (e) => {
      if (e.type === 'Sum') hasSum = true;
      else if (e.type === 'Membership' && e.collection.type === 'Range') hasRangeIteration = true;
    });
    // Σ subsumes its inner range, so a statement is at most one loop here.
    if (hasSum) {
      loops.push({ loopKind: 'algebraic_sum', deterministic: true, terminating: true, span: stmt.span });
    } else if (hasRangeIteration) {
      loops.push({ loopKind: 'basic_repeat', deterministic: true, terminating: true, span: stmt.span });
    }
    if (stmt.type === 'If') {
      for (const s of stmt.body) visitStmt(s);
      for (const s of stmt.orelse) visitStmt(s);
      return;
    }
    if (stmt.type === 'While') {
      // A while condition is not statically provable to terminate (unlike a
      // materialized range/list iteration), same conservative treatment as recursion.
      loops.push({ loopKind: 'while_loop', deterministic: true, terminating: false, span: stmt.span });
      for (const s of stmt.body) visitStmt(s);
      return;
    }
    if (stmt.type === 'ForIn') {
      // The iterable is always a materialized finite list/string in this interpreter.
      loops.push({ loopKind: 'for_loop', deterministic: true, terminating: true, span: stmt.span });
      for (const s of stmt.body) visitStmt(s);
      return;
    }
  };
  for (const stmt of program.body) visitStmt(stmt);

  // ── temporal + recursive function loops ──
  const fnNames = new Set(fns.map((f) => f.name));
  // Name-keyed adjacency; same-named definitions (the W_FN_REDECLARED case) union
  // their callees. This is used ONLY for transitive hops — each record's search is
  // seeded from its OWN callees, so same-named records are judged independently
  // (a redeclaration can't make a sibling wrongly recursive or hide a real one).
  const adjacency = new Map<string, Set<string>>();
  for (const f of fns) {
    const set = adjacency.get(f.name) ?? new Set<string>();
    for (const n of f.calledNames) if (fnNames.has(n)) set.add(n);
    adjacency.set(f.name, set);
  }
  const reachesName = (seed: Iterable<string>, target: string): boolean => {
    const seen = new Set<string>();
    const stack = [...seed];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      if (cur === target) return true;
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const c of adjacency.get(cur) ?? []) stack.push(c);
    }
    return false;
  };

  for (const f of fns) {
    const isTemporal = f.def.decorators.some((d) => d.name === 'temporal_loop');
    const ownCallees = f.calledNames.filter((n) => fnNames.has(n));
    if (isTemporal) {
      loops.push({ loopKind: 'temporal', deterministic: false, terminating: true, span: f.span, ref: f.name });
    } else if (reachesName(ownCallees, f.name)) {
      // Pure recursion is deterministic, but termination is not statically provable.
      loops.push({ loopKind: 'recursive', deterministic: true, terminating: false, span: f.span, ref: f.name });
    }
  }

  return loops;
}
