import type {
  Program,
  Statement,
  Expression,
  Identifier,
  RangeExpression,
  SumExpression,
  ListLiteral,
  DictLiteral,
  SetLiteral,
  SubscriptExpression,
  AttributeExpression,
  ComparisonOperator,
  BinaryOperator,
  IfStatement,
  WhileStatement,
  ForInStatement,
  ExceptHandler,
  TryStatement,
  RaiseStatement,
  FunctionDef,
  ReturnStatement,
  Temperature,
} from '@eml/types';
import { lexPython, type PyToken, type PyTokenType } from './py-lexer';

export class PyParseError extends Error {
  constructor(message: string, public readonly line: number, public readonly column: number) {
    super(message);
    this.name = 'PyParseError';
  }
}

const COMPARISON: Partial<Record<PyTokenType, ComparisonOperator>> = {
  GT: '>',
  LT: '<',
  GE: '>=',
  LE: '<=',
  EQEQ: '==',
  NE: '!=',
};

const AUG: Partial<Record<PyTokenType, BinaryOperator>> = {
  PLUSEQ: '+',
  MINUSEQ: '-',
  STAREQ: '*',
  SLASHEQ: '/',
};

/** Python `range(a, b)` is exclusive; recover the EML inclusive end (b - 1). */
function toInclusiveEnd(pyEnd: Expression): Expression {
  if (
    pyEnd.type === 'Binary' &&
    pyEnd.op === '+' &&
    pyEnd.right.type === 'NumberLiteral' &&
    pyEnd.right.value === 1
  ) {
    return pyEnd.left; // range(a, X+1) -> inclusive end X
  }
  if (pyEnd.type === 'NumberLiteral') {
    const v = pyEnd.value - 1;
    return { type: 'NumberLiteral', raw: String(v), value: v };
  }
  return { type: 'Binary', op: '-', left: pyEnd, right: { type: 'NumberLiteral', raw: '1', value: 1 } };
}

class PyParser {
  private pos = 0;
  constructor(private readonly tokens: PyToken[]) {}

  private peek(o = 0): PyToken {
    return this.tokens[this.pos + o] ?? this.tokens[this.tokens.length - 1]!;
  }
  private next(): PyToken {
    const t = this.peek();
    if (this.pos < this.tokens.length - 1) this.pos++;
    return t;
  }
  private check(type: PyTokenType): boolean {
    return this.peek().type === type;
  }
  private checkName(value: string): boolean {
    return this.peek().type === 'NAME' && this.peek().value === value;
  }
  private expect(type: PyTokenType, what?: string): PyToken {
    if (!this.check(type)) {
      const t = this.peek();
      throw new PyParseError(`Expected ${what ?? type} but found ${t.type} ('${t.value}')`, t.line, t.column);
    }
    return this.next();
  }
  private expectName(value: string): PyToken {
    if (!this.checkName(value)) {
      const t = this.peek();
      throw new PyParseError(`Expected '${value}' but found ${t.type} ('${t.value}')`, t.line, t.column);
    }
    return this.next();
  }
  private skipNewlines(): void {
    while (this.check('NEWLINE')) this.next();
  }
  private skipLine(): void {
    while (!this.check('NEWLINE') && !this.check('EOF')) this.next();
  }

  /** True iff the current `import` is immediately followed by exactly one
   *  bare module name then a statement boundary — the only shape EML's own
   *  `ImportStatement` can express. Anything else (aliased `as`, dotted
   *  `os.path`, multiple comma-separated modules) has no EML form. */
  private isBareImport(): boolean {
    return (
      this.peek(1).type === 'NAME' &&
      (this.peek(2).type === 'NEWLINE' || this.peek(2).type === 'EOF' || this.peek(2).type === 'DEDENT')
    );
  }

