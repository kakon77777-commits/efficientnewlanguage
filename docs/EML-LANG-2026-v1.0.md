# EML-LANG-2026 — Language Specification v1.0

**Project:** EML 2026 — Efficient Meta-Language
**Document:** Normative language specification (the single source of truth)
**Status:** v1.0 (Phase 0–4 frozen surface)
**Owner:** Neo.K (許筌崴) / EveMissLab（一言諾科技有限公司）
**Target runtime:** Python 3.10+ (canonical) · C++20 (prototype back end)
**Supersedes:** the language-reference portions of `grammar.md` (v0.1), `transpiler-spec.md` (v0.1),
and whitepaper §4.2–4.4. Where this document and those disagree, **this document wins.**

> EML is **not** a replacement language. It is a deterministic, testable **semantic-overlay**
> layer: it compresses high-frequency program intent into symbols and transpiles, rule-based and
> reversibly, back to a standard language. The symbolic form is the machine-canonical artifact;
> the Cogni-Editor projection and Unicode display are for humans.

---

## 0. How to read this document

* **Normative** sections use MUST / MUST NOT / SHOULD as defined in RFC 2119.
* **ASCII canonical form is normative.** Unicode display forms (`Σ`, `∈`, `⇒`, `²`, `⟨M⟩`) are an
  *informative* projection: every program has an ASCII equivalent, and the lexer normalizes Unicode
  to ASCII before tokenizing (§2).
* The reference implementation is the TypeScript monorepo under `packages/`. Concrete behavior cited
  here (precedence, formatting, diagnostics) is what that implementation does and what the test
  suite (`tests/`, 363 cases) enforces.
* §11 defines exactly what "v1.0" freezes and what remains non-normative / prototype.

---

## 1. Language model

An EML program is a sequence of statements transpiled in one deterministic pass:

```
EML / Py⁺ source
  → normalize (Unicode → ASCII)
  → lex (INDENT/DEDENT, Python-style)
  → parse → syntactic AST (may contain OverlayAssign)
  → semantic analysis → resolved AST (+ diagnostics, imports, metadata)
  → emit (Python | C++) → format
```

Two invariants define the language:

1. **Determinism.** The core chain is rule-based. No LLM participates in transpilation. The same
   source always produces the same output (byte-for-byte, including formatting).
2. **Round-trip faithfulness.** For the supported statement subset, Python→EML→Python reaches a
   fixpoint (`python1 == python2`). Functions and Phase 3+ constructs are forward-only (§9).

A third, operational guarantee is added in v1.0:

3. **Execution truth.** Program behavior is observable as a `phosphor-jsonl-v1` trace (§8). The
   browser interpreter `@eml/interp` computes the *same* values the transpiled Python computes; this
   equivalence is gated by tests (interpreter stdout MUST equal Python stdout for the supported
   subset) and can be asserted live via `eml trace --run` (an `eml:equiv` event).

---

## 2. Lexical structure

### 2.1 Canonical vs. display form

| Semantics            | ASCII canonical (normative) | Unicode display (informative) |
| -------------------- | --------------------------- | ----------------------------- |
| init / add-assign    | `x^+100`                    | `x⁺¹⁰⁰`                       |
| output               | `x^0`                       | `x⁰`                          |
| transpose            | `m^T`                       | `mᵀ`                          |
| summation            | `Σ(i^2, i in [1:N])`        | `Σ(i², i∈[1:N])`              |
| bind                 | `expr => y`                 | `expr ⇒ y`                    |
| matrix               | `<M>(data)`                 | `⟨M⟩(data)`                   |

Normalization (the `normalize` step) maps the Unicode column to the ASCII column **before** lexing.
Superscript digits (`²`→`^2`), `∈`→`in`, `⇒`→`=>`, `Σ` is kept (it is a canonical token), `⟨M⟩`→`<M>`.
A conforming parser MUST accept the ASCII form; it MAY accept Unicode by normalizing first.

### 2.2 Tokens

* **Identifiers:** `[A-Za-z_][A-Za-z0-9_]*`.
* **Numbers:** integer (`100`) or floating (`3.14`, `1e9`). An integer literal has no `.`/`e`/`E`.
* **Strings:** double-quoted, with the usual escapes; emitted via canonical JSON quoting.
* **Operators / punctuation:** `^ + - * / 0 T => ? : > < >= <= == != ( ) , [ ] : @ Σ` and `<M>`.
* **Layout:** newlines are significant; leading whitespace produces `INDENT` / `DEDENT` tokens
  (Python algorithm). Blank lines and comment-only lines do not affect indentation.
