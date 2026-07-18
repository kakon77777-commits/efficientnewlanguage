import type { Program, Statement, Expression } from '@eml/types';

/**
 * EML / C⁺⁺⁺ → C++ emitter (Phase 4 PROTOTYPE).
 *
 * The whitepaper (§3.18, §571) is explicit that the MVP does NOT build a full
 * C⁺⁺⁺ backend (Clang/LLVM/UE5/templates/memory-model are out of scope). This is
 * a concept-validation: the SAME EML AST that targets Python also emits readable,
 * standalone C++ for a focused subset. Constructs that are numpy/asyncio-specific
 * (matrix, transpose, await, @temporal_loop) FAIL LOUDLY rather than emit broken
 * C++.
 *
 * Notable mappings:
 *   x^+100 / x^+10        -> auto x = 100;  /  x += 10;   (first binding -> auto)
 *   x^0                   -> std::cout << x << "\\n";
 *   Σ(i^2, i in [1:N])    -> an immediately-invoked lambda running a real for-loop
 *   i in [1:10]           -> (i >= 1 && i <= 10)
 *   x > 40 ? A : B        -> (x > 40 ? A : B)
 *   list^+[1,2,3]         -> std::vector<long long>{1, 2, 3}
 *   def f(x): … return …  -> auto f(auto x) { … }          (C++20 abbreviated)
 */

export class CppEmitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CppEmitError';
  }
}

export const CPP_PREAMBLE = `#include <iostream>
#include <vector>
#include <cmath>

// eml_pow: integer exponentiation for the EML power form i^n (n >= 1).
template <class B>
static long long eml_pow(B base, long long exp) {
    long long r = 1;
    long long b = static_cast<long long>(base);
    for (long long k = 0; k < exp; ++k) r *= b;
    return r;
}`;

/** Unique temp names per Σ / membership, reset per program to keep output stable. */
let sumCounter = 0;
let tempCounter = 0;

/** C++ expression precedence; higher binds tighter (mirrors the Python emitter). */
function precedence(expr: Expression): number {
  switch (expr.type) {
    case 'Conditional':
      return 1;
    case 'Logical':
      return expr.op === 'or' ? 2 : 3;
    case 'Not':
      return 4;
    case 'Comparison':
    case 'Membership':
      return 5;
    case 'Binary':
      return expr.op === '+' || expr.op === '-' ? 6 : 7;
    default:
      return 9; // atoms, calls, power (a function call), sum (a lambda), list, tuple, literals
  }
}

function child(expr: Expression, parentPrec: number, orEqual = false): string {
  const s = emitCppExpression(expr);
  const looser = orEqual ? precedence(expr) <= parentPrec : precedence(expr) < parentPrec;
  return looser ? `(${s})` : s;
}