  parseProgram(): Program {
    const body: Statement[] = [];
    this.skipNewlines();
    while (!this.check('EOF')) {
      // `from X import Y` never has an EML form — always skip. A non-bare
      // `import` (aliased `as`, dotted path) has no EML form either, so it
      // skips too; a genuinely bare `import module` falls through to
      // `parseStatement()`, which now parses it into a real node (Phase C).
      // `import functools` is a special case (Phase E1): the forward semantic
      // analyzer auto-synthesizes this exact bare import whenever a non-async
      // `@cold` function exists, completely independent of any user-written
      // import — so treating it as a real, preservable `ImportStatement`
      // would duplicate it on the next forward pass (once from the
      // reconstructed literal import, once again from the auto-collection
      // triggered by seeing `@cold` again). Skip it here exactly like the
      // already-unrecoverable `import numpy as np` shape.
      const isFunctoolsImport = this.checkName('import') && this.isBareImport() && this.peek(1).value === 'functools';
      if (this.checkName('from') || isFunctoolsImport || (this.checkName('import') && !this.isBareImport())) {
        this.skipLine();
        this.skipNewlines();
        continue;
      }
      const stmt = this.parseStatement();
      body.push(stmt);
      this.expectStatementEnd();
      this.skipNewlines();
    }
    return { type: 'Program', body };
  }

  /**
   * After a statement: `NEWLINE`/`EOF` end it normally. A compound (block)
   * statement — If/While/ForIn — already consumed its own trailing `DEDENT`
   * closing its body inside `parseBlock()`, so the next statement may start
   * immediately; detect that by checking whether the token just consumed was
   * a `DEDENT` (mirrors the forward EML parser's `expectStatementEnd()`).
   */
  private expectStatementEnd(): void {
    if (this.check('EOF') || this.check('NEWLINE') || this.check('DEDENT')) return;
    const prev = this.tokens[this.pos - 1];
    if (prev?.type === 'DEDENT') return;
    const t = this.peek();
    throw new PyParseError(`Unexpected token after statement: ${t.type} ('${t.value}')`, t.line, t.column);
  }

  /** Parse an indented suite: `NEWLINE INDENT stmt+ DEDENT` (mirrors the forward EML parser's `parseBlock()`). */
  private parseBlock(): Statement[] {
    this.expect('NEWLINE', "newline after ':'");
    this.skipNewlines();
    this.expect('INDENT', 'an indented block');
    const body: Statement[] = [];
    this.skipNewlines();
    while (!this.check('DEDENT') && !this.check('EOF')) {
      body.push(this.parseStatement());
      this.expectStatementEnd();
      this.skipNewlines();
    }
    if (!this.check('EOF')) this.expect('DEDENT', 'end of the indented block');
    if (body.length === 0) {
      const t = this.peek();
      throw new PyParseError('block body cannot be empty', t.line, t.column);
    }
    return body;
  }

