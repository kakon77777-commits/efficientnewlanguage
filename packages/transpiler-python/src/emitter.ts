import type { Program, Statement, Expression, DecoratorArg } from '@eml/types';

/**
 * Identifier aliases to avoid shadowing Python builtins.
 * `list^+[1,2,3]` -> `lst = [1, 2, 3]` (per MVP spec grammar §5 / Appendix A
 * case 14). The alias is applied to variable bindings and reads but NOT to call
 * callees, so a genuine builtin call like `list(1)` is preserved. The semantic
 * analyzer detects and rejects collisions where both `list` and `lst` are
 * declared in the same program. Documented in docs/agent-handoff.md.
 */
export const IDENTIFIER_ALIASES: Record<string, string> = {
  list: 'lst',
};

export function aliasIdentifier(name: string): string {
  return IDENTIFIER_ALIASES[name] ?? name;
}

/** Python expression precedence; higher binds tighter. */
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
      return 6; // atoms, calls, transpose, matrix, sum, list, range, literals
  }
}

/**
 * Emit `child`, parenthesizing when it binds looser than `parentPrec`.
 * Pass `orEqual` for positions that also require wrapping at EQUAL precedence:
 * the right operand of non-associative `-`/`/`, the base of right-associative
 * `**`, and nested conditionals in test/consequent position.
 */
function child(expr: Expression, parentPrec: number, orEqual = false): string {
  const s = emitExpression(expr);
  const looser = orEqual ? precedence(expr) <= parentPrec : precedence(expr) < parentPrec;
  return looser ? `(${s})` : s;
}

/** Emit a range upper bound, applying the inclusive `+1` adjustment. */
function emitRangeEnd(end: Expression): string {
  if (end.type === 'NumberLiteral') {
    // Do the +1 in BigInt for integer literals so bounds stay exact past 2^53
    // (matches the interpreter's INT(BigInt(raw)) + 1n); floats keep number math.
    return /[.eE]/.test(end.raw) ? String(end.value + 1) : (BigInt(end.raw) + 1n).toString();
  }
  // Inclusive end of the form `X - 1` cancels the +1: range(start, X). This
  // keeps the reverse-transpiled `[1:n-1]` round-tripping to `range(1, n)`.
  if (end.type === 'Binary' && end.op === '-' && end.right.type === 'NumberLiteral' && end.right.value === 1) {
    return emitExpression(end.left);
  }
  const s = emitExpression(end);
  // The `+1` binds at additive precedence; wrap ends that bind looser (<3:
  // conditional, comparison, membership) so the adjustment applies to the whole
  // bound. Tighter ends (identifier, additive, multiplicative, power) stay bare,
  // preserving the canonical `range(1, N+1)` form.
  return precedence(end) < 3 ? `(${s})+1` : `${s}+1`;
}

export function emitExpression(expr: Expression): string {
  switch (expr.type) {
    case 'Identifier':
      return aliasIdentifier(expr.name);
    case 'NumberLiteral':
      return expr.raw;
    case 'StringLiteral':
      return JSON.stringify(expr.value);
    case 'Power':
      // Canonical EML form uses no spaces around `**` (e.g. `i**2`). `**` is
      // right-associative in Python, so a Power base must be parenthesized.
      return `${child(expr.base, 5, true)}**${child(expr.exponent, 5)}`;
    case 'Binary': {
      const prec = expr.op === '+' || expr.op === '-' ? 3 : 4;
      // `-` and `/` are non-associative: an equal-precedence right operand must
      // be parenthesized to preserve grouping (a - (b - c) != a - b - c).
      const nonAssoc = expr.op === '-' || expr.op === '/';
      return `${child(expr.left, prec)} ${expr.op} ${child(expr.right, prec, nonAssoc)}`;
    }
    case 'Comparison':
      return `${child(expr.left, 2)} ${expr.op} ${child(expr.right, 2)}`;
    case 'Conditional':
      // Python's `a if t else b`: test and consequent are or_test (cannot hold a
      // bare conditional); the alternate may stay bare (right-associative).
      return `${child(expr.consequent, 1, true)} if ${child(expr.test, 1, true)} else ${emitExpression(expr.alternate)}`;
    case 'Range':
      return `range(${emitExpression(expr.start)}, ${emitRangeEnd(expr.end)})`;
    case 'Sum':
      return `sum(${emitExpression(expr.expr)} for ${aliasIdentifier(expr.iterator.name)} in ${emitExpression(expr.range)})`;
    case 'Membership':
      return `${emitExpression(expr.element)} in ${emitExpression(expr.collection)}`;
    case 'Call':
      // Do NOT alias the callee: preserve genuine builtin calls like `list(1)`.
      return `${expr.callee.name}(${expr.args.map(emitExpression).join(', ')})`;
    case 'Matrix':
      return `np.array(${emitExpression(expr.data)})`;
    case 'Transpose':
      return `np.transpose(${emitExpression(expr.operand)})`;
    case 'List':
      return `[${expr.elements.map(emitExpression).join(', ')}]`;
    case 'Await':
      // `await` binds at primary/postfix level (tighter than every binary,
      // comparison, conditional, and `**`), so a non-atomic argument MUST be
      // parenthesized: `await (a + b)`, not `await a + b` (= `(await a) + b`).
      return `await ${child(expr.argument, 6)}`;
  }
}