export function emitCppExpression(expr: Expression): string {
  switch (expr.type) {
    case 'Identifier':
      return expr.name;
    case 'NumberLiteral':
      return expr.raw;
    case 'StringLiteral':
      return JSON.stringify(expr.value); // C++ accepts the same basic escapes
    case 'Power':
      return `eml_pow(${child(expr.base, 9)}, ${emitCppExpression(expr.exponent)})`;
    case 'Binary': {
      // C++'s `%` is integer-only (a compile error on `double` operands),
      // unlike Python's, which also works on floats. This backend does no
      // type inference, so it can only catch the obvious case: a literal
      // non-integer operand. A non-literal (variable) float operand is the
      // same kind of accepted, documented type-blindness `/` already has.
      if (
        expr.op === '%' &&
        [expr.left, expr.right].some((e) => e.type === 'NumberLiteral' && !Number.isInteger(e.value))
      ) {
        throw new CppEmitError('C⁺⁺⁺ `%` requires integer operands (a non-integer literal was used) — C++ modulo does not support floating-point types.');
      }
      const prec = expr.op === '+' || expr.op === '-' ? 6 : 7;
      const nonAssoc = expr.op === '-' || expr.op === '/' || expr.op === '%';
      return `${child(expr.left, prec)} ${expr.op} ${child(expr.right, prec, nonAssoc)}`;
    }
    case 'Comparison':
      return `${child(expr.left, 5)} ${expr.op} ${child(expr.right, 5)}`;
    case 'Logical': {
      // C++ && / || always yield bool; Python's and/or yield an OPERAND
      // (short-circuit value). This is a real, deliberate narrowing for this
      // PROTOTYPE backend — see docs/cpp-feasibility.md's "Known divergences".
      const prec = expr.op === 'and' ? 3 : 2;
      const op = expr.op === 'and' ? '&&' : '||';
      return `${child(expr.left, prec)} ${op} ${child(expr.right, prec)}`;
    }
    case 'Not':
      // C++'s `!` binds MUCH TIGHTER than comparison (unlike Python's `not`,
      // which binds looser) — `!x > 5` parses as `(!x) > 5` in real C++, not
      // `!(x > 5)`. Reusing this shared precedence system (built for
      // Python's own precedence) would be WRONG here, so this case bypasses
      // `child()`/`precedence()` entirely and always parenthesizes the
      // operand — correctness over minimal parens, verified by reasoning
      // through concrete cases before writing this, not assumed safe.
      return `!(${emitCppExpression(expr.operand)})`;
    case 'Conditional':
      return `(${child(expr.test, 1, true)} ? ${child(expr.consequent, 1, true)} : ${emitCppExpression(expr.alternate)})`;
    case 'Sum': {
      const acc = `__sum${sumCounter++}`;
      const iter = expr.iterator.name;
      const start = emitCppExpression(expr.range.start);
      const end = emitCppExpression(expr.range.end);
      const body = emitCppExpression(expr.expr);
      // Inclusive range -> `<= end`, matching EML's [a:b] semantics.
      return `[&]{ long long ${acc} = 0; for (long long ${iter} = ${start}; ${iter} <= ${end}; ++${iter}) ${acc} += ${body}; return ${acc}; }()`;
    }
    case 'Membership': {
      if (expr.collection.type !== 'Range') {
        throw new CppEmitError('C⁺⁺⁺ membership is only supported over an inclusive range `x in [a:b]`.');
      }
      // Bind the element to a temp so it is evaluated EXACTLY ONCE (matching
      // Python) and so its own precedence can't leak into the && comparison.
      const m = `__m${tempCounter++}`;
      const start = emitCppExpression(expr.collection.start);
      const end = emitCppExpression(expr.collection.end);
      return `[&]{ auto ${m} = ${emitCppExpression(expr.element)}; return (${m} >= ${start} && ${m} <= ${end}); }()`;
    }
    case 'Call':
      if (expr.callee.type !== 'Identifier') {
        throw new CppEmitError('An attribute/method call (`obj.method(...)`) is not supported by the C⁺⁺⁺ prototype.');
      }
      return `${expr.callee.name}(${expr.args.map(emitCppExpression).join(', ')})`;
    case 'List': {
      // The prototype only types integer-literal lists; anything else would
      // narrow/invalid-convert inside a std::vector<long long>{...} brace-init.
      for (const el of expr.elements) {
        if (el.type !== 'NumberLiteral' || !Number.isInteger(el.value)) {
          throw new CppEmitError('The C⁺⁺⁺ prototype supports only integer-literal lists (e.g. [1, 2, 3]).');
        }
      }
      return `std::vector<long long>{${expr.elements.map(emitCppExpression).join(', ')}}`;
    }
    case 'Tuple':
      throw new CppEmitError('Tuple literals `(a, b, ...)` are not supported by the C⁺⁺⁺ prototype (this numeric-only prototype has no tuple or string-formatting model).');
    case 'Range':
      throw new CppEmitError('A bare range `[a:b]` has no C⁺⁺⁺ value form; use it inside Σ or `in`.');
    case 'Matrix':
      throw new CppEmitError('Matrix `<M>(...)` is numpy-specific and not supported by the C⁺⁺⁺ prototype.');
    case 'Transpose':
      throw new CppEmitError('Transpose `^T` is numpy-specific and not supported by the C⁺⁺⁺ prototype.');
    case 'Await':
      throw new CppEmitError('`await` / async is not supported by the C⁺⁺⁺ prototype.');
    case 'Dict':
      throw new CppEmitError('Dict literals `{k: v, ...}` are not supported by the C⁺⁺⁺ prototype.');
    case 'Set':
      throw new CppEmitError('Set literals `{v, ...}` are not supported by the C⁺⁺⁺ prototype.');
    case 'Subscript':
      throw new CppEmitError('Subscript access `obj[index]` is not supported by the C⁺⁺⁺ prototype.');
    case 'Attribute':
      throw new CppEmitError('Attribute access `obj.attr` is not supported by the C⁺⁺⁺ prototype.');
  }
}

