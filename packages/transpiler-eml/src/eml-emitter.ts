import type { Program, Statement, Expression, IfStatement } from '@eml/types';

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
    case 'Logical':
      return expr.op === 'or' ? 2 : 3;
    case 'Not':
      return 4;
    case 'Comparison':
    case 'Membership':
      return 5;
    case 'Binary':
      return expr.op === '+' || expr.op === '-' ? 6 : 7;
    case 'Power':
      return 8;
    default:
      return 9;
  }
}

function child(expr: Expression, parentPrec: number, orEqual = false): string {
  const s = emitEmlExpression(expr);
  const looser = orEqual ? precedence(expr) <= parentPrec : precedence(expr) < parentPrec;
  return looser ? `(${s})` : s;
}

const isAtom = (e: Expression): boolean =>
  e.type === 'Identifier' || e.type === 'NumberLiteral' || e.type === 'StringLiteral';

/** Values eligible for the inline `target^+<literal>` sigil form (as opposed
 *  to the reversed-arrow form) — atoms plus list/dict/set/tuple literals, all
 *  of which `emitEmlExpression` already renders as valid EML literal text. */
const isInlineLiteral = (e: Expression): boolean =>
  isAtom(e) || e.type === 'List' || e.type === 'Dict' || e.type === 'Set' || e.type === 'Tuple';

/** Real compound-assignment operator text for a Subscript/Attribute target —
 *  EML's `^+`/`^-`/`^*`/`^/` sigil is bare-identifier-only (§5.1's two-stage
 *  declare-vs-augment disambiguation doesn't apply to a container element,
 *  which can't be "declared" the same way), so EML spells this with the real
 *  operator directly (`scores["alice"] += 5`, tests/fixtures/23_dict_literal.eml). */
const REAL_COMPOUND_OP: Record<string, string> = { '+': '+=', '-': '-=', '*': '*=', '/': '/=', '%': '%=' };

/** Indent every line of a (possibly multi-line) block by four spaces (ported
 *  verbatim from the forward Python emitter). A string-transform, not a
 *  numeric depth counter — nesting composes for free since each recursive
 *  `emitEmlStatement()` call returns a fully-rendered string the caller wraps
 *  in one more `indent()`. */
function indent(block: string): string {
  return block
    .split('\n')
    .map((l) => (l === '' ? '' : '    ' + l))
    .join('\n');
}

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
      return `${child(expr.base, 8, true)}^${emitEmlExpression(expr.exponent)}`;
    case 'Binary': {
      const prec = expr.op === '+' || expr.op === '-' ? 6 : 7;
      const nonAssoc = expr.op === '-' || expr.op === '/' || expr.op === '%';
      return `${child(expr.left, prec)} ${expr.op} ${child(expr.right, prec, nonAssoc)}`;
    }
    case 'Comparison':
      return `${child(expr.left, 5)} ${expr.op} ${child(expr.right, 5)}`;
    case 'Logical': {
      const prec = expr.op === 'or' ? 2 : 3;
      return `${child(expr.left, prec)} ${expr.op} ${child(expr.right, prec)}`;
    }
    case 'Not':
      return `not ${child(expr.operand, 4)}`;
    case 'Conditional':
      return `${child(expr.test, 1, true)} ? ${child(expr.consequent, 1, true)} : ${emitEmlExpression(expr.alternate)}`;
    case 'Range':
      return `[${emitEmlExpression(expr.start)}:${emitEmlExpression(expr.end)}]`;
    case 'Sum':
      return `Σ(${emitEmlExpression(expr.expr)}, ${expr.iterator.name} in ${emitEmlExpression(expr.range)})`;
    case 'Membership':
      return `${emitEmlExpression(expr.element)} in ${emitEmlExpression(expr.collection)}`;
    case 'Call':
      if (expr.callee.type !== 'Identifier' && expr.callee.type !== 'Attribute') {
        throw new EmlEmitError('Reverse Python->EML does not yet support this call form.');
      }
      return `${emitEmlExpression(expr.callee)}(${expr.args.map(emitEmlExpression).join(', ')})`;
    case 'Matrix':
      return `<M>(${emitEmlExpression(expr.data)})`;
    case 'Transpose':
      return `${child(expr.operand, 9)}^T`;
    case 'List':
      return `[${expr.elements.map(emitEmlExpression).join(', ')}]`;
    case 'Tuple':
      // A single element needs the trailing comma to be a real Python tuple
      // — `(x)` alone is just grouping, not a 1-tuple.
      if (expr.elements.length === 0) return '()';
      if (expr.elements.length === 1) return `(${emitEmlExpression(expr.elements[0]!)},)`;
      return `(${expr.elements.map(emitEmlExpression).join(', ')})`;
    case 'Await':
      // Async/await is a forward-only construct (Phase 3 temporal loops); the
      // reverse path stays statement-level. Fail loudly.
      throw new EmlEmitError('Reverse Python->EML does not support await / async (temporal loops are forward-only).');
    case 'Dict':
      return `{${expr.entries.map((e) => `${emitEmlExpression(e.key)}: ${emitEmlExpression(e.value)}`).join(', ')}}`;
    case 'Set':
      return `{${expr.elements.map(emitEmlExpression).join(', ')}}`;
    case 'Subscript':
      return `${child(expr.object, 9)}[${emitEmlExpression(expr.index)}]`;
    case 'Attribute':
      return `${child(expr.object, 9)}.${expr.attr}`;
    case 'Slice':
      return `${expr.start ? emitEmlExpression(expr.start) : ''}:${expr.stop ? emitEmlExpression(expr.stop) : ''}`;
    case 'ListComp': {
      const cond = expr.condition ? ` if ${emitEmlExpression(expr.condition)}` : '';
      return `[${emitEmlExpression(expr.expr)} for ${expr.iterator.name} in ${emitEmlExpression(expr.iterable)}${cond}]`;
    }
  }
}