  private parseStatement(): Statement {
    if (this.checkName('if')) return this.parseIf();
    if (this.checkName('while')) return this.parseWhile();
    if (this.checkName('for')) return this.parseForIn();
    if (this.checkName('try')) return this.parseTry();
    if (this.checkName('raise')) return this.parseRaise();
    if (this.checkName('async')) {
      const t = this.peek();
      throw new PyParseError(
        'Reverse Python->EML does not support async functions (temporal loops are a permanent forward-only construct).',
        t.line,
        t.column,
      );
    }
    if (this.check('AT') || this.checkName('def')) return this.parseFunctionDef();
    if (this.checkName('return')) return this.parseReturn();
    // `pass` has the exact same silent-mistranslation vulnerability
    // break/continue had before being recognized explicitly (see below): a
    // bare keyword immediately followed by end-of-line is indistinguishable
    // from a harmless variable reference to this simplified parser. It's
    // especially relevant now that `try`/`except` bodies (which `parseBlock()`
    // requires to be non-empty) commonly need it (`except SomeError: pass`).
    // EML has no no-op-statement equivalent to emit it as, so fail loudly
    // rather than silently treat `pass` as a reference to a variable of that
    // name.
    if (this.checkName('pass')) {
      const t = this.next();
      throw new PyParseError(
        "Reverse Python->EML does not support 'pass' (EML has no no-op-statement equivalent).",
        t.line,
        t.column,
      );
    }
    // `break`/`continue` are the one pair of bare, argument-less keywords that
    // — if NOT recognized here — would silently parse as a harmless bare
    // Identifier expression statement (a real correctness gap, not a parse
    // failure: `break`\n is syntactically indistinguishable from a variable
    // reference to the rest of this simplified parser, unlike every other
    // still-unsupported keyword, which happens to be followed by something
    // that already breaks statement-end parsing). Recognizing them explicitly
    // routes them to eml-emitter.ts's existing Break/Continue throw-stubs
    // instead of silently mistranslating control flow into a dead reference.
    if (this.checkName('break')) {
      this.next();
      return { type: 'Break' };
    }
    if (this.checkName('continue')) {
      this.next();
      return { type: 'Continue' };
    }
    // A bare `import module` (single name, no `as`, no dotted path) — the only
    // shape EML's own `ImportStatement` can express. Recognized here (not just
    // in `parseProgram()`'s top-level loop) so it also works nested inside a
    // block. Anything else starting with `import` (aliased, dotted) or `from`
    // has no EML form; `parseProgram()`'s pre-filter routes those to a silent
    // skip instead of ever reaching this branch at the top level — but if one
    // shows up NESTED (never silently skipped there), this only consumes
    // `import <name>`, leaving a trailing `as`/`.` token to trip
    // `expectStatementEnd()` and fail loudly, the same "protection for free"
    // every other keyword here already relies on.
    if (this.checkName('import')) {
      this.next();
      const modTok = this.expect('NAME', 'module name');
      return { type: 'Import', module: modTok.value };
    }
    // Parse the LHS as a general expression first, THEN check what follows —
    // rather than the old 2-token "NAME immediately followed by ASSIGN"
    // lookahead, which could only ever recognize a bare name. This is the
    // same split the forward EML parser uses (`parseAssignTargetChain()` vs.
    // `toAssignTarget()`): `parseExpr()` already naturally stops right after
    // an `Identifier`/`Subscript` (neither `=` nor `+=` etc. are valid
    // expression-continuation tokens), so this produces byte-identical
    // results for a plain `x = value` while also correctly handling
    // `d[k] = value` (Phase B2).
    const expr = this.parseExpr();
    if (this.check('ASSIGN')) {
      this.next();
      const target = this.toAssignTarget(expr);
      const value = this.parseExpr();
      return { type: 'Assignment', target, value, declares: false };
    }
    const augOp = AUG[this.peek().type];
    if (augOp) {
      this.next();
      const target = this.toAssignTarget(expr);
      const value = this.parseExpr();
      return { type: 'AugmentedAssign', target, op: augOp, value };
    }
    // `parsePostfix()` only ever builds a Call over an Identifier callee (see
    // below); `expr.callee.type === 'Identifier'` is always true here, but
    // spelled out since the shared FunctionCall type now also allows Attribute.
    if (expr.type === 'Call' && expr.callee.type === 'Identifier' && expr.callee.name === 'print' && expr.args.length === 1) {
      return { type: 'Output', value: expr.args[0]! };
    }
    return { type: 'ExpressionStatement', expression: expr };
  }

  /** Validates that an already-parsed expression collapses into a legal
   *  assignment target: `Identifier`, `Subscript` (Phase B2), or `Attribute`
   *  (Phase C) — the same three shapes the forward parser's own
   *  `AssignTarget` union has always allowed. */
  private toAssignTarget(expr: Expression): Identifier | SubscriptExpression | AttributeExpression {
    if (expr.type === 'Identifier' || expr.type === 'Subscript' || expr.type === 'Attribute') return expr;
    throw new PyParseError(
      'Reverse Python->EML currently supports a bare name, a subscript (e.g. \'d[k]\'), or an attribute (e.g. \'obj.attr\') as an assignment target.',
      this.peek().line,
      this.peek().column,
    );
  }

  /** `if`/`elif` share this exact shape — the caller has already checked which
   *  keyword is current via `checkName`; consume it and parse the rest. */
  private parseIf(): IfStatement {
    this.next(); // 'if' or 'elif'
    const test = this.parseExpr();
    this.expect('COLON', "':' after the if/elif condition");
    const body = this.parseBlock();
    const orelse = this.parseElseOrElif();
    return { type: 'If', test, body, orelse };
  }

  /** `elif` recurses into `parseIf()` (wrapped as the sole `orelse` element,
   *  mirroring Python's own `elif`-chain-as-nested-`If` AST shape); a plain
   *  `else:` parses its own block directly. Neither present -> empty orelse. */
  private parseElseOrElif(): Statement[] {
    if (this.checkName('elif')) {
      return [this.parseIf()];
    }
    if (this.checkName('else')) {
      this.next();
      this.expect('COLON', "':' after 'else'");
      return this.parseBlock();
    }
    return [];
  }

