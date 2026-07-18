import type {
  Token,
  TokenType,
  Program,
  Statement,
  Expression,
  Identifier,
  RangeExpression,
  ListLiteral,
  ListComprehension,
  SumExpression,
  MatrixExpression,
  FunctionCall,
  FunctionDef,
  Decorator,
  DecoratorArg,
  ReturnStatement,
  Temperature,
  AwaitExpression,
  ComparisonOperator,
  BinaryOperator,
  IfStatement,
  WhileStatement,
  ForInStatement,
  DictLiteral,
  SetLiteral,
  SubscriptExpression,
  AttributeExpression,
  SliceExpression,
  ImportStatement,
  AssignTarget,
  ExceptHandler,
  TryStatement,
  RaiseStatement,
  ClassDef,
  WithStatement,
} from '@eml/types';

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

const COMPARISON_OPS: Partial<Record<TokenType, ComparisonOperator>> = {
  GT: '>',
  LT: '<',
  GE: '>=',
  LE: '<=',
  EQEQ: '==',
  NE: '!=',
  EQ: '==',
};

const OVERLAY_OPS: Partial<Record<TokenType, BinaryOperator>> = {
  PLUS: '+',
  MINUS: '-',
  STAR: '*',
  SLASH: '/',
  PERCENT: '%',
};

/** Compound-assignment operators (Phase 7b), target-first: `d[k] += 1`. */
const COMPOUND_ASSIGN_OPS: Partial<Record<TokenType, BinaryOperator>> = {
  PLUSEQ: '+',
  MINUSEQ: '-',
  STAREQ: '*',
  SLASHEQ: '/',
  PERCENTEQ: '%',
};

type OverlayKind = 'output' | 'overlay-assign' | 'list-assign' | 'expr';

class Parser {
  private pos = 0;
  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token {
    const t = this.tokens[this.pos + offset];
    return t ?? this.tokens[this.tokens.length - 1]!;
  }

