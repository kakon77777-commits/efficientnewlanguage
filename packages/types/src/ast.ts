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

export type BinaryOperator = '+' | '-' | '*' | '/' | '%';

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

/** `and`/`or` — boolean combinators (short-circuit; the interpreter returns an
 *  operand, not always a bool, matching Python — see `packages/interp`). */
export type LogicalOperator = 'and' | 'or';

export interface LogicalExpression extends NodeBase {
  type: 'Logical';
  op: LogicalOperator;
  left: Expression;
  right: Expression;
}

/** `not x` — unary boolean negation (Phase 9). Always returns a bool
 *  (unlike `and`/`or`, which return an operand) — see `packages/interp`. */
export interface NotExpression extends NodeBase {
  type: 'Not';
  operand: Expression;
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

/** `callee` widens to `Identifier | AttributeExpression` in Phase 7c so
 *  `math.sqrt(x)` / `obj.method(x)` parse as a Call over an Attribute. */
export interface FunctionCall extends NodeBase {
  type: 'Call';
  callee: Identifier | AttributeExpression;
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

/** `(a, b, ...)`, e.g. `(name, year)`. `(x)` alone stays plain grouping (not a
 *  1-tuple) — only a trailing comma makes it one, e.g. `(x,)`. Phase 9 item 3a. */
export interface TupleLiteral extends NodeBase {
  type: 'Tuple';
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

/** `{k: v, ...}`, e.g. `{"a": 1, "b": 2}`. Empty `{}` is a dict (Python parity). Phase 7b. */
export interface DictLiteral extends NodeBase {
  type: 'Dict';
  entries: { key: Expression; value: Expression }[];
}

/** `{v, ...}`, e.g. `{1, 2, 3}`. An empty set has no literal form — use `set()`. Phase 7b. */
export interface SetLiteral extends NodeBase {
  type: 'Set';
  elements: Expression[];
}

/** `obj[index]`, e.g. `d["k"]`, `lst[0]`, `lst[-1]`. Phase 7b. `index` may also be a
 *  `SliceExpression` (Phase 9). */
export interface SubscriptExpression extends NodeBase {
  type: 'Subscript';
  object: Expression;
  index: Expression;
}

/** `obj.attr`, e.g. `math.sqrt`, `self.value`. Phase 7c. */
export interface AttributeExpression extends NodeBase {
  type: 'Attribute';
  object: Expression;
  attr: string;
}

/** `obj[start:stop]`, e.g. `bin(dec)[2:]`. Either bound may be omitted (Python slice syntax) —
 *  only ever valid as a `Subscript`'s `index`. No step form: EML's own `[a:b]` Range has no step
 *  concept, and no corpus evidence needs one. Phase 9. */
export interface SliceExpression extends NodeBase {
  type: 'Slice';
  start?: Expression;
  stop?: Expression;
}

export type Expression =
  | Identifier
  | NumberLiteral
  | StringLiteral
  | PowerExpression
  | BinaryExpression
  | ComparisonExpression
  | LogicalExpression
  | NotExpression
  | ConditionalExpression
  | RangeExpression
  | SumExpression
  | FunctionCall
  | MatrixExpression
  | TransposeExpression
  | ListLiteral
  | TupleLiteral
  | MembershipExpression
  | AwaitExpression
  | DictLiteral
  | SetLiteral
  | SubscriptExpression
  | AttributeExpression
  | SliceExpression;

/**
 * The shapes an assignment (`=>` arrow form, or a compound `+=`/`-=`/`*=`/`/=`)
 * may target. `Identifier` is the original bare-name form; `Subscript` (Phase
 * 7b) allows `d[k] = v` / `d[k] += v`; `Attribute` (Phase 7c) allows
 * `self.x = v`. `OverlayAssign`'s `^`-sigil forms and `ForInStatement`'s loop
 * variable stay `Identifier`-only — see docs for why (no declare/augment
 * ambiguity to resolve for a subscript/attribute target, and no
 * tuple/subscript/attribute for-targets requested).
 */
export type AssignTarget = Identifier | SubscriptExpression | AttributeExpression;

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
  target: AssignTarget;
  value: Expression;
  /** True when this is the first binding of `target` in the program. Always
   *  false for a non-Identifier target (a Subscript mutates, never declares). */
  declares: boolean;
}

/** Resolved augmented assignment, e.g. `x += 10`, `x -= 5`, `x *= 2`, `d[k] += 1`. */
export interface AugmentedAssignStatement extends NodeBase {
  type: 'AugmentedAssign';
  target: AssignTarget;
  op: BinaryOperator;
  value: Expression;
}

/** Output, e.g. `x^0` -> `print(x)`. */
export interface OutputStatement extends NodeBase {
  type: 'Output';
  value: Expression;
  /** Reverse-only (Phase 9 item 5): captures Python's `print(x, end=...)`. EML
   *  has no forward syntax to express a custom terminator, so this is never
   *  set by the forward EML parser — only `py-parser.ts` sets it, and only
   *  `eml-emitter.ts` ever inspects it (to fail loud rather than silently
   *  drop it). */
  end?: Expression;
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

/**
 * `if <test>: <body>` with an optional `elif`/`else` tail. `elif` is modeled
 * as a single-element `orelse` whose sole entry is another {@link IfStatement}
 * — mirroring Python's own `ast.If` chaining exactly. An empty `orelse` means
 * no `elif`/`else` at all; a non-empty `orelse` that is not a single nested
 * `If` is a plain `else:` block.
 */
export interface IfStatement extends NodeBase {
  type: 'If';
  test: Expression;
  body: Statement[];
  orelse: Statement[];
}

/** `while <test>: <body>`. No `while...else` (not supported). */
export interface WhileStatement extends NodeBase {
  type: 'While';
  test: Expression;
  body: Statement[];
}

/**
 * `for <target> in <iterable>: <body>`. `target` is a single bare identifier
 * (no tuple-unpacking). No `for...else` (not supported).
 */
export interface ForInStatement extends NodeBase {
  type: 'ForIn';
  target: Identifier;
  iterable: Expression;
  body: Statement[];
}

/** `break` — exits the nearest enclosing `while`/`for` loop. Phase 7a. */
export interface BreakStatement extends NodeBase {
  type: 'Break';
}

/** `continue` — skips to the next iteration of the nearest enclosing loop. Phase 7a. */
export interface ContinueStatement extends NodeBase {
  type: 'Continue';
}

/**
 * `import module` — a single bare module name, e.g. `import math`. No
 * `from x import y`, no `as` aliasing, no dotted paths (`import os.path`).
 * Phase 7c. Emitted in-place (not hoisted) since the user wrote it there.
 */
export interface ImportStatement extends NodeBase {
  type: 'Import';
  module: string;
}

/**
 * One `except [ExceptionType] [as name]:` clause. Not a `Statement`/
 * `Expression` itself — a sub-node of `TryStatement`, mirroring how
 * `Decorator` is a sub-node of `FunctionDef`. `exceptionType` absent = bare
 * `except:` (catch-all, same as `except Exception:`). Phase 7d.
 */
export interface ExceptHandler extends NodeBase {
  type: 'ExceptHandler';
  exceptionType?: string;
  name?: string;
  body: Statement[];
}

/**
 * `try: <body> (except ...: <body>)+ [finally: <body>]` — Python requires at
 * least one `except` or a `finally` (enforced by the parser). No `else:`
 * clause (Phase 7d scope cut). `handlers`/`finallyBody` are checked in
 * written order; `finallyBody` is empty (not undefined) when there's no
 * `finally:` clause, matching `orelse`'s empty-means-absent convention.
 */
export interface TryStatement extends NodeBase {
  type: 'Try';
  body: Statement[];
  handlers: ExceptHandler[];
  finallyBody: Statement[];
}

/**
 * `raise` (bare re-raise) or `raise <expression>` (e.g. `raise ValueError("msg")`).
 * Phase 7d. No new "exception object" PyVal — the interpreter special-cases a
 * `Call`/bare `Identifier` naming a Python exception class; anything else
 * defers as `Unsupported`. See docs for why this is a deliberate shortcut.
 */
export interface RaiseStatement extends NodeBase {
  type: 'Raise';
  exception?: Expression;
}

/**
 * `class Name: <body>` — minimal viable OOP (Phase 7e): no inheritance, no
 * base classes, no method decorators (`@staticmethod`/`@classmethod`/
 * `@property`), no dunders beyond `__init__`. Methods are ordinary nested
 * `FunctionDef` nodes — `self` is just a ordinary first parameter, nothing
 * special at the AST level. A class body may otherwise only contain a plain
 * `Assignment`/`OverlayAssign` (a class-level variable); anything else is
 * `E_CLASS_BODY_UNSUPPORTED` (see semantic.ts).
 */
export interface ClassDef extends NodeBase {
  type: 'ClassDef';
  name: string;
  body: Statement[];
}

/**
 * `with <expr> [as <name>]: <body>` (Phase 9 item 6) — single context-manager,
 * single optional target only (Python's multi-context `with a() as x, b() as
 * y:` form is out of scope; the real corpus need is exactly this shape). No
 * new "context manager" PyVal — the interpreter dispatches real `__enter__`/
 * `__exit__` methods when the context value is a class instance (Phase 7e),
 * matching the real protocol; anything else fails loud with the real Python
 * `TypeError`, not a silent no-op.
 */
export interface WithStatement extends NodeBase {
  type: 'With';
  contextExpr: Expression;
  target?: Identifier;
  body: Statement[];
}

export type Statement =
  | OverlayAssign
  | AssignmentStatement
  | AugmentedAssignStatement
  | OutputStatement
  | ExpressionStatement
  | FunctionDef
  | ReturnStatement
  | IfStatement
  | WhileStatement
  | ForInStatement
  | BreakStatement
  | ContinueStatement
  | ImportStatement
  | TryStatement
  | RaiseStatement
  | ClassDef
  | WithStatement;

export interface Program extends NodeBase {
  type: 'Program';
  body: Statement[];
}

export type EMLNode = Program | Statement | Expression;