  private parseWhile(): WhileStatement {
    this.expectName('while');
    const test = this.parseExpr();
    this.expect('COLON', "':' after the while condition");
    const body = this.parseBlock();
    return { type: 'While', test, body };
  }

  private parseForIn(): ForInStatement {
    this.expectName('for');
    const targetTok = this.expect('NAME', 'for-loop variable');
    const target: Identifier = { type: 'Identifier', name: targetTok.value };
    this.expectName('in');
    const iterable = this.parseExpr();
    this.expect('COLON', "':' after the for...in clause");
    const body = this.parseBlock();
    return { type: 'ForIn', target, iterable, body };
  }

  /** `try: <body> (except ...: <body>)+ [finally: <body>]` — mirrors the
   *  forward parser's `parseTry()` exactly, including requiring at least one
   *  `except` or a `finally` (Python's own rule). */
  private parseTry(): TryStatement {
    this.expectName('try');
    this.expect('COLON', "':' after 'try'");
    const body = this.parseBlock();
    const handlers: ExceptHandler[] = [];
    while (this.checkName('except')) {
      handlers.push(this.parseExceptHandler());
    }
    let finallyBody: Statement[] = [];
    if (this.checkName('finally')) {
      this.next();
      this.expect('COLON', "':' after 'finally'");
      finallyBody = this.parseBlock();
    }
    if (handlers.length === 0 && finallyBody.length === 0) {
      const t = this.peek();
      throw new PyParseError("'try' must have at least one 'except' clause or a 'finally' clause", t.line, t.column);
    }
    return { type: 'Try', body, handlers, finallyBody };
  }

  /** `except [ExceptionType] [as name]:` — bare `except:` (no type) is a
   *  catch-all, matching `except Exception:`. */
  private parseExceptHandler(): ExceptHandler {
    this.expectName('except');
    let exceptionType: string | undefined;
    let name: string | undefined;
    if (!this.check('COLON')) {
      exceptionType = this.expect('NAME', 'exception type').value;
      if (this.checkName('as')) {
        this.next();
        name = this.expect('NAME', 'exception binding name').value;
      }
    }
    this.expect('COLON', "':' after 'except'");
    const body = this.parseBlock();
    return { type: 'ExceptHandler', exceptionType, name, body };
  }

  /** `raise` (bare re-raise) or `raise <expression>`. */
  private parseRaise(): RaiseStatement {
    this.expectName('raise');
    if (this.check('NEWLINE') || this.check('DEDENT') || this.check('EOF')) {
      return { type: 'Raise' };
    }
    return { type: 'Raise', exception: this.parseExpr() };
  }

  /** `[@functools.cache] def name(params): <body>` — the only decorator shape
   *  this round supports is exactly what the forward emitter ever produces
   *  for `@cold` (`packages/transpiler-python/src/emitter.ts`'s `FunctionDef`
   *  case); `@hot` emits only a comment and is therefore permanently
   *  unrecoverable here (comments are never tokenized), so there is no
   *  decorator shape to recognize for it. Anything else after `@` (a bare
   *  custom decorator, `@staticmethod`, `@property`, `functools.lru_cache(...)`,
   *  a parenthesized `@functools.cache()`) is deliberately rejected rather
   *  than silently partial-matched. */
  private parseFunctionDef(): FunctionDef {
    let temperature: Temperature | undefined;
    while (this.check('AT')) {
      const t = this.next(); // '@'
      this.expectName('functools');
      this.expect('DOT', "'.' in decorator (only '@functools.cache' is supported)");
      this.expectName('cache');
      if (temperature) {
        throw new PyParseError('Reverse Python->EML does not support multiple decorators on one function.', t.line, t.column);
      }
      temperature = 'cold';
      this.expect('NEWLINE', "newline after decorator");
      this.skipNewlines();
    }
    this.expectName('def');
    const name = this.expect('NAME', 'function name').value;
    this.expect('LPAREN');
    const params: Identifier[] = [];
    if (!this.check('RPAREN')) {
      params.push({ type: 'Identifier', name: this.expect('NAME', 'parameter name').value });
      while (this.check('COMMA')) {
        this.next();
        params.push({ type: 'Identifier', name: this.expect('NAME', 'parameter name').value });
      }
    }
    this.expect('RPAREN');
    this.expect('COLON', "':' after the function signature");
    const body = this.parseBlock();
    return { type: 'FunctionDef', name, params, decorators: [], body, temperature, isAsync: false };
  }