/**
 * Emits an `if`/`elif`/`else` chain and reports which names ended up declared
 * in EVERY branch — only meaningful (non-empty) when the chain is exhaustive,
 * i.e. ends in a plain `else`. This mirrors the FORWARD semantic analyzer's
 * own branch-scope-clone-then-merge rule for Phase 6 control flow: a name
 * declared in only ONE branch must NOT be treated as already declared once
 * execution reaches code after the whole if/else (the emitted EML's `^+`
 * sigil is ambiguous between "declare" and "augment" — see the two-stage
 * disambiguation rule — so getting this wrong would make the FORWARD parser
 * misinterpret a later, legitimately-bound `x^+n` as a fresh declaration, or
 * would cause this emitter to falsely reject an actually-safe `+=`). `while`/
 * `for` don't need this: 0+ iterations aren't mutually exclusive branches, so
 * they simply share one live `bound` set with their enclosing scope (matching
 * the forward analyzer's own "no branch cloning for loops" choice).
 */
function emitIfChain(stmt: IfStatement, bound: Set<string>): { text: string; declaredInAllBranches: Set<string> } {
  const lines: string[] = [`if ${emitEmlExpression(stmt.test)}:`];
  const bodyBound = new Set(bound);
  for (const s of stmt.body) lines.push(indent(emitEmlStatement(s, bodyBound)));
  const bodyNew = new Set([...bodyBound].filter((n) => !bound.has(n)));

  if (stmt.orelse.length === 1 && stmt.orelse[0]!.type === 'If') {
    // elif — recurse (not through emitEmlStatement, so the exhaustiveness
    // metadata survives the recursion); prefixing 'el' turns "if ..." into
    // "elif ..." for free since that's always how the nested render starts.
    const nested = emitIfChain(stmt.orelse[0] as IfStatement, bound);
    lines.push('el' + nested.text);
    const declaredInAllBranches = new Set([...bodyNew].filter((n) => nested.declaredInAllBranches.has(n)));
    return { text: lines.join('\n'), declaredInAllBranches };
  }
  if (stmt.orelse.length > 0) {
    const orelseBound = new Set(bound);
    lines.push('else:');
    for (const s of stmt.orelse) lines.push(indent(emitEmlStatement(s, orelseBound)));
    const orelseNew = new Set([...orelseBound].filter((n) => !bound.has(n)));
    const declaredInAllBranches = new Set([...bodyNew].filter((n) => orelseNew.has(n)));
    return { text: lines.join('\n'), declaredInAllBranches };
  }
  // No elif/else at all — the if-branch might not execute; nothing merges.
  return { text: lines.join('\n'), declaredInAllBranches: new Set() };
}