* **Comments:** `#` to end of line.

### 2.3 Significant indentation (Phase 2+)

* Increasing indentation opens a block (`INDENT`); decreasing closes it (`DEDENT`).
* A dedent to a column that matches no open block is a lexical error `E_LEX`.
* Tabs count as a single column. Spaces are RECOMMENDED.
* At module (top) level, indentation MUST be zero; the top-level corpus is unaffected by INDENT/DEDENT.

---

## 3. Grammar (EBNF) — v1.0

This grammar is at Phase-4 parity. It extends grammar.md v0.1 with decorator arguments, `async def`,
the `await` expression, the `/` overlay operator, and the power operator `^<int≥1>`.

```ebnf
Program        ::= { Statement Newline? }

Statement      ::= OverlayStatement
                 | AssignmentStatement
                 | OutputStatement
                 | ExpressionStatement
                 | FunctionDefinition          (* Phase 2 *)
                 | ReturnStatement             (* Phase 2, function body only *)
                 | IfStatement                 (* Phase 6 *)
                 | WhileStatement              (* Phase 6 *)
                 | ForInStatement              (* Phase 6 *)
                 | EmptyStatement

(* ── Control flow (Phase 6) ── *)
IfStatement    ::= "if" Expression ":" Newline Block
                    [ "elif" Expression ":" Newline Block ]*
                    [ "else" ":" Newline Block ]
                    (* modeled in the AST as a nested IfStatement per elif, not
                       a separate list — this EBNF line is the surface form *)
WhileStatement ::= "while" Expression ":" Newline Block
ForInStatement ::= "for" Identifier InOperator Expression ":" Newline Block
                    (* target MUST be a single bare identifier; no tuple-unpacking *)

(* ── Functions, decorators, temperature, temporal (Phase 2–3) ── *)
FunctionDefinition ::= { Decorator Newline } [ "async" ] "def" Identifier
                       "(" [ ParameterList ] ")" ":" Newline Block

Decorator      ::= "@" Identifier [ "(" [ DecoratorArgList ] ")" ]
DecoratorArgList ::= DecoratorArg { "," DecoratorArg }
DecoratorArg   ::= Identifier "=" Expression          (* keyword arg *)
                 | Expression                          (* positional; MUST precede none after a kw arg *)

ParameterList  ::= Identifier { "," Identifier }
Block          ::= Indent { Statement Newline } Dedent
ReturnStatement ::= "return" [ Expression ]

(* ── Assignment / overlay / output ── *)
AssignmentStatement ::= Expression AssignArrow Identifier
AssignArrow    ::= "=>" | "⇒"

OverlayStatement ::= Identifier OverlaySuffix
                   | Identifier OverlaySuffix ListLiteral        (* list^+[...] *)
OverlaySuffix  ::= "^" OverlayOperator OverlayPayload?
OverlayOperator ::= "+" | "-" | "*" | "/" | "0" | "T"
OverlayPayload ::= Expression

OutputStatement ::= Identifier "^0"   (* operand must be a bare identifier *)

(* ── Expressions ── *)
Expression     ::= ConditionalExpression
ConditionalExpression ::= ComparisonExpression [ "?" Expression ":" Expression ]
ComparisonExpression  ::= AdditiveExpression [ ComparisonOperator AdditiveExpression ]
ComparisonOperator    ::= ">" | "<" | ">=" | "<=" | "==" | "!=" | "≥" | "≤" | "≠"
AdditiveExpression    ::= MultiplicativeExpression { ("+" | "-") MultiplicativeExpression }
MultiplicativeExpression ::= PowerExpression { ("*" | "/") PowerExpression }
(* `^Number` (power, Number ≠ 0) and `^T` (transpose) are mutually-exclusive
   suffixes over a postfix/primary; they do not chain (no `m^T^2`). *)
PowerExpression ::= PostfixExpression [ ( "^" Number ) | "^T" ]
PostfixExpression ::= PrimaryExpression { CallSuffix }
CallSuffix     ::= "(" [ ArgumentList ] ")"            (* call: f(a,b) *)
                 | "^+" "(" [ ArgumentList ] ")"       (* call-bind: f^+(a,b) (an expression) *)
PrimaryExpression ::= Identifier
                    | Number | String
                    | SumExpression
                    | MatrixExpression
                    | ListLiteral
                    | RangeExpression
                    | MembershipExpression
                    | AwaitExpression                 (* Phase 3 *)
                    | "(" Expression ")"

AwaitExpression ::= "await" PrimaryExpression
ArgumentList   ::= Expression { "," Expression }
SumExpression  ::= "Σ" "(" Expression "," IteratorClause ")"
IteratorClause ::= Identifier InOperator RangeExpression
InOperator     ::= "in" | "∈"
RangeExpression ::= "[" Expression ":" Expression "]"   (* inclusive of the upper bound *)
MembershipExpression ::= Expression InOperator (RangeExpression | Expression)
MatrixExpression ::= "<M>" "(" Expression ")"
ListLiteral    ::= "[" [ ArgumentList ] "]"
```

