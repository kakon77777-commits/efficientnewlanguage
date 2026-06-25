import type {
  Program,
  Statement,
  Expression,
  Identifier,
  RangeExpression,
  SumExpression,
  ListLiteral,
  ComparisonOperator,
  BinaryOperator,
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

  parseProgram(): Program {
    const body: Statement[] = [];
    this.skipNewlines();
    while (!this.check('EOF')) {
      // skip import / from ... import lines
      if (this.checkName('import') || this.checkName('from')) {
        this.skipLine();
        this.skipNewlines();
        continue;
      }
      const stmt = this.parseStatement();
      body.push(stmt);
      if (!this.check('EOF') && !this.check('NEWLINE')) {
        const t = this.peek();
        throw new PyParseError(`Unexpected token after statement: ${t.type} ('${t.value}')`, t.line, t.column);
      }
      this.skipNewlines();
    }
    return { type: 'Program', body };
  }

  private parseStatement(): Statement {
    if (this.check('NAME') && this.peek(1).type === 'ASSIGN') {
      const target: Identifier = { type: 'Identifier', name: this.next().value };
      this.next(); // =
      const value = this.parseExpr();
      return { type: 'Assignment', target, value, declares: false };
    }
    const augOp = AUG[this.peek(1).type];
    if (this.check('NAME') && augOp) {
      const target: Identifier = { type: 'Identifier', name: this.next().value };
      this.next(); // augmented op
      const value = this.parseExpr();
      return { type: 'AugmentedAssign', target, op: augOp, value };
    }
    const expr = this.parseExpr();
    if (expr.type === 'Call' && expr.callee.name === 'print' && expr.args.length === 1) {
      return { type: 'Output', value: expr.args[0]! };
    }
    return { type: 'ExpressionStatement', expression: expr };
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
    while (this.check('LPAREN') && expr.type === 'Identifier') {
      const args = this.parseArgs();
      expr = { type: 'Call', callee: expr, args };
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
