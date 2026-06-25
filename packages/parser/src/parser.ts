import type {
  Token,
  TokenType,
  Program,
  Statement,
  Expression,
  Identifier,
  RangeExpression,
  ListLiteral,
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

    // Statement-level overlay forms: `x^0`, `x^+100`, `x^-5`, `list^+[...]`.
    if (this.check('IDENT') && this.peek(1).type === 'CARET') {
      const kind = this.classifyOverlay();
      if (kind === 'output') {
        const idTok = this.next(); // IDENT
        this.next(); // CARET
        this.next(); // NUMBER 0
        return { type: 'Output', value: { type: 'Identifier', name: idTok.value } };
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
      const targetTok = this.expect('IDENT', 'assignment target');
      return {
        type: 'Assignment',
        target: { type: 'Identifier', name: targetTok.value },
        value: expr,
        declares: false,
      };
    }
    return { type: 'ExpressionStatement', expression: expr };
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

  /** Parse an indented block of statements: NEWLINE INDENT stmt+ DEDENT. */
  private parseBlock(): Statement[] {
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
      throw new ParseError('Function body cannot be empty', t.line, t.column);
    }
    return body;
  }

  // ── Expressions (precedence climbing) ──────────────────────────────────────

  parseExpression(): Expression {
    return this.parseConditional();
  }

  private parseConditional(): Expression {
    const test = this.parseComparison();
    if (this.check('QUESTION')) {
      this.next();
      const consequent = this.parseExpression();
      this.expect('COLON', "':' in conditional");
      const alternate = this.parseExpression();
      return { type: 'Conditional', test, consequent, alternate };
    }
    return test;
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
    while (this.check('STAR') || this.check('SLASH')) {
      const op: BinaryOperator = this.next().type === 'STAR' ? '*' : '/';
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
      if (t.type === 'LPAREN' && expr.type === 'Identifier') {
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
      while (this.match('COMMA')) args.push(this.parseExpression());
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
        const e = this.parseExpression();
        this.expect('RPAREN');
        return e;
      }
      case 'LBRACKET':
        return this.parseBracket();
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

  /** Parse `[...]` which may be a range `[a:b]` or a list `[1,2,3]`. */
  private parseBracket(): RangeExpression | ListLiteral {
    this.expect('LBRACKET');
    if (this.check('RBRACKET')) {
      this.next();
      return { type: 'List', elements: [] };
    }
    const first = this.parseExpression();
    if (this.check('COLON')) {
      this.next();
      const end = this.parseExpression();
      this.expect('RBRACKET');
      return { type: 'Range', start: first, end, inclusiveEnd: true };
    }
    const elements: Expression[] = [first];
    while (this.match('COMMA')) elements.push(this.parseExpression());
    this.expect('RBRACKET');
    return { type: 'List', elements };
  }
}

export function parseProgram(tokens: Token[]): Program {
  return new Parser(tokens).parseProgram();
}