/** Emit decorator arguments, e.g. `max_wait=3600, check_interval=60`. */
function emitDecoratorArgs(args?: DecoratorArg[]): string {
  if (!args) return '';
  return args
    .map((a) => (a.name !== undefined ? `${a.name}=${emitExpression(a.value)}` : emitExpression(a.value)))
    .join(', ');
}

/** Indent every line of a (possibly multi-line) block by four spaces. */
function indent(block: string): string {
  return block
    .split('\n')
    .map((l) => (l === '' ? '' : '    ' + l))
    .join('\n');
}

export function emitStatement(stmt: Statement): string {
  switch (stmt.type) {
    case 'Assignment':
      return `${aliasIdentifier(stmt.target.name)} = ${emitExpression(stmt.value)}`;
    case 'AugmentedAssign':
      return `${aliasIdentifier(stmt.target.name)} ${stmt.op}= ${emitExpression(stmt.value)}`;
    case 'Output':
      return `print(${emitExpression(stmt.value)})`;
    case 'ExpressionStatement':
      return emitExpression(stmt.expression);
    case 'Return':
      return stmt.value ? `return ${emitExpression(stmt.value)}` : 'return';
    case 'FunctionDef': {
      const lines: string[] = [];
      // Decorators: @cold caches pure logic; @hot is a non-caching marker;
      // @temporal_loop(...) is a real runtime decorator (from the preamble).
      // Never cache an `async def`: functools.cache would memoize the coroutine
      // object, which raises "cannot reuse already awaited coroutine" on reuse.
      if (stmt.temperature === 'cold' && !stmt.isAsync) {
        lines.push('@functools.cache');
      } else if (stmt.temperature === 'hot') {
        lines.push('# @hot: dynamic state — not cached');
      }
      for (const d of stmt.decorators) {
        if (d.name === 'cold' || d.name === 'hot') continue; // handled via temperature
        if (d.name === 'temporal_loop') {
          lines.push(`@temporal_loop(${emitDecoratorArgs(d.args)})`);
        } else {
          // Unknown decorators are preserved as comments (informational only).
          lines.push(`# @${d.name}${d.args ? '(...)' : ''}`);
        }
      }
      const params = stmt.params.map((p) => aliasIdentifier(p.name)).join(', ');
      const kw = stmt.isAsync ? 'async def' : 'def';
      lines.push(`${kw} ${aliasIdentifier(stmt.name)}(${params}):`);
      for (const s of stmt.body) lines.push(indent(emitStatement(s)));
      return lines.join('\n');
    }
    case 'OverlayAssign':
      throw new Error(
        `Internal error: unresolved OverlayAssign for '${stmt.target.name}'. ` +
          'analyzeSemantics() must run before emitStatement().',
      );
  }
}

export interface EmitProgramOptions {
  /** When true (default), prepend collected imports. */
  emitProgram?: boolean;
  /** Runtime preamble (e.g. the temporal runtime) inserted after imports. */
  preamble?: string;
}

export function emitProgram(
  program: Program,
  imports: string[] = [],
  options: EmitProgramOptions = {},
): string {
  const withImports = options.emitProgram !== false;
  const lines: string[] = [];
  if (withImports && imports.length > 0) {
    lines.push(...imports);
    lines.push('');
  }
  if (withImports && options.preamble) {
    lines.push(options.preamble);
    lines.push('');
  }
  program.body.forEach((stmt, i) => {
    // Set top-level function definitions off with a blank line for readability;
    // formatPython() collapses any runs this produces.
    if (stmt.type === 'FunctionDef' && i > 0) lines.push('');
    lines.push(emitStatement(stmt));
    if (stmt.type === 'FunctionDef' && i < program.body.length - 1) lines.push('');
  });
  return lines.join('\n') + '\n';
}