function indent(block: string): string {
  return block
    .split('\n')
    .map((l) => (l === '' ? '' : '    ' + l))
    .join('\n');
}

/**
 * Emit a statement. `listVars` tracks identifiers bound to a list literal in the
 * current scope so we can fail loud when one is output (std::vector has no
 * `operator<<`) instead of emitting non-compiling C++.
 */
export function emitCppStatement(stmt: Statement, listVars: Set<string> = new Set()): string {
  switch (stmt.type) {
    case 'Assignment': {
      if (stmt.target.type !== 'Identifier') {
        throw new CppEmitError('A Subscript assignment target (`d[k] = v`) is not supported by the C⁺⁺⁺ prototype.');
      }
      const rhs = emitCppExpression(stmt.value);
      if (stmt.value.type === 'List') listVars.add(stmt.target.name);
      else listVars.delete(stmt.target.name);
      return stmt.declares ? `auto ${stmt.target.name} = ${rhs};` : `${stmt.target.name} = ${rhs};`;
    }
    case 'AugmentedAssign': {
      if (stmt.target.type !== 'Identifier') {
        throw new CppEmitError('A Subscript assignment target (`d[k] += v`) is not supported by the C⁺⁺⁺ prototype.');
      }
      return `${stmt.target.name} ${stmt.op}= ${emitCppExpression(stmt.value)};`;
    }
    case 'Output':
      if (stmt.value.type === 'List' || (stmt.value.type === 'Identifier' && listVars.has(stmt.value.name))) {
        throw new CppEmitError('Outputting a list is not supported by the C⁺⁺⁺ prototype (std::vector has no std::ostream operator<<).');
      }
      return `std::cout << ${emitCppExpression(stmt.value)} << "\\n";`;
    case 'ExpressionStatement':
      return `${emitCppExpression(stmt.expression)};`;
    case 'Return':
      return stmt.value ? `return ${emitCppExpression(stmt.value)};` : 'return;';
    case 'FunctionDef': {
      if (stmt.isAsync || stmt.decorators.some((d) => d.name === 'temporal_loop')) {
        throw new CppEmitError(`async / @temporal_loop function '${stmt.name}' is not supported by the C⁺⁺⁺ prototype.`);
      }
      // An auto-returning function cannot reference itself before its return type
      // is deduced, so recursion is ill-formed C++. Fail loud rather than emit it.
      if (stmt.body.some((s) => statementCallsName(s, stmt.name))) {
        throw new CppEmitError(
          `Recursive function '${stmt.name}' is not supported by the C⁺⁺⁺ prototype (an auto-returning function cannot call itself).`,
        );
      }
      const lines: string[] = [];
      // cold/hot carry no C++ semantics in the prototype; preserve as comments.
      for (const d of stmt.decorators) lines.push(`// @${d.name}`);
      const params = stmt.params.map((p) => `auto ${p.name}`).join(', ');
      lines.push(`auto ${stmt.name}(${params}) {`);
      const localLists = new Set<string>(); // function body has its own scope
      for (const s of stmt.body) lines.push(indent(emitCppStatement(s, localLists)));
      lines.push('}');
      return lines.join('\n');
    }
    case 'OverlayAssign':
      throw new CppEmitError(
        `Internal error: unresolved OverlayAssign for '${stmt.target.name}'. analyzeSemantics() must run first.`,
      );
    case 'If':
    case 'While':
    case 'ForIn':
    case 'Break':
    case 'Continue':
    case 'Import':
    case 'Try':
    case 'Raise':
    case 'ClassDef':
    case 'With':
      throw new CppEmitError(`'${stmt.type}' is not supported by the C⁺⁺⁺ prototype yet.`);
  }
}