  private next(): Token {
    const t = this.peek();
    if (this.pos < this.tokens.length - 1) this.pos++;
    return t;
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type;
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.next();
      return true;
    }
    return false;
  }

  private expect(type: TokenType, what?: string): Token {
    if (!this.check(type)) {
      const t = this.peek();
      throw new ParseError(
        `Expected ${what ?? type} but found ${t.type} ('${t.value}')`,
        t.line,
        t.column,
      );
    }
    return this.next();
  }

  private skipNewlines(): void {
    while (this.check('NEWLINE')) this.next();
  }

  // ── Program / statements ───────────────────────────────────────────────────

  parseProgram(): Program {
    const body: Statement[] = [];
    this.skipNewlines();
    while (!this.check('EOF')) {
      body.push(this.parseStatementWithSpan());
      this.expectStatementEnd();
      this.skipNewlines();
    }
    return { type: 'Program', body };
  }

  /** Parse a statement and attach its source span. */
  private parseStatementWithSpan(): Statement {
    const startTok = this.peek();
    const stmt = this.parseStatement();
    const endTok = this.tokens[this.pos - 1] ?? startTok;
    stmt.span = {
      start: startTok.start,
      end: endTok.end,
      line: startTok.line,
      column: startTok.column,
    };
    return stmt;
  }

  /**
   * After a statement the cursor must be at a logical boundary: a NEWLINE,
   * EOF, or a DEDENT (block end — a `def` block consumes its own trailing
   * NEWLINE, so the next token can be a DEDENT or the next statement directly).
   */
  private expectStatementEnd(): void {
    if (this.check('EOF') || this.check('NEWLINE') || this.check('DEDENT')) return;
    // A block statement (FunctionDef) ended with a DEDENT the block parser
    // already consumed, so the following statement may start immediately.
    const prev = this.tokens[this.pos - 1];
    if (prev?.type === 'DEDENT') return;
    const t = this.peek();
    throw new ParseError(
      `Unexpected token after statement: ${t.type} ('${t.value}')`,
      t.line,
      t.column,
    );
  }

  private parseStatement(): Statement {
    // Function definitions and decorators (Phase 2; async added in Phase 3).
    if (this.check('AT') || this.check('DEF') || this.check('ASYNC')) {
      return this.parseFunctionDef();
    }
    if (this.check('RETURN')) {
      return this.parseReturn();
    }
    if (this.check('IF')) {
      return this.parseIf();
    }
    if (this.check('WHILE')) {
      return this.parseWhile();
    }
    if (this.check('FOR')) {
      return this.parseForIn();
    }
    if (this.check('BREAK')) {
      this.next();
      return { type: 'Break' };
    }
    if (this.check('CONTINUE')) {
      this.next();
      return { type: 'Continue' };
    }
    if (this.check('IMPORT')) {
      return this.parseImport();
    }
    if (this.check('TRY')) {
      return this.parseTry();
    }
    if (this.check('RAISE')) {
      return this.parseRaise();
    }
    if (this.check('WITH')) {
      return this.parseWith();
    }
    if (this.check('CLASS')) {
      return this.parseClassDef();
    }

    // Statement-level overlay forms: `x^0`, `x^+100`, `x^-5`, `list^+[...]`.
    if (this.check('IDENT') && this.peek(1).type === 'CARET') {
      const kind = this.classifyOverlay();
      if (kind === 'output') {
        const idTok = this.next(); // IDENT
        this.next(); // CARET
        this.next(); // NUMBER 0
        return { type: 'Output', value: { type: 'Identifier', name: idTok.value }, end: this.parseOptionalOutputEnd() };
      }
      if (kind === 'overlay-assign') {
        const idTok = this.next(); // IDENT
        this.next(); // CARET
        const opTok = this.next(); // + - * /
        const op = OVERLAY_OPS[opTok.type]!;
        const value = this.parsePrimary();
        return {
          type: 'OverlayAssign',
          target: { type: 'Identifier', name: idTok.value },
          op,
          value,
        };
      }
      if (kind === 'list-assign') {
        const idTok = this.next(); // IDENT
        this.next(); // CARET
        this.next(); // PLUS
        const list = this.parseBracket();
        return {
          type: 'Assignment',
          target: { type: 'Identifier', name: idTok.value },
          value: list,
          declares: true,
        };
      }
      // kind === 'expr' -> fall through to general expression parsing
    }

    const expr = this.parseExpression();
    if (this.check('ARROW')) {
      this.next();
      const target = this.parseAssignTargetChain();
      return {
        type: 'Assignment',
        target,
        value: expr,
        declares: false,
      };
    }
    const compoundOp = COMPOUND_ASSIGN_OPS[this.peek().type];
    if (compoundOp) {
      const opTok = this.next(); // += / -= / *= / /=
      const target = this.toAssignTarget(expr, opTok);
      const value = this.parseExpression();
      return { type: 'AugmentedAssign', target, op: compoundOp, value };
    }
    // `EXPR^0` for any expression, not just a bare identifier (the narrow
    // `IDENT`+`CARET` fast path above already handles that common case). Safe
    // and unambiguous at any precedence depth: `parsePower()` never consumes a
    // `CARET` immediately followed by the literal digit `0` as a power
    // operation, so `parseExpression()` always leaves it dangling here.
    if (this.check('CARET') && this.peek(1).type === 'NUMBER' && this.peek(1).value === '0') {
      this.next(); // CARET
      this.next(); // NUMBER 0
      return { type: 'Output', value: expr, end: this.parseOptionalOutputEnd() };
    }
    return { type: 'ExpressionStatement', expression: expr };
  }

  /** `^0(END_EXPR)` — an optional custom print terminator (Core grammar relaxation,
   *  matching Python's `print(x, end=...)`). Zero collision risk: `^0` previously
   *  required the very next token to be `NEWLINE`/`DEDENT`/`EOF`, so `LPAREN` here
   *  was already a guaranteed parse error in every prior program. */
  private parseOptionalOutputEnd(): Expression | undefined {
    if (!this.check('LPAREN')) return undefined;
    this.next(); // (
    const end = this.parseExpression();
    this.expect('RPAREN', "')' after custom print terminator");
    return end;
  }

  /**
   * Parse the target side of `=>` (`IDENT ('[' Expression ']' | '.' IDENT)*`,
   * so `v => d[k]` / `v => self.x` compose to Subscript/Attribute targets).
   * This is the *reversed* form (value first, `=>`, then target) — see
   * `toAssignTarget()` for the target-first compound-assign form (`d[k] += v`).
   */
  private parseAssignTargetChain(): AssignTarget {
    const idTok = this.expect('IDENT', 'assignment target');
    let target: AssignTarget = { type: 'Identifier', name: idTok.value };
    for (;;) {
      if (this.check('LBRACKET')) {
        this.next(); // [
        const index = this.parseExpression();
        this.expect('RBRACKET', "']' after subscript index");
        target = { type: 'Subscript', object: target, index };
      } else if (this.check('DOT')) {
        this.next(); // .
        const attrTok = this.expect('IDENT', 'attribute name');
        target = { type: 'Attribute', object: target, attr: attrTok.value };
      } else {
        break;
      }
    }
    return target;
  }

  /** Validate a parsed expression is a legal compound-assignment target (name, subscript, or attribute). */
  private toAssignTarget(expr: Expression, opTok: Token): AssignTarget {
    if (expr.type === 'Identifier' || expr.type === 'Subscript' || expr.type === 'Attribute') return expr;
    throw new ParseError(
      `Cannot use '${opTok.value}' here — only a name, a subscript (e.g. 'd[k]'), or an attribute (e.g. 'obj.attr') can be a compound-assignment target.`,
      opTok.line,
      opTok.column,
    );
  }

  /** Decide what an `IDENT ^ ...` prefix means using up to 2 tokens of lookahead. */
  private classifyOverlay(): OverlayKind {
    const t2 = this.peek(2);
    // The output operator is exactly the literal digit `0` (grammar §3). Match
    // the raw lexeme, not numeric value, so `x^00` / `x^0.0` are not silently
    // treated as output — they fall through and surface as a parse error.
    if (t2.type === 'NUMBER' && t2.value === '0') return 'output';
    if (t2.type === 'PLUS') {
      const t3 = this.peek(3);
      if (t3.type === 'LPAREN') return 'expr'; // f^+(...) function call
      if (t3.type === 'LBRACKET') return 'list-assign'; // list^+[...]
      return 'overlay-assign'; // x^+100 / x^+y
    }
    if (t2.type === 'MINUS' || t2.type === 'STAR' || t2.type === 'SLASH') {
      return 'overlay-assign';
    }
    return 'expr'; // ^T (transpose), ^<number> (power), etc.
  }

  // ── Functions (Phase 2: cold/hot separation) ───────────────────────────────

  /** Parse zero or more `@decorator[(args)]` lines followed by a `[async] def` block. */
  private parseFunctionDef(): FunctionDef {
    const decorators: Decorator[] = [];
    while (this.check('AT')) {
      this.next(); // @
      const nameTok = this.expect('IDENT', 'decorator name');
      const decorator: Decorator = { type: 'Decorator', name: nameTok.value };
      if (this.check('LPAREN')) decorator.args = this.parseDecoratorArgs();
      decorators.push(decorator);
      this.expect('NEWLINE', 'newline after decorator');
      this.skipNewlines();
    }
    const isAsync = this.match('ASYNC');
    this.expect('DEF', "'def' to start a function");
    const nameTok = this.expect('IDENT', 'function name');
    this.expect('LPAREN', "'(' after function name");
    const params: Identifier[] = [];
    if (!this.check('RPAREN')) {
      params.push({ type: 'Identifier', name: this.expect('IDENT', 'parameter name').value });
      while (this.match('COMMA')) {
        params.push({ type: 'Identifier', name: this.expect('IDENT', 'parameter name').value });
      }
    }
    this.expect('RPAREN', "')' after parameters");
    this.expect('COLON', "':' after the function header");
    const body = this.parseBlock();

    // Resolve temperature from decorators; @cold wins if both are present.
    let temperature: Temperature | undefined;
    if (decorators.some((d) => d.name === 'cold')) temperature = 'cold';
    else if (decorators.some((d) => d.name === 'hot')) temperature = 'hot';

    return { type: 'FunctionDef', name: nameTok.value, params, decorators, body, temperature, isAsync };
  }

  /** Parse `(arg, name=value, ...)` decorator arguments (keyword or positional). */
  private parseDecoratorArgs(): DecoratorArg[] {
    this.expect('LPAREN');
    const args: DecoratorArg[] = [];
    let sawKeyword = false;
    if (!this.check('RPAREN')) {
      do {
        const startTok = this.peek();
        const arg = this.parseDecoratorArg();
        if (arg.name !== undefined) {
          sawKeyword = true;
        } else if (sawKeyword) {
          // Mirror Python: a positional arg cannot follow a keyword arg.
          throw new ParseError(
            'positional argument follows keyword argument in decorator',
            startTok.line,
            startTok.column,
          );
        }
        args.push(arg);
      } while (this.match('COMMA'));
    }
    this.expect('RPAREN', "')' after decorator arguments");
    return args;
  }

  private parseDecoratorArg(): DecoratorArg {
    // Keyword form `name=value` (lookahead: IDENT then EQ).
    if (this.check('IDENT') && this.peek(1).type === 'EQ') {
      const nameTok = this.next(); // IDENT
      this.next(); // =
      return { name: nameTok.value, value: this.parseExpression() };
    }
    return { value: this.parseExpression() };
  }

  private parseReturn(): ReturnStatement {
    this.expect('RETURN');
    // A bare `return` (no value) ends at the statement boundary.
    if (this.check('NEWLINE') || this.check('DEDENT') || this.check('EOF')) {
      return { type: 'Return' };
    }
    return { type: 'Return', value: this.parseExpression() };
  }

  /** Parse `import module` — a single bare module name only (Phase 7c). */
  private parseImport(): ImportStatement {
    this.expect('IMPORT');
    const modTok = this.expect('IDENT', 'module name');
    return { type: 'Import', module: modTok.value };
  }

  /**
   * Parse `try: <body> (except ...: <body>)* [finally: <body>]` (Phase 7d).
   * Python requires at least one `except` or a `finally` — enforced here.
   */
  private parseTry(): TryStatement {
    this.expect('TRY');
    this.expect('COLON', "':' after 'try'");
    const body = this.parseBlock('try');
    const handlers: ExceptHandler[] = [];
    while (this.check('EXCEPT')) {
      handlers.push(this.parseExceptHandler());
    }
    let finallyBody: Statement[] = [];
    if (this.check('FINALLY')) {
      this.next();
      this.expect('COLON', "':' after 'finally'");
      finallyBody = this.parseBlock('finally');
    }
    if (handlers.length === 0 && finallyBody.length === 0) {
      const t = this.peek();
      throw new ParseError("'try' must have at least one 'except' clause or a 'finally' clause", t.line, t.column);
    }
    return { type: 'Try', body, handlers, finallyBody };
  }

  /** Parse one `except [ExceptionType [as name]]:` clause. */
  private parseExceptHandler(): ExceptHandler {
    this.expect('EXCEPT');
    let exceptionType: string | undefined;
    let name: string | undefined;
    if (!this.check('COLON')) {
      exceptionType = this.expect('IDENT', 'exception type').value;
      if (this.check('AS')) {
        this.next();
        name = this.expect('IDENT', 'exception binding name').value;
      }
    }
    this.expect('COLON', "':' after 'except'");
    const body = this.parseBlock('except');
    return { type: 'ExceptHandler', exceptionType, name, body };
  }

  /** Parse `raise` (bare re-raise) or `raise <expression>` (Phase 7d). */
  private parseRaise(): RaiseStatement {
    this.expect('RAISE');
    if (this.check('NEWLINE') || this.check('DEDENT') || this.check('EOF')) {
      return { type: 'Raise' };
    }
    return { type: 'Raise', exception: this.parseExpression() };
  }

  /** Parse `with <expr> [as <name>]: <body>` (Phase 9 item 6) — single
   *  context-manager, single optional target only; Python's multi-context
   *  `with a() as x, b() as y:` form is out of scope (not corpus-driven). */
  private parseWith(): WithStatement {
    this.expect('WITH');
    const contextExpr = this.parseExpression();
    let target: Identifier | undefined;
    if (this.check('AS')) {
      this.next();
      const idTok = this.expect('IDENT', "with-statement target");
      target = { type: 'Identifier', name: idTok.value };
    }
    this.expect('COLON', "':' after 'with'");
    const body = this.parseBlock('with');
    return { type: 'With', contextExpr, target, body };
  }

  /**
   * Parse `class Name: <body>` (Phase 7e) — no base classes, no decorators.
   * A mistaken `class Foo(Bar):` fails loud with a plain `E_PARSE` here (the
   * parser never looks for a base-class clause, matching the plan's scope cut).
   */
  private parseClassDef(): ClassDef {
    this.expect('CLASS');
    const nameTok = this.expect('IDENT', 'class name');
    this.expect('COLON', "':' after the class name");
    const body = this.parseBlock('class');
    return { type: 'ClassDef', name: nameTok.value, body };
  }

  // ── Control flow (if/elif/else, while, for...in) ───────────────────────────

  /** Parse `if <test>: <body>` (also used recursively for `elif`, which shares
   *  the exact same shape — the caller has already consumed IF or ELIF). */
  private parseIf(): IfStatement {
    this.next(); // IF or ELIF
    const test = this.parseExpression();
    this.expect('COLON', "':' after the if/elif condition");
    const body = this.parseBlock('if');
    const orelse = this.parseElseOrElif();
    return { type: 'If', test, body, orelse };
  }

  /** Parse an optional `elif ...` (nested If) or `else:` tail after an if-block. */
  private parseElseOrElif(): Statement[] {
    if (this.check('ELIF')) {
      const startTok = this.peek();
      const nested = this.parseIf();
      const endTok = this.tokens[this.pos - 1] ?? startTok;
      nested.span = {
        start: startTok.start,
        end: endTok.end,
        line: startTok.line,
        column: startTok.column,
      };
      return [nested];
    }
    if (this.check('ELSE')) {
      this.next();
      this.expect('COLON', "':' after 'else'");
      return this.parseBlock('else');
    }
    return [];
  }

  private parseWhile(): WhileStatement {
    this.expect('WHILE');
    const test = this.parseExpression();
    this.expect('COLON', "':' after the while condition");
    const body = this.parseBlock('while');
    return { type: 'While', test, body };
  }

  private parseForIn(): ForInStatement {
    this.expect('FOR');
    const targetTok = this.expect('IDENT', 'for-loop variable');
    const target: Identifier = { type: 'Identifier', name: targetTok.value };
    this.expect('IN', "'in' after the for-loop variable");
    const iterable = this.parseExpression();
    this.expect('COLON', "':' after the for...in clause");
    const body = this.parseBlock('for');
    return { type: 'ForIn', target, iterable, body };
  }

  /** Parse an indented block of statements: NEWLINE INDENT stmt+ DEDENT. */
  private parseBlock(context = 'Function'): Statement[] {
    this.expect('NEWLINE', "newline after ':'");
    this.skipNewlines();
    this.expect('INDENT', 'an indented block');
    const body: Statement[] = [];
    this.skipNewlines();
    while (!this.check('DEDENT') && !this.check('EOF')) {
      body.push(this.parseStatementWithSpan());
      this.expectStatementEnd();
      this.skipNewlines();
    }
    if (!this.check('EOF')) this.expect('DEDENT', 'end of the indented block');
    if (body.length === 0) {
      const t = this.peek();
      throw new ParseError(`${context} body cannot be empty`, t.line, t.column);
    }
    return body;
  }

  // ── Expressions (precedence climbing) ──────────────────────────────────────

  parseExpression(): Expression {
    return this.parseConditional();
  }

  private parseConditional(): Expression {
    const test = this.parseOr();
    if (this.check('QUESTION')) {
      this.next();
      const consequent = this.parseExpression();
      this.expect('COLON', "':' in conditional");
      const alternate = this.parseExpression();
      return { type: 'Conditional', test, consequent, alternate };
    }
    return test;
  }

  private parseOr(): Expression {
    let left = this.parseAnd();
    while (this.check('OR')) {
      this.next();
      const right = this.parseAnd();
      left = { type: 'Logical', op: 'or', left, right };
    }
    return left;
  }

  private parseAnd(): Expression {
    let left = this.parseNot();
    while (this.check('AND')) {
      this.next();
      const right = this.parseNot();
      left = { type: 'Logical', op: 'and', left, right };
    }
    return left;
  }

  /** `not_test: 'not' not_test | comparison` — right-recursive so `not not x`
   *  parses correctly. `not` binds looser than comparison but tighter than
   *  `and`/`or`, matching Python's own precedence exactly. */
  private parseNot(): Expression {
    if (this.check('NOT')) {
      this.next();
      return { type: 'Not', operand: this.parseNot() };
    }
    return this.parseComparison();
  }

  private parseComparison(): Expression {
    const left = this.parseMembership();
    const op = COMPARISON_OPS[this.peek().type];
    if (op) {
      this.next();
      const right = this.parseMembership();
      return { type: 'Comparison', op, left, right };
    }
    return left;
  }

  private parseMembership(): Expression {
    const left = this.parseAdditive();
    if (this.check('IN')) {
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
    while (this.check('STAR') || this.check('SLASH') || this.check('PERCENT')) {
      const t = this.next().type;
      const op: BinaryOperator = t === 'STAR' ? '*' : t === 'SLASH' ? '/' : '%';
      const right = this.parsePower();
      left = { type: 'Binary', op, left, right };
    }
    return left;
  }

  private parsePower(): Expression {
    const base = this.parsePostfix();
    if (this.check('CARET')) {
      const n = this.peek(1);
      if (n.type === 'NUMBER' && Number(n.value) !== 0) {
        this.next(); // CARET
        const numTok = this.next(); // NUMBER
        return {
          type: 'Power',
          base,
          exponent: { type: 'NumberLiteral', raw: numTok.value, value: Number(numTok.value) },
        };
      }
      if (n.type === 'IDENT' && n.value === 'T') {
        this.next(); // CARET
        this.next(); // T
        return { type: 'Transpose', operand: base };
      }
    }
    return base;
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();
    for (;;) {
      const t = this.peek();
      if (t.type === 'LPAREN' && (expr.type === 'Identifier' || expr.type === 'Attribute')) {
        const args = this.parseArgs();
        const call: FunctionCall = { type: 'Call', callee: expr, args };
        expr = call;
      } else if (
        t.type === 'CARET' &&
        this.peek(1).type === 'PLUS' &&
        this.peek(2).type === 'LPAREN' &&
        expr.type === 'Identifier'
      ) {
        this.next(); // CARET
        this.next(); // PLUS
        const args = this.parseArgs();
        const call: FunctionCall = { type: 'Call', callee: expr, args };
        expr = call;
      } else if (t.type === 'LBRACKET') {
        this.next(); // [
        let start: Expression | undefined;
        if (!this.check('COLON')) start = this.parseExpression();
        if (this.check('COLON')) {
          this.next();
          let stop: Expression | undefined;
          if (!this.check('RBRACKET')) stop = this.parseExpression();
          this.expect('RBRACKET', "']' after slice");
          const slice: SliceExpression = { type: 'Slice', start, stop };
          const sub: SubscriptExpression = { type: 'Subscript', object: expr, index: slice };
          expr = sub;
        } else {
          this.expect('RBRACKET', "']' after subscript index");
          const sub: SubscriptExpression = { type: 'Subscript', object: expr, index: start! };
          expr = sub;
        }
      } else if (t.type === 'DOT') {
        this.next(); // .
        const attrTok = this.expect('IDENT', 'attribute name');
        const attr: AttributeExpression = { type: 'Attribute', object: expr, attr: attrTok.value };
        expr = attr;
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
      args.push(this.parseExpression());
      while (this.match('COMMA')) {
        if (this.check('RPAREN')) break; // trailing comma (Phase 9 item 7)
        args.push(this.parseExpression());
      }
    }
    this.expect('RPAREN');
    return args;
  }

  private parsePrimary(): Expression {
    const t = this.peek();
    if (t.type === 'AWAIT') {
      this.next();
      const argument: AwaitExpression['argument'] = this.parsePostfix();
      return { type: 'Await', argument };
    }
    if (t.type === 'MINUS' || t.type === 'PLUS') {
      this.next();
      const operand = this.parsePrimary();
      if (t.type === 'PLUS') return operand;
      if (operand.type === 'NumberLiteral') {
        return { type: 'NumberLiteral', raw: '-' + operand.raw, value: -operand.value };
      }
      throw new ParseError('Unary minus is only supported on numeric literals', t.line, t.column);
    }
    switch (t.type) {
      case 'NUMBER':
        this.next();
        return { type: 'NumberLiteral', raw: t.value, value: Number(t.value) };
      case 'STRING':
        this.next();
        return { type: 'StringLiteral', value: t.value };
      case 'IDENT': {
        this.next();
        const id: Identifier = { type: 'Identifier', name: t.value };
        return id;
      }
      case 'SIGMA':
        return this.parseSum();
      case 'MATRIX':
        return this.parseMatrix();
      case 'LPAREN': {
        this.next();
        if (this.check('RPAREN')) {
          this.next();
          return { type: 'Tuple', elements: [] }; // ()
        }
        const first = this.parseExpression();
        if (this.check('COMMA')) {
          const elements: Expression[] = [first];
          while (this.match('COMMA')) {
            if (this.check('RPAREN')) break; // trailing comma, e.g. (x,) or (x, y,)
            elements.push(this.parseExpression());
          }
          this.expect('RPAREN');
          return { type: 'Tuple', elements };
        }
        this.expect('RPAREN'); // no comma seen -> plain grouping, unchanged behavior
        return first;
      }
      case 'LBRACKET':
        return this.parseBracket();
      case 'LBRACE':
        return this.parseBraceLiteral();
      default:
        throw new ParseError(
          `Unexpected token ${t.type} ('${t.value}')`,
          t.line,
          t.column,
        );
    }
  }

  private parseSum(): SumExpression {
    this.expect('SIGMA');
    this.expect('LPAREN');
    const expr = this.parseExpression();
    this.expect('COMMA', "',' between sum body and iterator");
    const iterTok = this.expect('IDENT', 'sum iterator');
    const iterator: Identifier = { type: 'Identifier', name: iterTok.value };
    this.expect('IN', "'in' in sum iterator clause");
    const range = this.parseRange();
    this.expect('RPAREN');
    return { type: 'Sum', expr, iterator, range };
  }

  private parseMatrix(): MatrixExpression {
    this.expect('MATRIX');
    this.expect('LPAREN');
    const data = this.parseExpression();
    this.expect('RPAREN');
    return { type: 'Matrix', data };
  }

  /** Parse a `[a:b]` range (required, not a list). */
  private parseRange(): RangeExpression {
    this.expect('LBRACKET');
    const start = this.parseExpression();
    this.expect('COLON', "':' in range");
    const end = this.parseExpression();
    this.expect('RBRACKET');
    return { type: 'Range', start, end, inclusiveEnd: true };
  }

  /** Parse `[...]` which may be a range `[a:b]`, a list comprehension
   *  `[expr for x in iterable if cond]`, or a list `[1,2,3]`. */
  private parseBracket(): RangeExpression | ListLiteral | ListComprehension {
    this.expect('LBRACKET');
    if (this.check('RBRACKET')) {
      this.next();
      return { type: 'List', elements: [] };
    }
    const first = this.parseExpression();
    if (this.check('FOR')) {
      this.next();
      const iterTok = this.expect('IDENT', 'comprehension iterator');
      const iterator: Identifier = { type: 'Identifier', name: iterTok.value };
      this.expect('IN', "'in' in list comprehension");
      // No ambiguity with a trailing 'if' filter — forward EML's own ternary
      // uses '?'/':' (parseConditional), not the 'if'/'else' keyword form.
      const iterable = this.parseExpression();
      let condition: Expression | undefined;
      if (this.check('IF')) {
        this.next();
        condition = this.parseExpression();
      }
      this.expect('RBRACKET', "']' after list comprehension");
      return { type: 'ListComp', expr: first, iterator, iterable, condition };
    }
    if (this.check('COLON')) {
      this.next();
      const end = this.parseExpression();
      this.expect('RBRACKET');
      return { type: 'Range', start: first, end, inclusiveEnd: true };
    }
    const elements: Expression[] = [first];
    while (this.match('COMMA')) {
      if (this.check('RBRACKET')) break; // trailing comma (Phase 9 item 7)
      elements.push(this.parseExpression());
    }
    this.expect('RBRACKET');
    return { type: 'List', elements };
  }

  /**
   * Parse `{...}` which may be a dict `{k: v, ...}` or a set `{v, ...}` — the
   * same first-element-then-peek-for-COLON disambiguation `parseBracket()`
   * already uses for range-vs-list. An empty `{}` is a dict (Python parity);
   * an empty set has no literal form (`set()` — see `callBuiltin`).
   */
  private parseBraceLiteral(): DictLiteral | SetLiteral {
    this.expect('LBRACE');
    if (this.check('RBRACE')) {
      this.next();
      return { type: 'Dict', entries: [] };
    }
    const first = this.parseExpression();
    if (this.check('COLON')) {
      this.next();
      const firstValue = this.parseExpression();
      const entries: DictLiteral['entries'] = [{ key: first, value: firstValue }];
      while (this.match('COMMA')) {
        if (this.check('RBRACE')) break; // trailing comma (Phase 9 item 7)
        const key = this.parseExpression();
        this.expect('COLON', "':' in dict literal");
        const value = this.parseExpression();
        entries.push({ key, value });
      }
      this.expect('RBRACE', "'}' after dict literal");
      return { type: 'Dict', entries };
    }
    const elements: Expression[] = [first];
    while (this.match('COMMA')) {
      if (this.check('RBRACE')) break; // trailing comma (Phase 9 item 7)
      elements.push(this.parseExpression());
    }
    this.expect('RBRACE', "'}' after set literal");
    return { type: 'Set', elements };
  }
}

export function parseProgram(tokens: Token[]): Program {
  return new Parser(tokens).parseProgram();
}