  /** `return` (bare) or `return <expression>`. */
  private parseReturn(): ReturnStatement {
    this.expectName('return');
    if (this.check('NEWLINE') || this.check('DEDENT') || this.check('EOF')) {
      return { type: 'Return' };
    }
    return { type: 'Return', value: this.parseExpr() };
  }

  // ── expressions ─────────────────────────────────────────────────────────────

  private parseExpr(): Expression {
    return this.parseTernary();
  }

  private parseTernary(): Expression {
    const consequent = this.parseComparison();
    if (this.checkName('if')) {
      this.next();
      const test = this.parseComparison();
      this.expectName('else');
      const alternate = this.parseTernary();
      return { type: 'Conditional', test, consequent, alternate };
    }
    return consequent;
  }

  private parseComparison(): Expression {
    const left = this.parseMembership();
    const op = COMPARISON[this.peek().type];
    if (op) {
      this.next();
      const right = this.parseMembership();
      return { type: 'Comparison', op, left, right };
    }
    return left;
  }

  private parseMembership(): Expression {
    const left = this.parseAdditive();
    if (this.checkName('in')) {
      this.next();
      const collection = this.parseAdditive();
      return { type: 'Membership', element: left, collection };
    }
    return left;
  }

  private parseAdditive(): Expression {
    let left = this.parseMultiplicative();
    while (this.check('PLUS') || this.check('MINUS')) {
      const op: BinaryOperator = this.next().type === 'PLUS' ? '+' : '-';
      const right = this.parseMultiplicative();
      left = { type: 'Binary', op, left, right };
    }
    return left;
  }

  private parseMultiplicative(): Expression {
    let left = this.parsePower();
    while (this.check('STAR') || this.check('SLASH')) {
      const op: BinaryOperator = this.next().type === 'STAR' ? '*' : '/';
      const right = this.parsePower();
      left = { type: 'Binary', op, left, right };
    }
    return left;
  }

  private parsePower(): Expression {
    const base = this.parsePostfix();
    if (this.check('POW')) {
      this.next();
      const exponent = this.parsePower(); // right-associative
      return { type: 'Power', base, exponent };
    }
    return base;
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();
    for (;;) {
      if (this.check('LPAREN') && (expr.type === 'Identifier' || expr.type === 'Attribute')) {
        const args = this.parseArgs();
        expr = { type: 'Call', callee: expr, args };
      } else if (this.check('LBRACKET')) {
        this.next(); // [
        const index = this.parseExpr();
        this.expect('RBRACKET', "']' after subscript index");
        expr = { type: 'Subscript', object: expr, index };
      } else if (this.check('DOT')) {
        this.next(); // .
        const attrTok = this.expect('NAME', 'attribute name');
        expr = { type: 'Attribute', object: expr, attr: attrTok.value };
      } else {
        break;
      }
    }
    return expr;
  }

  private parseArgs(): Expression[] {
    this.expect('LPAREN');
    const args: Expression[] = [];
    if (!this.check('RPAREN')) {
      args.push(this.parseExpr());
      while (this.check('COMMA')) {
        this.next();
        args.push(this.parseExpr());
      }
    }
    this.expect('RPAREN');
    return args;
  }

