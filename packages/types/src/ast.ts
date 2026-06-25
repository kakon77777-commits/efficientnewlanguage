/**
 * EML normalized AST.
 *
 * Two-stage design:
 *  - The parser emits a *syntactic* AST that may contain {@link OverlayAssign}
 *    nodes, whose meaning (declare vs. augment) is not yet resolved.
 *  - The semantic analyzer rewrites every {@link OverlayAssign} into either an
 *    {@link AssignmentStatement} or an {@link AugmentedAssignStatement} using a
 *    per-program symbol table. The Python emitter only ever sees the resolved
 *    forms.
 */

export interface SourceSpan {
  start: number;
  end: number;
  line: number;
  column: number;
}

export interface NodeBase {
  type: string;
  span?: SourceSpan;
}

// ── Expressions ─────────────────────────────────────────────────────────────

export interface Identifier extends NodeBase {
  type: 'Identifier';
  name: string;
}

export interface NumberLiteral extends NodeBase {
  type: 'NumberLiteral';
  /** Raw lexeme, e.g. "100" or "3.14". */
  raw: string;
  value: number;
}

export interface StringLiteral extends NodeBase {
  type: 'StringLiteral';
  value: string;
}

/** Exponentiation, e.g. `i^2` -> `i ** 2`. */
export interface PowerExpression extends NodeBase {
  type: 'Power';
  base: Expression;
  exponent: Expression;
}

export type BinaryOperator = '+' | '-' | '*' | '/';

export interface BinaryExpression extends NodeBase {
  type: 'Binary';
  op: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';

export interface ComparisonExpression extends NodeBase {
  type: 'Comparison';
  op: ComparisonOperator;
  left: Expression;
  right: Expression;
}

/** Ternary, e.g. `x > 40 ? A : B` -> `A if x > 40 else B`. */
export interface ConditionalExpression extends NodeBase {
  type: 'Conditional';
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

/** Inclusive integer range, e.g. `[1:N]` -> `range(1, N + 1)`. */
export interface RangeExpression extends NodeBase {
  type: 'Range';
  start: Expression;
  end: Expression;
  /** EML ranges are inclusive of the end bound. */
  inclusiveEnd: boolean;
}

/** Summation, e.g. `Σ(i^2, i in [1:N])`. */
export interface SumExpression extends NodeBase {
  type: 'Sum';
  expr: Expression;
  iterator: Identifier;
  range: RangeExpression;
}

export interface FunctionCall extends NodeBase {
  type: 'Call';
  callee: Identifier;
  args: Expression[];
}

/** Matrix constructor, e.g. `<M>(data)` -> `np.array(data)`. */
export interface MatrixExpression extends NodeBase {
  type: 'Matrix';
  data: Expression;
}

/** Transpose, e.g. `m^T` -> `np.transpose(m)`. */
export interface TransposeExpression extends NodeBase {
  type: 'Transpose';
  operand: Expression;
}

export interface ListLiteral extends NodeBase {
  type: 'List';
  elements: Expression[];
}

/** Membership test, e.g. `i in [1:10]` -> `i in range(1, 11)`. */
export interface MembershipExpression extends NodeBase {
  type: 'Membership';
  element: Expression;
  collection: Expression;
}

/** `await <expr>`, e.g. `await temporal_wait(cond)` (Phase 3 temporal loops). */
export interface AwaitExpression extends NodeBase {
  type: 'Await';
  argument: Expression;
}

export type Expression =
  | Identifier
  | NumberLiteral
  | StringLiteral
  | PowerExpression
  | BinaryExpression
  | ComparisonExpression
  | ConditionalExpression
  | RangeExpression
  | SumExpression
  | FunctionCall
  | MatrixExpression
  | TransposeExpression
  | ListLiteral
  | MembershipExpression
  | AwaitExpression;

// ── Statements ──────────────────────────────────────────────────────────────

/**
 * Parser-level overlay assignment, e.g. `x^+100`, `x^-5`, `x^*2`.
 * Resolved by the semantic analyzer into {@link AssignmentStatement}
 * (first `^+` occurrence) or {@link AugmentedAssignStatement}.
 */
export interface OverlayAssign extends NodeBase {
  type: 'OverlayAssign';
  target: Identifier;
  op: BinaryOperator;
  value: Expression;
}

/** Resolved plain assignment, e.g. `x = 100` or `y = f(x)`. */
export interface AssignmentStatement extends NodeBase {
  type: 'Assignment';
  target: Identifier;
  value: Expression;
  /** True when this is the first binding of `target` in the program. */
  declares: boolean;
}

/** Resolved augmented assignment, e.g. `x += 10`, `x -= 5`, `x *= 2`. */
export interface AugmentedAssignStatement extends NodeBase {
  type: 'AugmentedAssign';
  target: Identifier;
  op: BinaryOperator;
  value: Expression;
}

/** Output, e.g. `x^0` -> `print(x)`. */
export interface OutputStatement extends NodeBase {
  type: 'Output';
  value: Expression;
}

/** A bare expression used as a statement, e.g. `x > 40 ? A : B`. */
export interface ExpressionStatement extends NodeBase {
  type: 'ExpressionStatement';
  expression: Expression;
}

/** Thermal temperature of a function (cold/hot separation, whitepaper §7). */
export type Temperature = 'cold' | 'hot';

/** One decorator argument: a keyword arg (`max_wait=3600`) or a positional one. */
export interface DecoratorArg {
  /** Present for `name=value`; absent for a bare positional argument. */
  name?: string;
  value: Expression;
}

/**
 * A function decorator, e.g. `@cold` / `@hot` / `@temporal_loop(max_wait=3600,
 * check_interval=60)`. `cold`/`hot` carry temperature semantics; `temporal_loop`
 * carries timing args; any other name is preserved and surfaced as a warning.
 */
export interface Decorator extends NodeBase {
  type: 'Decorator';
  name: string;
  /** Present when the decorator is called with arguments (`@name(...)`). */
  args?: DecoratorArg[];
}

/** A `return` inside a function body, e.g. `return Σ(i^2, i in [1:N])`. */
export interface ReturnStatement extends NodeBase {
  type: 'Return';
  value?: Expression;
}

/**
 * A function definition, e.g.
 * ```eml
 * @cold
 * def square_sum(N):
 *     Σ(i^2, i in [1:N]) => r
 *     return r
 * ```
 * `temperature` is derived from the decorators by the parser (@cold/@hot).
 */
export interface FunctionDef extends NodeBase {
  type: 'FunctionDef';
  name: string;
  params: Identifier[];
  decorators: Decorator[];
  body: Statement[];
  /** Resolved from decorators: 'cold' | 'hot' | undefined (neutral). */
  temperature?: Temperature;
  /** True for `async def` (required for temporal loops / await). */
  isAsync?: boolean;
}

export type Statement =
  | OverlayAssign
  | AssignmentStatement
  | AugmentedAssignStatement
  | OutputStatement
  | ExpressionStatement
  | FunctionDef
  | ReturnStatement;

export interface Program extends NodeBase {
  type: 'Program';
  body: Statement[];
}

export type EMLNode = Program | Statement | Expression;
