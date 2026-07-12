import type { Program, Statement, Expression } from '@eml/types';

/**
 * Emit EML/Py+ source from a resolved AST — the inverse of the Python emitter.
 *
 * EML is a strict subset, so some valid Python ASTs have NO faithful EML form.
 * Rather than emit EML the forward parser would reject (silent corruption),
 * this emitter THROWS on inexpressible constructs; transpilePythonToEml then
 * reports ok:false. Inexpressible cases:
 *   - power with a non-(non-zero-number) exponent: `a**b`, `x**0`
 *   - print of a non-identifier: `print(a + b)`  (`^0` attaches to a bare ident)
 *   - augmented assign with a compound RHS: `x += a + b`
 *   - standalone `+=` on an undeclared name (`x^+` would read as a declaration)
 */

function precedence(expr: Expression): number {
  switch (expr.type) {
    case 'Conditional':
      return 1;
    case 'Comparison':
    case 'Membership':
      return 2;
    case 'Binary':
      return expr.op === '+' || expr.op === '-' ? 3 : 4;
    case 'Power':
      return 5;
    default:
      return 6;
  }
}

function child(expr: Expression, parentPrec: number, orEqual = false): string {
  const s = emitEmlExpression(expr);
  const looser = orEqual ? precedence(expr) <= parentPrec : precedence(expr) < parentPrec;
  return looser ? `(${s})` : s;
}

const isAtom = (e: Expression): boolean =>
  e.type === 'Identifier' || e.type === 'NumberLiteral' || e.type === 'StringLiteral';

export class EmlEmitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmlEmitError';
  }
}

export function emitEmlExpression(expr: Expression): string {
  switch (expr.type) {
    case 'Identifier':
      return expr.name;
    case 'NumberLiteral':
      return expr.raw;
    case 'StringLiteral':
      return JSON.stringify(expr.value);
    case 'Power':
      // EML grammar only permits `^<non-zero number>` (and `^0` means Output).
      if (expr.exponent.type !== 'NumberLiteral' || expr.exponent.value === 0) {
        throw new EmlEmitError(
          `EML cannot express a power with exponent '${emitEmlExpression(expr.exponent)}' — the exponent must be a non-zero number literal.`,
        );
      }
      return `${child(expr.base, 5, true)}^${emitEmlExpression(expr.exponent)}`;
    case 'Binary': {
      const prec = expr.op === '+' || expr.op === '-' ? 3 : 4;
      const nonAssoc = expr.op === '-' || expr.op === '/';
      return `${child(expr.left, prec)} ${expr.op} ${child(expr.right, prec, nonAssoc)}`;
    }
    case 'Comparison':
      return `${child(expr.left, 2)} ${expr.op} ${child(expr.right, 2)}`;
    case 'Conditional':
      return `${child(expr.test, 1, true)} ? ${child(expr.consequent, 1, true)} : ${emitEmlExpression(expr.alternate)}`;
    case 'Range':
      return `[${emitEmlExpression(expr.start)}:${emitEmlExpression(expr.end)}]`;
    case 'Sum':
      return `Σ(${emitEmlExpression(expr.expr)}, ${expr.iterator.name} in ${emitEmlExpression(expr.range)})`;
    case 'Membership':
      return `${emitEmlExpression(expr.element)} in ${emitEmlExpression(expr.collection)}`;
    case 'Call':
      return `${expr.callee.name}(${expr.args.map(emitEmlExpression).join(', ')})`;
    case 'Matrix':
      return `<M>(${emitEmlExpression(expr.data)})`;
    case 'Transpose':
      return `${child(expr.operand, 6)}^T`;
    case 'List':
      return `[${expr.elements.map(emitEmlExpression).join(', ')}]`;
    case 'Await':
      // Async/await is a forward-only construct (Phase 3 temporal loops); the
      // reverse path stays statement-level. Fail loudly.
      throw new EmlEmitError('Reverse Python->EML does not support await / async (temporal loops are forward-only).');
  }
}

export function emitEmlStatement(stmt: Statement, bound: Set<string> = new Set()): string {
  switch (stmt.type) {
    case 'Assignment': {
      const v = stmt.value;
      let line: string;
      if (v.type === 'List') {
        line = `${stmt.target.name}^+[${v.elements.map(emitEmlExpression).join(', ')}]`;
      } else if (isAtom(v)) {
        line = `${stmt.target.name}^+${emitEmlExpression(v)}`;
      } else {
        line = `${emitEmlExpression(v)} => ${stmt.target.name}`;
      }
      bound.add(stmt.target.name);
      return line;
    }
    case 'AugmentedAssign': {
      if (!isAtom(stmt.value)) {
        throw new EmlEmitError(
          `EML cannot express an augmented assignment with a compound right-hand side ('${stmt.target.name} ${stmt.op}= …').`,
        );
      }
      if (stmt.op === '+' && !bound.has(stmt.target.name)) {
        throw new EmlEmitError(
          `EML cannot express a standalone '+=' on undeclared '${stmt.target.name}' — '${stmt.target.name}^+' resolves to a declaration. Declare it first.`,
        );
      }
      bound.add(stmt.target.name);
      return `${stmt.target.name}^${stmt.op}${emitEmlExpression(stmt.value)}`;
    }
    case 'Output':
      if (stmt.value.type !== 'Identifier') {
        throw new EmlEmitError('EML output (^0) requires a bare identifier; cannot express print(<expression>).');
      }
      return `${emitEmlExpression(stmt.value)}^0`;
    case 'ExpressionStatement':
      return emitEmlExpression(stmt.expression);
    case 'FunctionDef':
      // Functions are a forward-only construct in Phase 2; reverse stays
      // statement-level. Fail loudly rather than emit non-round-tripping EML.
      throw new EmlEmitError(
        `Reverse Python->EML does not yet support function definitions ('def ${stmt.name}').`,
      );
    case 'Return':
      throw new EmlEmitError('Reverse Python->EML does not yet support return statements.');
    case 'OverlayAssign':
      throw new EmlEmitError(`Internal error: emitEml received unresolved OverlayAssign for '${stmt.target.name}'.`);
    case 'If':
      throw new EmlEmitError('Reverse Python->EML does not yet support if/elif/else statements.');
    case 'While':
      throw new EmlEmitError('Reverse Python->EML does not yet support while statements.');
    case 'ForIn':
      throw new EmlEmitError('Reverse Python->EML does not yet support for statements.');
  }
}

export function emitEmlProgram(program: Program): string {
  const bound = new Set<string>();
  return program.body.map((s) => emitEmlStatement(s, bound)).join('\n') + '\n';
}