  private parsePrimary(): Expression {
    const t = this.peek();
    if (t.type === 'MINUS' || t.type === 'PLUS') {
      this.next();
      const operand = this.parsePrimary();
      if (t.type === 'PLUS') return operand;
      if (operand.type === 'NumberLiteral') {
        return { type: 'NumberLiteral', raw: '-' + operand.raw, value: -operand.value };
      }
      throw new PyParseError('Unary minus is only supported on numeric literals in the EML subset', t.line, t.column);
    }
    if (t.type === 'NUMBER') {
      this.next();
      return { type: 'NumberLiteral', raw: t.value, value: Number(t.value) };
    }
    if (t.type === 'STRING') {
      this.next();
      return { type: 'StringLiteral', value: t.value };
    }
    if (t.type === 'LPAREN') {
      this.next();
      const e = this.parseExpr();
      this.expect('RPAREN');
      return e;
    }
    if (t.type === 'LBRACKET') {
      return this.parseList();
    }
    if (t.type === 'LBRACE') {
      return this.parseBraceLiteral();
    }
    if (t.type === 'NAME') {
      if (t.value === 'sum' && this.peek(1).type === 'LPAREN') return this.parseSum();
      if (t.value === 'range' && this.peek(1).type === 'LPAREN') return this.parseRangeCall();
      if (t.value === 'np' && this.peek(1).type === 'DOT') return this.parseNp();
      this.next();
      return { type: 'Identifier', name: t.value };
    }
    throw new PyParseError(`Unexpected token ${t.type} ('${t.value}')`, t.line, t.column);
  }

  private parseList(): ListLiteral {
    this.expect('LBRACKET');
    const elements: Expression[] = [];
    if (!this.check('RBRACKET')) {
      elements.push(this.parseExpr());
      while (this.check('COMMA')) {
        this.next();
        elements.push(this.parseExpr());
      }
    }
    this.expect('RBRACKET');
    return { type: 'List', elements };
  }

  /** `{}` (empty, Python parity) / `{k: v, ...}` (dict) / `{v, ...}` (set) —
   *  mirrors the forward EML parser's exact disambiguation: parse the first
   *  element as an expression, then peek for `COLON` to decide dict vs set. */
  private parseBraceLiteral(): DictLiteral | SetLiteral {
    this.expect('LBRACE');
    if (this.check('RBRACE')) {
      this.next();
      return { type: 'Dict', entries: [] };
    }
    const first = this.parseExpr();
    if (this.check('COLON')) {
      this.next();
      const firstValue = this.parseExpr();
      const entries: DictLiteral['entries'] = [{ key: first, value: firstValue }];
      while (this.check('COMMA')) {
        this.next();
        const key = this.parseExpr();
        this.expect('COLON', "':' in dict literal");
        const value = this.parseExpr();
        entries.push({ key, value });
      }
      this.expect('RBRACE', "'}' after dict literal");
      return { type: 'Dict', entries };
    }
    const elements: Expression[] = [first];
    while (this.check('COMMA')) {
      this.next();
      elements.push(this.parseExpr());
    }
    this.expect('RBRACE', "'}' after set literal");
    return { type: 'Set', elements };
  }

  private parseSum(): SumExpression {
    this.expectName('sum');
    this.expect('LPAREN');
    const expr = this.parseExpr();
    this.expectName('for');
    const iterator: Identifier = { type: 'Identifier', name: this.expect('NAME', 'iterator').value };
    this.expectName('in');
    const iterable = this.parseAdditive();
    this.expect('RPAREN');
    if (iterable.type !== 'Range') {
      throw new PyParseError('sum() comprehension must iterate over range(...)', this.peek().line, this.peek().column);
    }
    return { type: 'Sum', expr, iterator, range: iterable };
  }

  private parseRangeCall(): RangeExpression {
    this.expectName('range');
    this.expect('LPAREN');
    const start = this.parseExpr();
    this.expect('COMMA', "',' in range()");
    const endRaw = this.parseExpr();
    this.expect('RPAREN');
    return { type: 'Range', start, end: toInclusiveEnd(endRaw), inclusiveEnd: true };
  }

  private parseNp(): Expression {
    this.expectName('np');
    this.expect('DOT');
    const method = this.expect('NAME', 'numpy method').value;
    this.expect('LPAREN');
    const arg = this.parseExpr();
    this.expect('RPAREN');
    if (method === 'array') return { type: 'Matrix', data: arg };
    if (method === 'transpose') return { type: 'Transpose', operand: arg };
    throw new PyParseError(`Unsupported numpy method: np.${method}`, this.peek().line, this.peek().column);
  }
}

export function parsePython(source: string): Program {
  return new PyParser(lexPython(source)).parseProgram();
}