export function emitEmlStatement(stmt: Statement, bound: Set<string> = new Set()): string {
  switch (stmt.type) {
    case 'Assignment': {
      if (stmt.target.type === 'Subscript' || stmt.target.type === 'Attribute') {
        // Subscript/attribute targets always use the reversed-arrow form —
        // EML's `^+` sigil is bare-identifier-only (no declare/augment
        // ambiguity exists for a container element or an object attribute,
        // so there's nothing to disambiguate here).
        return `${emitEmlExpression(stmt.value)} => ${emitEmlExpression(stmt.target)}`;
      }
      const v = stmt.value;
      let line: string;
      // Reassigning an ALREADY-declared name must NOT use the `^+` sigil —
      // the forward parser's two-stage disambiguation would read it as an
      // augmented add, not a fresh value (this was a latent bug: no prior
      // fixture reassigned a bound name with plain `=`, since only loops/
      // branches — Phase A — make that a common pattern, e.g. Fibonacci's
      // `a, b = b, a + b`-style per-iteration update). The reversed-arrow
      // form is unconditional and works uniformly regardless of value shape.
      if (bound.has(stmt.target.name)) {
        line = `${emitEmlExpression(v)} => ${stmt.target.name}`;
      } else if (isInlineLiteral(v)) {
        line = `${stmt.target.name}^+${emitEmlExpression(v)}`;
      } else {
        line = `${emitEmlExpression(v)} => ${stmt.target.name}`;
      }
      bound.add(stmt.target.name);
      return line;
    }
    case 'AugmentedAssign': {
      if (stmt.target.type === 'Subscript' || stmt.target.type === 'Attribute') {
        if (!isAtom(stmt.value)) {
          throw new EmlEmitError(
            `EML cannot express an augmented assignment with a compound right-hand side ('${emitEmlExpression(stmt.target)} ${stmt.op}= …').`,
          );
        }
        return `${emitEmlExpression(stmt.target)} ${REAL_COMPOUND_OP[stmt.op]} ${emitEmlExpression(stmt.value)}`;
      }
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
      if (stmt.end !== undefined) {
        throw new EmlEmitError(
          "EML cannot express print's 'end' keyword argument — there is no forward syntax for a custom print terminator.",
        );
      }
      return `${emitEmlExpression(stmt.value)}^0`;
    case 'ExpressionStatement':
      return emitEmlExpression(stmt.expression);
    case 'FunctionDef': {
      // A function body is scope-isolated in BOTH directions, unlike every
      // prior block construct (if/while/for/try), which are only isolated
      // going OUT (nothing declared inside reliably survives outside, but
      // names from the enclosing scope are still visible/mutable inside).
      // A fresh, function-LOCAL `bound` set — not cloned from the enclosing
      // scope — mirrors real Python local-scope semantics: nothing declared
      // in the caller leaks in, and nothing declared inside leaks back out.
      // Params start pre-bound (an augmented assign on a parameter is legal
      // from the first line).
      const lines: string[] = [];
      if (stmt.temperature === 'cold') lines.push('@cold');
      // `@hot` is never emitted here: the forward emitter renders it as a
      // bare comment (never a real decorator), and comments are never
      // tokenized by the reverse lexer — so a `temperature === 'hot'` value
      // can only ever arise from a freshly-forward-transpiled AST, never
      // from re-parsing already-emitted Python. There is nothing to emit for
      // it either way.
      const params = stmt.params.map((p) => p.name).join(', ');
      lines.push(`def ${stmt.name}(${params}):`);
      const fnBound = new Set(stmt.params.map((p) => p.name));
      for (const s of stmt.body) lines.push(indent(emitEmlStatement(s, fnBound)));
      return lines.join('\n');
    }
    case 'Return':
      return stmt.value ? `return ${emitEmlExpression(stmt.value)}` : 'return';
    case 'OverlayAssign':
      throw new EmlEmitError(`Internal error: emitEml received unresolved OverlayAssign for '${stmt.target.name}'.`);
    case 'If': {
      const { text, declaredInAllBranches } = emitIfChain(stmt, bound);
      for (const name of declaredInAllBranches) bound.add(name);
      return text;
    }
    case 'While': {
      const lines: string[] = [`while ${emitEmlExpression(stmt.test)}:`];
      for (const s of stmt.body) lines.push(indent(emitEmlStatement(s, bound)));
      return lines.join('\n');
    }
    case 'ForIn': {
      const lines: string[] = [`for ${stmt.target.name} in ${emitEmlExpression(stmt.iterable)}:`];
      for (const s of stmt.body) lines.push(indent(emitEmlStatement(s, bound)));
      return lines.join('\n');
    }
    case 'Break':
      return 'break';
    case 'Continue':
      return 'continue';
    case 'Import':
      return `import ${stmt.module}`;
    case 'Try': {
      // Conservative per-part scope, mirroring the forward semantic
      // analyzer's own treatment of try/except (more conservative than
      // if/elif/else's branch-merge, since the try body might fail
      // partway through): the try body and each except handler each get
      // an ISOLATED clone that never merges back — a name declared in
      // either is not reliably bound afterward, since which of them (if
      // any) actually completed is conditional. `finally` shares the SAME
      // live `bound` (no cloning) — it always runs unconditionally, so a
      // name declared there IS reliably bound afterward, the same
      // reasoning already applied to `while`/`for` bodies (Phase A).
      const lines: string[] = ['try:'];
      const tryBound = new Set(bound);
      for (const s of stmt.body) lines.push(indent(emitEmlStatement(s, tryBound)));
      for (const h of stmt.handlers) {
        const header = h.exceptionType
          ? h.name
            ? `except ${h.exceptionType} as ${h.name}:`
            : `except ${h.exceptionType}:`
          : 'except:';
        lines.push(header);
        const handlerBound = new Set(bound);
        for (const s of h.body) lines.push(indent(emitEmlStatement(s, handlerBound)));
      }
      if (stmt.finallyBody.length > 0) {
        lines.push('finally:');
        for (const s of stmt.finallyBody) lines.push(indent(emitEmlStatement(s, bound)));
      }
      return lines.join('\n');
    }
    case 'Raise':
      return stmt.exception ? `raise ${emitEmlExpression(stmt.exception)}` : 'raise';
    case 'With': {
      // Unlike `try` (which clones per-part since the body might fail
      // partway through), `with`'s body always executes in full before any
      // exception matters — same reasoning as `while`/`for` (Phase A): the
      // SAME live `bound` set is used, and the `as` target is reliably bound
      // afterward too.
      const header = stmt.target
        ? `with ${emitEmlExpression(stmt.contextExpr)} as ${stmt.target.name}:`
        : `with ${emitEmlExpression(stmt.contextExpr)}:`;
      if (stmt.target) bound.add(stmt.target.name);
      const lines: string[] = [header];
      for (const s of stmt.body) lines.push(indent(emitEmlStatement(s, bound)));
      return lines.join('\n');
    }
    case 'ClassDef': {
      // Fresh, class-local `bound` scope — isolated from the enclosing scope,
      // same reasoning as FunctionDef (Phase E1): a class-level assignment (a
      // class variable) must not be confused with a same-named module-level
      // binding. Nested method bodies don't need any special handling here —
      // the `FunctionDef` case above already builds its OWN fresh `fnBound`
      // from its params regardless of what's passed in, so method isolation
      // falls out for free.
      const lines: string[] = [`class ${stmt.name}:`];
      const classBound = new Set<string>();
      for (const s of stmt.body) lines.push(indent(emitEmlStatement(s, classBound)));
      return lines.join('\n');
    }
  }
}

export function emitEmlProgram(program: Program): string {
  const bound = new Set<string>();
  return program.body.map((s) => emitEmlStatement(s, bound)).join('\n') + '\n';
}