---

## 4. Symbol catalog (normative)

The authoritative machine-readable table is `eml-symbols.json` at the repository root; its format is
stable (changing a symbol's meaning is a breaking change — §11). The catalog:

| Symbol | name | category | Python expansion | Notes |
| ------ | ---- | -------- | ---------------- | ----- |
| `^0` | output | control | `print({value})` | §5.3 |
| `^+` | init_or_add_assign | assignment | `{t} = {v}` *or* `{t} += {v}` | disambiguated by symbol table, §5.1 |
| `^+=` | add_assign | assignment | `{t} += {v}` | **internal tag only** — not writable surface syntax; the add-assign form is produced by the two-stage `^+` rule (§5.1) when the target is already declared |
| `^-` | sub_assign | assignment | `{t} -= {v}` | |
| `^*` | mul_assign | assignment | `{t} *= {v}` | |
| `^/` | div_assign | assignment | `{t} /= {v}` | true division (float) |
| `^T` | transpose | linear | `np.transpose({x})` | auto-imports numpy |
| `Σ` | summation | algebraic | `sum({e} for {i} in {range})` | |
| `∈` | in_range | range | `range({a}, {b}+1)` | display form of `in` |
| `[:]` | inclusive_range | range | `range({a}, {b}+1)` | upper bound inclusive |
| `=>` | bind | assignment | `{t} = {expr}` | |
| `?:` | conditional | conditional | `{c} if {t} else {a}` | |
| `<M>` | matrix | matrix | `np.array({data})` | auto-imports numpy |
| `list^+` | list_literal | list | `lst = [{elems}]` | `list`→`lst` alias, §5.6 |
| `def` | function_def | function | `def {n}({p}): …` | Phase 2 |
| `@cold` | cold_logic | temperature | `@functools.cache` | Phase 2, §6 |
| `@hot` | hot_state | temperature | `# @hot` marker | Phase 2, §6 |
| `@temporal_loop` | temporal_loop | temporal | `@temporal_loop(...)` runtime | Phase 3, §7 |
| `await` | await | temporal | `await {expr}` | Phase 3, §7 |

Two constructs are part of the language but are not standalone catalog symbols: the **power
operator** `i^<number≠0>` → `i ** <number>` (the exponent is any non-zero numeric literal; a float
exponent like `i^2.5` is permitted and emits `i**2.5`), and **`async def`** → `async def` (the async
qualifier on a function). Both are normative. Note `^+=` in the table above is an *internal*
symbol-table tag (not writable surface syntax) — see its row.

### 4.1 Namespaces

Symbols carry a `namespace` (`core`, `linear`, …) for conflict management (whitepaper §4.4). In v1.0
the namespace is metadata on the symbol entry; source does not write namespaces explicitly. `^T` and
`<M>` are `linear` (numpy-backed); everything else is `core`.

---

## 5. Overlay semantics (normative)

### 5.1 `^+` — init or add-assign (the two-stage rule)

`x^+v` is **ambiguous at parse time** and is resolved by the semantic pass against a per-scope symbol
table: if `x` is not yet declared in the active scope it is an initialization (`x = v`, an
`Assignment` with `declares = true`); otherwise it is an augmented add (`x += v`). This is the only
overlay whose meaning depends on prior declarations.

### 5.2 `^-` `^*` `^/` — augmented assign

Always augmented (`-=`, `*=`, `/=`). `^/` is Python-3 **true division** (float result). Applying one
to an undeclared variable emits warning `W_AUG_UNDECLARED` (it will `NameError` at runtime).

### 5.3 `^0` — output

`x^0` → `print(x)`. The operand MUST be a bare identifier; `print(<expression>)` is not directly
expressible — bind it first (`(a + b) => s` then `s^0`). (The reverse transpiler enforces the same
restriction.)

### 5.4 `^T` — transpose; `<M>` — matrix

`m^T` → `np.transpose(m)`; `<M>(d)` → `np.array(d)`. Both add `import numpy as np`
(deterministically ordered, deduplicated). These run only under a real Python runtime — the
interpreter (§8) reports them as `unsupported`.

### 5.5 `=>` — bind; `f^+(...)` — call-bind

`expr => y` → `y = expr`. The call form `f^+(a,b) => r` → `r = f(a, b)`: here `^+` means *invoke*,
not add — disambiguated by a following `(`. A call callee is **not** alias-rewritten (so a genuine
builtin call like `list(1)` is preserved).

### 5.6 `list^+[...]` and the builtin-shadow alias

`list^+[1,2,3]` → `lst = [1, 2, 3]`. To avoid shadowing the Python builtin `list`, the identifier
`list` is aliased to `lst` on **bindings and reads** but not on call callees. If both `list` and
`lst` are declared in one program, that is `E_ALIAS_COLLISION` (a silent miscompile otherwise).

### 5.7 Ranges and precedence

`[a:b]` is **inclusive** of `b`: it emits `range(a, b+1)` (literal `b` folds to `b+1`; the form
`X-1` cancels to `range(a, X)` so reverse-transpiled `[1:n-1]` round-trips). Range bounds MUST be
integers; a non-integer literal bound is `E_RANGE_NONINT`. Emitter precedence (tightest → loosest):
power(5) > mul/div(4) > add/sub(3) > comparison/membership(2) > conditional(1). The emitter
parenthesizes minimally and exactly to preserve grouping; `**` is right-associative (its base is
parenthesized), and `-`/`/` are non-associative (an equal-precedence right operand is parenthesized).

---

## 6. Functions, cold/hot, crystallization, importance (Phase 2)

```eml
@cold
def square_sum(N):
    Σ(i^2, i in [1:N]) => r
    return r

square_sum(100) => total
total^0
```
→
```python
import functools

@functools.cache
def square_sum(N):
    r = sum(i**2 for i in range(1, N+1))
    return r

total = square_sum(100)
print(total)
```

* **Scope.** A function body analyzes in its own scope seeded with the parameters; locals never leak
  to module scope. `return` outside a function is `E_RETURN_OUTSIDE_FN`.
* **Temperature.** `@cold` → `@functools.cache` (+auto `import functools`); `@hot` → a marker
  comment (never cached). Both `@cold` and `@hot` → `W_TEMP_CONFLICT` (treated as cold). Unknown
  decorator → `W_UNKNOWN_DECORATOR` (preserved as a comment). A function named like a builtin-shadow
  alias (e.g. `list`) → `E_ALIAS_COLLISION`. A duplicate name in a scope → `W_FN_REDECLARED`.
* **Purity is interprocedural.** A `@cold` function is *tainted* (and warns `W_COLD_SIDE_EFFECT`) if
  it is intrinsically impure (`print`/`open`/`input`/`requests`/`eval`/`exec`/`^0`, or non-deterministic
  `time`/`random`) **or** it transitively calls a `@hot`/tainted function. Caching a tainted cold
  function would freeze an I/O-dependent result.
* **Crystallization.** Each function hashes by structure (`{params, body}`, name-independent, FNV-1a
  over a span-stripped key-sorted form), so identical logic shares a hash. A repeat is a cache hit
  (whitepaper §7.3). **Output Python is never altered by cache state** — caching is metadata only.
* **Importance.** `score = 0.4·squash(callFreq) + 0.4·risk + 0.2·squash(depth−1)` (risk: hot .8 /
  cold-pure .2 / cold-impure .6 / neutral .5). Per-function analysis is keyed per-record, never by
  bare name (same-named functions must not collide). Surfaced in CTS `functions[]` and `eml explain`.

---

## 6a. Control flow — if/elif/else, while, for...in (Phase 6)

```eml
x^+15
if x > 20:
    y^+1
elif x > 10:
    y^+2
else:
    y^+3
y^0
```
→
```python
x = 15
if x > 20:
    y = 1
elif x > 10:
    y = 2
else:
    y = 3
print(y)
```

* **`elif` is a nested `If`, not a separate list.** The AST's `IfStatement.orelse` is either empty (no
  elif/else), a single-element array holding another `IfStatement` (an `elif`), or any other non-empty
  array (a plain `else:` block). This mirrors Python's own `ast.If` chaining exactly.