/** True if any call within `expr` targets `name` (for self-recursion detection). */
function expressionCallsName(expr: Expression, name: string): boolean {
  switch (expr.type) {
    case 'Call':
      return (
        (expr.callee.type === 'Identifier' ? expr.callee.name === name : expressionCallsName(expr.callee, name)) ||
        expr.args.some((a) => expressionCallsName(a, name))
      );
    case 'Power':
      return expressionCallsName(expr.base, name) || expressionCallsName(expr.exponent, name);
    case 'Binary':
    case 'Comparison':
    case 'Logical':
      return expressionCallsName(expr.left, name) || expressionCallsName(expr.right, name);
    case 'Not':
      return expressionCallsName(expr.operand, name);
    case 'Conditional':
      return (
        expressionCallsName(expr.test, name) ||
        expressionCallsName(expr.consequent, name) ||
        expressionCallsName(expr.alternate, name)
      );
    case 'Range':
      return expressionCallsName(expr.start, name) || expressionCallsName(expr.end, name);
    case 'Sum':
      return expressionCallsName(expr.expr, name) || expressionCallsName(expr.range, name);
    case 'Membership':
      return expressionCallsName(expr.element, name) || expressionCallsName(expr.collection, name);
    case 'Matrix':
      return expressionCallsName(expr.data, name);
    case 'Transpose':
      return expressionCallsName(expr.operand, name);
    case 'List':
      return expr.elements.some((e) => expressionCallsName(e, name));
    case 'Tuple':
      return expr.elements.some((e) => expressionCallsName(e, name));
    case 'Await':
      return expressionCallsName(expr.argument, name);
    case 'Dict':
      return expr.entries.some((e) => expressionCallsName(e.key, name) || expressionCallsName(e.value, name));
    case 'Set':
      return expr.elements.some((e) => expressionCallsName(e, name));
    case 'Subscript':
      return expressionCallsName(expr.object, name) || expressionCallsName(expr.index, name);
    case 'Attribute':
      return expressionCallsName(expr.object, name);
    default:
      return false;
  }
}

function statementCallsName(stmt: Statement, name: string): boolean {
  switch (stmt.type) {
    case 'Assignment':
    case 'AugmentedAssign':
      return (
        expressionCallsName(stmt.value, name) ||
        (stmt.target.type !== 'Identifier' && expressionCallsName(stmt.target, name))
      );
    case 'OverlayAssign':
    case 'Output':
      return expressionCallsName(stmt.value, name);
    case 'ExpressionStatement':
      return expressionCallsName(stmt.expression, name);
    case 'Return':
      return stmt.value ? expressionCallsName(stmt.value, name) : false;
    case 'FunctionDef':
      return stmt.body.some((s) => statementCallsName(s, name));
    case 'If':
      return (
        expressionCallsName(stmt.test, name) ||
        stmt.body.some((s) => statementCallsName(s, name)) ||
        stmt.orelse.some((s) => statementCallsName(s, name))
      );
    case 'While':
      return expressionCallsName(stmt.test, name) || stmt.body.some((s) => statementCallsName(s, name));
    case 'ForIn':
      return expressionCallsName(stmt.iterable, name) || stmt.body.some((s) => statementCallsName(s, name));
    case 'Break':
    case 'Continue':
    case 'Import':
      return false;
    case 'Try':
      return (
        stmt.body.some((s) => statementCallsName(s, name)) ||
        stmt.handlers.some((h) => h.body.some((s) => statementCallsName(s, name))) ||
        stmt.finallyBody.some((s) => statementCallsName(s, name))
      );
    case 'Raise':
      return stmt.exception ? expressionCallsName(stmt.exception, name) : false;
    case 'ClassDef':
      return stmt.body.some((s) => statementCallsName(s, name));
    case 'With':
      return expressionCallsName(stmt.contextExpr, name) || stmt.body.some((s) => statementCallsName(s, name));
  }
}

export function emitCppProgram(program: Program): string {
  sumCounter = 0;
  tempCounter = 0;
  // C++ has no name rebinding: two same-named functions are a redefinition.
  const fnNames = program.body.filter((s) => s.type === 'FunctionDef').map((s) => s.name);
  const dup = fnNames.find((n, i) => fnNames.indexOf(n) !== i);
  if (dup !== undefined) {
    throw new CppEmitError(`Function '${dup}' is defined more than once; the C⁺⁺⁺ prototype cannot emit a C++ redefinition.`);
  }
  const functions: string[] = [];
  const mainBody: string[] = [];
  const mainListVars = new Set<string>();
  for (const stmt of program.body) {
    if (stmt.type === 'FunctionDef') functions.push(emitCppStatement(stmt));
    else mainBody.push(emitCppStatement(stmt, mainListVars));
  }
  const parts: string[] = [CPP_PREAMBLE];
  if (functions.length > 0) parts.push(functions.join('\n\n'));
  const main = ['int main() {', ...mainBody.map((l) => indent(l)), '    return 0;', '}'].join('\n');
  parts.push(main);
  return parts.join('\n\n') + '\n';
}