* **Branch scoping.** `if`/`elif`/`else` branches are mutually exclusive: each resolves `x^+n`-style
  declarations against its own scope, and only names newly declared in *every* branch are then visible
  as declared after the statement (matching Python: an `if`/`elif`/`else` that assigns in every branch
  leaves the name bound afterward; assigning in only one branch means the name may be unbound depending
  on which branch ran, exactly as CPython behaves). `while`/`for` do **not** get this branch-scoping
  treatment — they execute the same body 0+ times, not as mutually-exclusive alternatives, so they
  resolve against the same live scope as straight-line code.
* **`for` target.** A single bare identifier only (no tuple-unpacking). It is declared like any other
  assignment target (participates in `E_ALIAS_COLLISION` and `declaredNames`) and, matching Python,
  stays bound to its last value after the loop ends.
* **No `break`/`continue`, no `while`/`for`-`else`.** A `while` loop must rely on its own condition (or
  an enclosing function's `return`) to exit early. These are explicit scope cuts for this round, not
  permanent restrictions.
* **Back ends.** Python emission is 1:1 (native `if`/`while`/`for`). The C⁺⁺⁺ prototype back end (§10)
  and reverse Python→EML transpilation (§9) both fail loudly on these constructs this round — see §11.
* **Interpreter (`@eml/interp`).** Real branch/loop execution, reusing the enclosing scope directly (no
  new scope per Python semantics above); `while`/`for` iterations are bounded by the same step-budget
  mechanism as `Σ`/range iteration.

---

## 7. Temporal loops (Phase 3)

`@temporal_loop` lets a function wait for a condition to mature **without busy-waiting**:

```eml
@temporal_loop(max_wait=3600, check_interval=60, timeout_action="return")
async def wait_for_confirmation(flag):
    await temporal_wait(flag)
    return flag
```

* **Decorator keyword args:** `max_wait`, `check_interval`, `timeout_action` (`"raise"` default /
  `"return"`). A positional arg after a keyword arg is a parse error. Unknown arg → `W_TEMPORAL_ARG`.
* `@temporal_loop` REQUIRES `async def`; otherwise `W_TEMPORAL_NOT_ASYNC`. `@cold` + `async` is
  rejected for caching (`W_COLD_ASYNC`; `@functools.cache` would memoize a coroutine).
* **`await <expr>`** binds at primary/postfix level: a non-atomic argument is parenthesized
  (`await (a + b)`). Every new expression walker MUST handle `Await`.
* **Self-contained runtime.** When a program uses `@temporal_loop`, the emitter injects an asyncio
  preamble (`DelayedDecisionQueue`, `temporal_loop`, `temporal_wait`, `run_temporal`) so `eml run`
  stays directly executable. It polls via `asyncio.sleep` (no busy-wait), bounds total wait by
  `max_wait` (final sleep clamped to the deadline; non-positive interval floored), and emits
  `eml:temporal:*` events (§8) to stderr.
* Temporal constructs are **forward-only** (reverse Python→EML rejects `async`/`await`).

---

## 8. Observability — `phosphor-jsonl-v1` trace (normative wire format)

EML emits compile/run/temporal/bug events as the portable PHOSPHOR standard `phosphor-jsonl-v1`
(one JSON object per line). EML only *produces* the wire format; it has no runtime dependency on
PHOSPHOR (decoupled by design). The package `@eml/trace` is the reference emitter/parser
(browser-safe core; node file sink isolated under `@eml/trace/node`).

### 8.1 Envelope

```ts
interface PhosphorEvent {
  stream: string;   // app id, e.g. "eml"
  proto:  "phosphor-jsonl-v1";
  type:   string;   // namespaced "domain:action"
  seq?:   number;   // per-writer monotonic counter
  ts?:    string;   // ISO-8601
  writer?: string;  // writer instance id (cross-writer ordering)
  mono?:  number;   // per-writer tiebreaker
  [field: string]: unknown;  // arbitrary domain payload
}
```

The in-process TS emitter always stamps `seq`/`ts`/`mono`. The Python runtime emitter (`_eml_trace`)
emits a minimal envelope (`stream`/`proto`/`type` + payload only); consumers MUST treat
`seq`/`ts`/`mono`/`writer` as optional.

### 8.2 Event vocabulary

Execution trace (interpreter `@eml/interp` / `eml trace`):
`eml:compile:error` (payload `{count, codes}`, emitted when the program fails to compile before
execution), `eml:run:start`, `eml:def`, `eml:assign`, `eml:augment`, `eml:sum`, `eml:call`,
`eml:return`, `eml:cache:hit`, `eml:cache:miss`, `eml:output`, `eml:unsupported`,
`eml:run:incomplete`, `eml:run:error`, `eml:run:done`, and (with `--run`) `eml:equiv` /
`eml:python:stdout` / `eml:python:exit`.

Temporal runtime: `eml:temporal:start|wait|resolved|timeout|done`.
Bug classifier: `eml:bug`, `eml:bug:summary`.

### 8.3 Anomalies & the intent-check primitive

`emit.check(type, actual, expected)` writes `{actual, expected, ok}` and returns `ok`. A consumer's
`findAnomalies` flags any event with `ok === false`, a `:error`/`:fail` type, or a non-zero `code`.
This is how `eml trace --run` proves execution truth: `eml:equiv` carries `ok:true` iff the
interpreter's stdout equals the real Python run's stdout.

---

## 9. Reverse transpilation & round-trip (normative)

The supported statement subset round-trips: `Python(subset) → EML → Python` is a fixpoint
(`python1 == python2`). The reverse path is a deterministic inverse of the emitter; it **fails
loudly** on inexpressible constructs rather than guessing. Forward-only constructs (NOT part of the
round-trip invariant): function definitions, `@cold`/`@hot`, `@temporal_loop`, `async`/`await`,
matrices. Arbitrary-Python compression (lossy) is an AI-assisted, validator-gated, suggestion-only
layer (whitepaper §5.4) and is **not** part of the deterministic core.

---

## 10. Back ends

* **Python (canonical, normative).** The execution target; CTS is the execution-truth layer.
* **C++20 (`--target cpp`, PROTOTYPE — non-normative).** A proof that the *same resolved AST* can
  target a second back end ("semantic overlay → multiple back ends"). Supports `Σ` (real loop via an
  IIFE + `eml_pow`), `def` (C++20 abbreviated templates), `[a:b]` membership/iteration, and int-only
  `list^+`. It **fails loud** (`E_CPP_UNSUPPORTED`, never emits broken C++) on numpy, async/temporal,
  recursion, and non-integer/printed lists. See `docs/cpp-feasibility.md`. The C++ subset is not
  frozen by v1.0.

---

## 11. Versioning, stability, conformance

**What v1.0 freezes (normative, breaking-change-protected):**

* The symbol catalog meanings in §4 / `eml-symbols.json`.
* The overlay semantics in §5 and the Python expansions in §4.
* The two-stage `^+` disambiguation rule (§5.1).
* The `phosphor-jsonl-v1` envelope (§8.1) and the documented event types (§8.2).
* The diagnostic codes in Appendix A (a code MUST NOT change meaning).
* The round-trip fixpoint guarantee for the supported subset (§9).

**Non-normative / may change without a major bump:** the C++ back end and its subset; the AI-assisted
compression layer; importance weights and crystallization hashing internals; CLI help text;
human-readable diagnostic *messages* (codes are stable, prose may improve); the Cogni-Editor UI.

**Conformance.** A conforming **producer** MUST transpile the §3 grammar deterministically, apply
§5 semantics, and emit §8 envelopes. A conforming **consumer** of EML traces MUST tolerate the
minimal Python envelope (optional `seq`/`ts`/`mono`/`writer`) and the §8.2 vocabulary.

**Stability policy.** Additive changes (new symbols, new event types, new diagnostics) are minor.
Changing an existing symbol/overlay/expansion/diagnostic meaning, or breaking the round-trip
invariant, is **major** (`EML-LANG-2027` or `v2.0`).

**Phase 6 addendum.** `if`/`elif`/`else`, `while`, and `for...in` (§6a) were added as new statement
kinds after the initial v1.0 freeze. This is an **additive** change per the policy above: nothing in
§4/§5/Appendix A changed meaning, and the §9 round-trip guarantee for the previously-supported subset
is untouched. `try`/`except`, dict/set literals, `class`, user `import`, and `break`/`continue` remain
future work — not yet built, not rejected.

---

## Appendix A — Diagnostics reference (normative codes)

**Errors (block transpilation; `ok = false`):**

| Code | Meaning |
| ---- | ------- |
| `E_LEX` | Lexical error (bad token / inconsistent dedent). |
| `E_PARSE` | Syntax error. |
| `E_INTERNAL` | Unexpected internal failure (should not occur on valid input). |
| `E_RANGE_NONINT` | A `range` bound is a non-integer literal. |
| `E_ALIAS_COLLISION` | Two identifiers map to the same emitted Python name (builtin-shadow alias), or a function is named like an alias key. |
| `E_RETURN_OUTSIDE_FN` | `return` used outside a function body. |
| `E_CPP_UNSUPPORTED` | (C++ back end) construct outside the prototype subset — fail loud, no broken C++. |

**Warnings (do not block; surfaced to the user):**

| Code | Meaning |
| ---- | ------- |
| `W_AUG_UNDECLARED` | Augmented assign (`-=`/`*=`/`/=`) on an undeclared variable. |
| `W_COLD_SIDE_EFFECT` | A `@cold` function is (transitively) impure — not safely cacheable. |
| `W_TEMP_CONFLICT` | A function is both `@cold` and `@hot` (treated as cold). |
| `W_UNKNOWN_DECORATOR` | Unknown decorator; preserved as a comment. |
| `W_FN_REDECLARED` | A function name is redeclared in the same scope. |
| `W_TEMPORAL_NOT_ASYNC` | `@temporal_loop` on a non-`async def`. |
| `W_TEMPORAL_ARG` | Unknown `@temporal_loop` argument. |
| `W_COLD_ASYNC` | `@cold` on an `async def` (caching skipped — would memoize a coroutine). |

The bug classifier (`eml bugs`) records, but does not fix, diagnostics at five severities:
**CRITICAL · MAJOR · MINOR · TRIVIAL · COSMETIC** (CRITICAL/MAJOR map to `ok:false` so a trace
consumer flags them). Each carries its EML span, CTS node, Python expansion, and a suggested fix.

## Appendix B — The Phase 0 fourteen cases

| # | EML | Python |
| - | --- | ------ |
| 01 | `x^+100` | `x = 100` |
| 02 | `x^0` | `print(x)` |
| 03 | `Σ(i^2, i in [1:N])` | `sum(i**2 for i in range(1, N+1))` |
| 04 | `m^T` | `np.transpose(m)` |
| 05 | `x > 40 ? A : B` | `A if x > 40 else B` |
| 06 | `f(x) => y` | `y = f(x)` |
| 07 | `x^+10` (declared) | `x += 10` |
| 08 | `x^-5` | `x -= 5` |
| 09 | `x^*2` | `x *= 2` |
| 10 | `i in [1:10]` | `i in range(1, 11)` |
| 11 | `Σ(i, i in [1:10])` | `sum(i for i in range(1, 11))` |
| 12 | `<M>(data)` | `np.array(data)` |
| 13 | `f^+(x,y) => r` | `r = f(x, y)` |
| 14 | `list^+[1,2,3]` | `lst = [1, 2, 3]` |

## Appendix C — Reference packages

`@eml/types` (AST/CTS/tokens) · `@eml/parser` (normalize/lex/parse) · `@eml/transpiler-python`
(semantic + emit + format) · `@eml/transpiler-eml` (reverse + round-trip) · `@eml/transpiler-cpp`
(C++ prototype) · `@eml/interp` (execution-truth interpreter + trace) · `@eml/trace`
(phosphor-jsonl-v1) · `@eml/bug-classifier` · `@eml/cts-generator` · `@eml/symbols` · `@eml/cli`
(`eml`) · `@eml/cogni-editor` (Cogni-Editor + Nova IME + Trace panel).

*End of EML-LANG-2026 v1.0.*
