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
  suite (`tests/`, 512 cases) enforces.
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

This grammar is at Phase-7 parity. It extends grammar.md v0.1 with decorator arguments, `async def`,
the `await` expression, the `/` overlay operator, the power operator `^<int≥1>`, and (Phase 7a–7e)
`break`/`continue`, dict/set literals + subscript, attribute access + user `import`,
`try`/`except`/`finally`/`raise`, and `class`.

```ebnf
Program        ::= { Statement Newline? }

Statement      ::= OverlayStatement
                 | AssignmentStatement
                 | CompoundAssignStatement     (* Phase 7b *)
                 | OutputStatement
                 | ExpressionStatement
                 | FunctionDefinition          (* Phase 2 *)
                 | ReturnStatement             (* Phase 2, function body only *)
                 | IfStatement                 (* Phase 6 *)
                 | WhileStatement              (* Phase 6 *)
                 | ForInStatement              (* Phase 6 *)
                 | BreakStatement              (* Phase 7a *)
                 | ContinueStatement           (* Phase 7a *)
                 | ImportStatement             (* Phase 7c *)
                 | TryStatement                (* Phase 7d *)
                 | RaiseStatement              (* Phase 7d *)
                 | ClassDefinition             (* Phase 7e *)
                 | EmptyStatement

(* ── Control flow (Phase 6, 7a) ── *)
IfStatement    ::= "if" Expression ":" Newline Block
                    [ "elif" Expression ":" Newline Block ]*
                    [ "else" ":" Newline Block ]
                    (* modeled in the AST as a nested IfStatement per elif, not
                       a separate list — this EBNF line is the surface form *)
WhileStatement ::= "while" Expression ":" Newline Block
ForInStatement ::= "for" Identifier InOperator Expression ":" Newline Block
                    (* target MUST be a single bare identifier; no tuple-unpacking *)
BreakStatement    ::= "break"
ContinueStatement ::= "continue"
                    (* legal anywhere at parse time; E_BREAK_OUTSIDE_LOOP /
                       E_CONTINUE_OUTSIDE_LOOP are semantic-pass diagnostics,
                       mirroring how `return` outside a function is checked *)

(* ── Modules, exceptions, classes (Phase 7c–7e) ── *)
ImportStatement ::= "import" Identifier
                    (* a single bare module name only — no `from x import y`,
                       no `as` aliasing, no dotted paths *)

TryStatement   ::= "try" ":" Newline Block
                    ExceptClause+
                    [ "finally" ":" Newline Block ]
                 | "try" ":" Newline Block "finally" ":" Newline Block
                    (* at least one ExceptClause or a finally is REQUIRED *)
ExceptClause   ::= "except" [ Identifier [ "as" Identifier ] ] ":" Newline Block
                    (* a bare `except:` is equivalent to `except Exception:` *)
RaiseStatement ::= "raise" [ Expression ]

ClassDefinition ::= "class" Identifier ":" Newline ClassBlock
ClassBlock     ::= Indent { ( FunctionDefinition | AssignmentStatement | OverlayStatement ) Newline } Dedent
                    (* no base-class clause; a class body may only contain
                       method defs or a plain assignment — anything else is
                       E_CLASS_BODY_UNSUPPORTED. Methods are ordinary
                       FunctionDefinition nodes; `self` is an ordinary first
                       parameter, nothing special at the grammar level. *)

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
AssignmentStatement ::= Expression AssignArrow AssignTarget
AssignArrow    ::= "=>" | "⇒"
CompoundAssignStatement ::= AssignTarget CompoundOp Expression      (* Phase 7b, target-FIRST *)
CompoundOp     ::= "+=" | "-=" | "*=" | "/="

(* AssignTarget is the *reversed* form's target side: a bare name, or a name
   followed by any number of subscript/attribute suffixes. `OverlayStatement`'s
   `^`-sigil targets and a `for`-loop's own target stay Identifier-only — see
   §6a/§6b for why. *)
AssignTarget   ::= Identifier { "[" Expression "]" | "." Identifier }

OverlayStatement ::= Identifier OverlaySuffix
                   | Identifier OverlaySuffix ListLiteral        (* list^+[...] *)
OverlaySuffix  ::= "^" OverlayOperator OverlayPayload?
OverlayOperator ::= "+" | "-" | "*" | "/" | "0" | "T"
OverlayPayload ::= Expression

OutputStatement ::= Identifier "^0"   (* operand must be a bare identifier *)

(* ── Expressions ── *)
Expression     ::= ConditionalExpression
ConditionalExpression ::= OrExpression [ "?" Expression ":" Expression ]
(* Phase 9: `and`/`or` boolean combinators — short-circuit, and (unlike C++'s
   `&&`/`||`) return an OPERAND, not always a bool, matching Python exactly.
   `∧`/`∨` are accepted Unicode display forms (normalized before lexing). *)
OrExpression   ::= AndExpression { ("or" | "∨") AndExpression }
AndExpression  ::= NotExpression { ("and" | "∧") NotExpression }
(* `not_test: 'not' not_test | comparison` — right-recursive, mirrors Python's
   own grammar exactly, so `not not x` parses correctly. `not` binds looser
   than comparison but tighter than `and`/`or`. `¬` is an accepted Unicode
   display form (trailing-space-only substitution — unlike `∧`/`∨`, `¬` is a
   PREFIX operator and can be the first character on a line, where a leading
   space would corrupt the indentation-sensitive lexer). *)
NotExpression  ::= ( "not" | "¬" ) NotExpression | ComparisonExpression
(* Correction (Phase 9): `MembershipExpression` was previously (mis)documented
   under `PrimaryExpression` below — the actual parser has always placed it
   between comparison and additive precedence. Corrected here, not a behavior
   change. *)
ComparisonExpression  ::= MembershipExpression [ ComparisonOperator MembershipExpression ]
ComparisonOperator    ::= ">" | "<" | ">=" | "<=" | "==" | "!=" | "≥" | "≤" | "≠"
AdditiveExpression    ::= MultiplicativeExpression { ("+" | "-") MultiplicativeExpression }
MultiplicativeExpression ::= PowerExpression { ("*" | "/" | "%") PowerExpression }
(* `^Number` (power, Number ≠ 0) and `^T` (transpose) are mutually-exclusive
   suffixes over a postfix/primary; they do not chain (no `m^T^2`). *)
PowerExpression ::= PostfixExpression [ ( "^" Number ) | "^T" ]
PostfixExpression ::= PrimaryExpression { CallSuffix | SubscriptSuffix | AttributeSuffix }
CallSuffix     ::= "(" [ ArgumentList ] ")"            (* call: f(a,b) / obj.method(a,b) (Phase 7c) *)
                 | "^+" "(" [ ArgumentList ] ")"       (* call-bind: f^+(a,b) (an expression; Identifier callee only) *)
SubscriptSuffix ::= "[" Expression "]"                 (* obj[index], Phase 7b *)
AttributeSuffix ::= "." Identifier                     (* obj.attr, Phase 7c *)
PrimaryExpression ::= Identifier
                    | Number | String
                    | SumExpression
                    | MatrixExpression
                    | ListLiteral
                    | TupleLiteral                     (* Phase 9 item 3a *)
                    | DictLiteral                      (* Phase 7b *)
                    | SetLiteral                       (* Phase 7b *)
                    | RangeExpression
                    | AwaitExpression                 (* Phase 3 *)
                    | "(" Expression ")"                (* plain grouping — NOT a 1-tuple, see TupleLiteral *)

AwaitExpression ::= "await" PrimaryExpression
ArgumentList   ::= Expression { "," Expression }
SumExpression  ::= "Σ" "(" Expression "," IteratorClause ")"
IteratorClause ::= Identifier InOperator RangeExpression
InOperator     ::= "in" | "∈"
RangeExpression ::= "[" Expression ":" Expression "]"   (* inclusive of the upper bound *)
MembershipExpression ::= AdditiveExpression [ InOperator (RangeExpression | AdditiveExpression) ]
MatrixExpression ::= "<M>" "(" Expression ")"
ListLiteral    ::= "[" [ ArgumentList ] "]"
(* `(x)` alone is plain grouping, NOT a 1-tuple — matches real Python exactly.
   A trailing comma is what makes it a tuple: `(x,)` is a genuine 1-element
   tuple, `()` an empty one. Phase 9 item 3a. *)
TupleLiteral   ::= "(" ")"
                 | "(" Expression "," [ ArgumentList ] [ "," ] ")"
DictLiteral    ::= "{" [ DictEntry { "," DictEntry } ] "}"        (* empty `{}` is a dict, Python parity *)
DictEntry      ::= Expression ":" Expression
SetLiteral     ::= "{" Expression { "," Expression } "}"          (* an empty set has no literal — use `set()` *)
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

### 5.2 `^-` `^*` `^/` `^%` — augmented assign

Always augmented (`-=`, `*=`, `/=`, `%=`). `^/` is Python-3 **true division** (float result).
Applying one to an undeclared variable emits warning `W_AUG_UNDECLARED` (it will `NameError` at
runtime). **`%` (modulo, Phase 9) is FLOOR-mod, matching Python exactly** — the result takes the
sign of the DIVISOR (`-7 % 3 == 2`, `7 % -3 == -2`), NOT the sign of the dividend the way C/C++/JS's
native `%` does (`-7 % 3 == -1` in those languages) — verified directly against the real, installed
Python interpreter before implementing, not assumed. `%`-by-zero raises `ZeroDivisionError('division
by zero')`, the same literal message for int and float operands alike. String-formatting `%`
(`"%s" % (a, b)`) is a distinct semantic from numeric modulo — see §5.10.

### 5.3 `^0` — output

`x^0` → `print(x)`. The operand MUST be a bare identifier; `print(<expression>)` is not directly
expressible — bind it first (`(a + b) => s` then `s^0`). (The reverse transpiler enforces the same
restriction.)

**Python's `print(x, end=...)` keyword argument is a deliberate, permanent, one-way exception (Phase
9 item 5)**: the reverse transpiler recognizes and parses it (so it doesn't hit a confusing raw
parser error), but `^0` has no forward EML syntax for a custom print terminator, and — asked
directly, not decided unilaterally — none is being invented. So `eml compress` on a real Python
program using `print(x, end=...)` always fails, with an explicit "EML cannot express print's `end`
keyword argument" message, the same fail-loud treatment as `await`/`async`/numpy-in-C++. This is a
precise diagnostic of where EML's expressible subset ends, not a partial or silent implementation.

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
integers; a non-integer literal bound is `E_RANGE_NONINT`. Emitter precedence (tightest → loosest,
as of Phase 9): power(8) > mul/div/mod(7) > add/sub(6) > comparison/membership(5) > not(4) > and(3) >
or(2) > conditional(1). The emitter parenthesizes minimally and exactly to preserve grouping; `**` is
right-associative (its base is parenthesized), `-`/`/`/`%` are non-associative (an equal-precedence
right operand is parenthesized — `a % (b % c)` keeps its parens, unlike `a + (b + c)`), and `and`/`or`
are associative in value (so an equal-precedence child is never force-parenthesized) but `and` binds
tighter than `or`, matching Python exactly. **`not` binds tighter than `and`/`or` but looser than
comparison** — `not x > 5` stays bare (means `not (x > 5)`, comparison binds tighter), `not (a or b)`
keeps its parens (or/and bind looser). This precedence relationship does **not** carry over to the
C⁺⁺⁺ backend — see §5.9.

### 5.8 Boolean combinators (`and`/`or`, Phase 9)

`and`/`or` are genuine short-circuit boolean combinators — the FIRST language-extension item added
after the reverse-transpiler effort (Phase 8) completed, closing a real B-6 corpus gap (`if menu < 1
or menu > 2:`, `(year % 4 == 0) and (year % 100 != 0) or (year % 400 == 0)`). `∧`/`∨` are accepted
Unicode display forms, normalized to `and`/`or` before lexing (mirroring `∈`→`in`).

**Critical semantic note, verified against real Python execution, not assumed**: `and`/`or` return
an **operand**, not always a `bool` — `a and b` returns `a` if `a` is falsy, else `b`; `a or b`
returns `a` if truthy, else `b`. The right operand is never evaluated unless needed (real
short-circuit, not just a correct final value — the interpreter's `evalExpr` implements this by
evaluating `left` once and branching, never evaluating `right` unless required). This is DIFFERENT
from the C++ prototype backend, which maps `and`/`or` to `&&`/`||` — always yielding `bool`, a real,
documented divergence for that backend only (see `docs/cpp-feasibility.md`).

Because `and`/`or` combine into every existing analysis pass (purity/importance/loop-classifier),
a call or loop hidden inside a boolean expression (`f() and g()`, `cond and Σ(...)`) is still found
by every pass — this was verified with dedicated tests, not assumed, since several of these walkers
have a non-exhaustive `default:` fallback where a missed case would silently (not loudly) under-count.

### 5.9 Unary negation (`not`, Phase 9)

`not x` is unary boolean negation — discovered as a real B-6 corpus gap (`Calculate_age`'s
`(not leap_year)`) only after the `%` blocker cleared on the same file, never reached by any earlier
measurement. Unlike `and`/`or`, **`not` always returns a real `bool`** (`not 0` is `True`, not `0` —
verified against real Python execution, since this is a genuine truthy-negation, not a bitwise/bool
flip). `¬` is an accepted Unicode display form.

**A real, easy-to-miss cross-language correctness risk, found by reasoning through concrete cases
before writing any emitter code**: Python's `not` binds LOOSER than comparison (`not x > 5` means
`not (x > 5)`), but C++'s `!` binds MUCH TIGHTER than comparison (`!x > 5` parses as `(!x) > 5` in
real C++). Reusing this spec's shared precedence system (built to mirror Python's own precedence,
which the Python and EML emitters both genuinely share) for the C⁺⁺⁺ backend would silently emit
textually-plausible C++ that means something different. **Fix**: the C⁺⁺⁺ backend's `not` case
bypasses the shared precedence machinery entirely and always parenthesizes its operand (`!(...)`) —
correctness over minimal parens. This is documented as its own divergence in `docs/cpp-feasibility.md`,
distinct from (and more severe than) the `and`/`or`-to-`&&`/`||` narrowing in §5.8, since getting it
wrong wouldn't just lose short-circuit-operand semantics — it would silently compute the WRONG
boolean result.

### 5.10 Tuple literals and `%` string-formatting (Phase 9 item 3a)

`(a, b, ...)` is a real, immutable tuple literal — discovered as a real B-6 corpus gap
(`Calculate_age`'s `"%s's age is %d years or " % (name, year)`) alongside the `%` string-formatting
operator itself; EML had no tuple type at all before this. `(x)` **without** a trailing comma stays
plain grouping (returns `x`, not a 1-tuple — matches real Python exactly); `(x,)` is a genuine
1-element tuple, `(x, y)`/`(x, y,)` a 2-element one, `()` an empty one. A tuple is a DIFFERENT kind
from a list — `(1, 2) == [1, 2]` is `False`, matching real Python (they never compare equal even with
identical elements).

`%` is Python's printf-style string-formatting operator when its left operand is a string — a
distinct semantic from numeric modulo (§5.2). The right operand supplies the substitution value(s):
a tuple supplies them in order; anything else is treated as the single value (`"%s" % 5` and `"%s" %
(5,)` are identical, matching real Python). Supported directives: `%s` (via `str()`), `%d` (int
conversion — **truncates a float toward zero**, `3.9`→`3`, `-3.9`→`-3`), `%f` (fixed 6-decimal
default precision), `%%` (literal percent, consumes no argument). Argument-count mismatches and
cross-type errors raise the exact real-Python messages (verified directly against the installed
Python before implementing): `not enough arguments for format string`, `not all arguments converted
during string formatting`, `unsupported operand type(s) for %: '<type>' and 'str'`, `%d format: a
real number is required, not <type>`.

**Deliberately out of scope this round** (documented gaps, not silent mis-implementations — each
already fails loud via an existing generic default rather than computing something wrong): tuple
arithmetic (`+` concat, `*` repeat) and ordering comparison (`<`/`>`); tuple hashability (real Python
tuples are hashable when every element is — that recursive check isn't modeled, so a tuple can't be
used as a dict/set key this round); `%(name)s` mapping-style directives and any flag/width/precision
modifier (`%05d`, `%.2f`).

`.format()` (the other string-formatting mechanism, once assumed to be a separate future item —
**turned out on inspection to already work, no new implementation needed**): `"...".format(x)` is
representationally just an ordinary attribute-call (`Attribute` + `Call`, generic since Phase 7c), so
it parses, forward-emits, and reverse-round-trips today with zero `.format()`-specific code, verified
directly (`year = 2000; msg = "{0} is a leap year!!".format(year); print(msg)` compresses and
round-trips cleanly). It's in the exact same category as numpy's `<M>`/`^T`: the pure-JS interpreter
doesn't model its internals and reports it `Unsupported`, so `eml run` defers execution to a real
Python subprocess — an existing, accepted pattern, not a gap.

The C⁺⁺⁺ prototype backend has no tuple or string-formatting model at all and rejects a `Tuple`
literal outright with `E_CPP_UNSUPPORTED` — see `docs/cpp-feasibility.md`.

### 5.11 Triple-quoted strings (Phase 9 item 4)

`'''...'''` and `"""..."""` are real, lexer-only extensions of the existing quoted-string literal —
there is no separate EBNF terminal, since `StringLiteral` has no quote-style flag and every consumer
(parser, all 3 emitters, every semantic walker, the interpreter) already treats a triple-quoted value
identically to a regular one once lexed. A single stray occurrence of the delimiter's own quote
character (not 3 in a row) is ordinary content, not a premature close; an embedded literal newline is
preserved as real string content and safely re-escaped on emission (`JSON.stringify`-equivalent).
Verified directly (not assumed): a multi-line triple-quoted string cannot trigger spurious
INDENT/DEDENT tokens in either lexer, since the string-reading loop consumes embedded newlines
directly and never returns control to the outer dispatch's indentation check until the closing
delimiter is found — the same guarantee an ordinary string containing a stray literal newline already
relied on before this phase.

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

## 6b. Grammar completion — break/continue, dict/set/subscript, attribute/import, try/except/raise, class (Phase 7)

Five additive sub-phases (7a–7e) closing the remaining gap to "EML can express
a general-purpose program": Phase 6 (§6a) added branching/looping but no way
to exit a loop early, no keyed collections, no attribute/module access, no
exception handling, and no user-defined types.

**Shared foundation — `AssignTarget`.** EML has no native `target = value`
syntax (bare `=` is claimed as equality). The existing `=>` arrow idiom widens
its target side from one bare identifier to a chain of subscript/attribute
suffixes: `AssignTarget ::= Identifier { "[" Expression "]" | "." Identifier
}` (§3). `v => d[k]` and `v => self.x` are the *reversed* spelling; target-FIRST
compound assignment (`d[k] += v`) uses the new `+=`/`-=`/`*=`/`/=` tokens
instead. `OverlayStatement`'s `^`-sigil target and a `for`-loop's own target
stay `Identifier`-only — there is no declare-vs-augment ambiguity to resolve
for a subscript/attribute target (unlike a bare name), and tuple/subscript
`for`-targets were not requested.

### 7a — `break` / `continue`

`break` exits, `continue` skips to the next iteration of, the nearest
enclosing `while`/`for`. Both are legal anywhere at **parse** time; using one
outside a loop body is a **semantic** diagnostic (`E_BREAK_OUTSIDE_LOOP` /
`E_CONTINUE_OUTSIDE_LOOP`), mirroring how `return` outside a function is
checked (§6, `E_RETURN_OUTSIDE_FN`) rather than grammatically restricted. A
`def` nested inside a loop resets the loop context — its own `break` cannot
escape to an enclosing loop, matching Python.

### 7b — dict / set literals + subscript

`{k: v, ...}` is a dict; `{v, ...}` is a set; an empty `{}` is a dict (Python
parity) — an empty set has no literal spelling (`set()` only). `obj[index]`
reads/writes a list (negative indices supported), string (read-only —
`TypeError` on write, matching Python's string immutability), or dict
(`KeyError` on a missing read; write inserts-or-updates). Python's rule that
`1`/`1.0`/`True` are the *same* dict/set key is preserved by the reference
implementation's canonical key normalization.

### 7c — attribute access + user `import`

`obj.attr` reads/writes an attribute; `obj.method(args)` composes naturally
(an `Attribute` followed by a call suffix). `import module` accepts a single
bare top-level module name only — no `from x import y`, no `as` aliasing, no
dotted paths (`import os.path`). An attribute call/read without a matching
prior `import` is a runtime `NameError`, exactly as in real Python — EML does
not statically validate that the module name is real.

### 7d — `try` / `except` / `finally` + `raise`

`try: … (except [Type [as name]]: …)+ [finally: …]` — at least one `except`
or a `finally` is required (a bare `try:` alone is `E_PARSE`). `except:` with
no type is equivalent to `except Exception:` (catch-all). `raise` (bare)
re-raises the currently-handled exception; `raise Type("msg")` raises a new
one; `except Type as name:` binds `name` only for the duration of that
handler (Python's implicit `del` on exit — it does not leak into surrounding
scope).

### 7e — `class` — minimal viable OOP

```eml
class Counter:
    def __init__(self, start):
        start => self.value
    def increment(self):
        self.value + 1 => self.value
    def get(self):
        return self.value

Counter(0) => c
c.increment()
c.increment()
c.get() => r
r^0
```
→
```python
class Counter:
    def __init__(self, start):
        self.value = start
    def increment(self):
        self.value = self.value + 1
    def get(self):
        return self.value

c = Counter(0)
c.increment()
c.increment()
r = c.get()
print(r)
```

`class Name:` with no base-class clause (a `class Foo(Bar):` form is not
recognized by the grammar and fails loud as a plain `E_PARSE`). Methods are
ordinary `FunctionDefinition` nodes — `self` is an ordinary first parameter,
nothing special grammatically. A class body may otherwise only contain a
plain assignment (a class-level variable) — anything else is
`E_CLASS_BODY_UNSUPPORTED`. No inheritance, no multiple inheritance, no
method decorators (`@staticmethod`/`@classmethod`/`@property`). A method may
be given ANY name, including a dunder — nothing in the class-body validation
rejects it — but no dunder gets automatic runtime dispatch except `__init__`
(construction) and, as of Phase 9 item 6, `__enter__`/`__exit__` (real
dispatch via `with` — see below); `__str__`/`__repr__`/`__eq__`/operator
overloading remain ordinary, never-auto-called methods. A `@cold`/`@hot`/`@temporal_loop` decorator on a method is
diagnosed (`W_METHOD_DECORATOR_UNSUPPORTED`) and has no effect — method
bodies are not analyzed by the cold/hot/purity/importance/crystallization
stack this round (§6's per-function analysis applies only to top-level and
nested *functions*, not methods — this is a deliberate scope cut to avoid
two unrelated classes' same-named methods colliding in that whole-program,
bare-name-keyed analysis). `W_CLASS_REDECLARED` mirrors `W_FN_REDECLARED`.
Instantiation (`Foo(args)`) is an ordinary function call grammatically —
Python itself resolves class-vs-function at runtime.

### Phase 9 item 6 — `with` / context managers

`with <expr> [as <name>]: <body>` — single context-manager, single optional
target only (Python's multi-context `with a() as x, b() as y:` form is out of
scope, not corpus-driven). EML's own concrete syntax is Python's `with`
keyword verbatim, the same "no sigil translation" treatment `try`/`except`
already get. The `as` target, once bound, stays reliably bound after the
block ends — matching a `for`-loop's target, not `try`'s more cautious
per-branch scoping (a `with`-body always executes in full before any
exception matters, unlike `try`, which can fail partway through).

No context-manager `PyVal` is modeled — the interpreter dispatches REAL
`__enter__`/`__exit__` methods when the context value is a class instance
(Phase 7e) defining both, exactly matching real Python's protocol (checking
`__exit__` presence before `__enter__`, both verified directly against the
installed Python, not assumed):

```
'<type>' object does not support the context manager protocol (missed __exit__ method)
'<type>' object does not support the context manager protocol (missed __enter__ method)
```

`__exit__(exc_type, exc_val, exc_tb)` is called unconditionally — with
`(None, None, None)` on normal completion (or on a non-exception exit like
`break`/`continue`/`return` from inside the body, matching `with`'s real
`finally`-like guarantee), or with the propagating exception's type/message
(as plain strings — the same deliberate simplification `except`'s own
exception binding already uses; no traceback object is modeled, so `exc_tb`
is always `None`) if the body raised. `__exit__` returning a truthy value
suppresses that exception — verified directly against real Python
(`with Suppress(): raise ...` completes with no exception when `__exit__`
returns `True`).

There is no built-in context manager (a real `open()` file handle, a lock,
etc.) — `open(...)` itself is not modeled by the interpreter at all (a plain
`NameError`, since it's never bound), so `with open(...) as f:` reverse-
transpiles and forward-emits as plain text (the `with` statement itself is
fully supported), but never actually *executes* under `eml run` — the same
category of gap as numpy's `<M>`/`^T` or `.format()`.

### Diagnostics and back ends (Phase 7, all sub-phases)

7a and 7e are the only sub-phases with new diagnostic codes (Appendix A);
7b/7c/7d intentionally add **none** — dict/set/subscript errors (`KeyError`,
`IndexError`, `TypeError`) are runtime `PyError`s like existing arithmetic
errors, an `import`ed name that's never really available is a runtime
`NameError` like real Python, and try/except/raise's scoping and matching
subtleties are deliberately runtime concerns, not static ones. The C⁺⁺⁺
prototype back end (§10) and reverse Python→EML transpilation (§9) both fail
loudly on every Phase 7 construct — see §11.

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
loudly** on inexpressible constructs rather than guessing. As of Phase A (2026-07-16), the subset
includes `if`/`elif`/`else`, `while`, and `for...in` (§6a); as of Phase B1 (same day), `break`/
`continue` (§6b); as of Phase B2 (same day), dict/set literals + subscript, including subscript
assignment targets (`d[k] = v` / `d[k] += v`); as of Phase C (same day), attribute access — including
as a call callee (`math.sqrt(x)`) and as an assignment target (`obj.attr = v` / `obj.attr += v`) —
and a bare `import module` statement; as of Phase D (same day), `try`/`except`/`finally` and `raise`;
as of Phase E1 (same day), function definitions and `return` — the `@cold`/neutral subset only (see
below); **as of Phase E2 (2026-07-17), `class`** — minimal-viable-OOP (§7e): methods are ordinary
nested function definitions and `self` is just an ordinary first parameter, so this closed out with
almost no new logic beyond a `class Name:` header and a fresh, class-local `bound` scope — see §11's
addenda. **This is the final phase of the reverse-transpiler effort**: every Phase 0–7 statement/
expression kind that CAN round-trip now does. The only remaining forward-only constructs (NOT part
of the round-trip invariant) are `@temporal_loop` and `async`/`await`. **As of Phase 9 (2026-07-17),
`and`/`or` (§5.8), numeric `%` (§5.2), and unary `not` (§5.9) also round-trip; as of the same Phase 9
(item 3a), tuple literals and `%` string-formatting (§5.10) round-trip too; as of 2026-07-18 (item 4),
triple-quoted strings (§5.11) round-trip as well; the same day (item 6), `with`/context managers
(§6's "Phase 9 item 6" subsection) round-trip too** — each a genuinely new (or, for `%`, meaningfully
extended) expression/statement kind added AFTER the reverse-transpiler effort concluded, as items of a
separate language-extension track (real B-6 corpus gaps beyond grammar completeness); both directions
were built together for each of these, unlike Phase A–E2's reverse-only rounds. (Item 5,
`print(x, end=...)`, is the one deliberate EXCEPTION — reverse-only by explicit choice, since it would
otherwise require inventing new forward EML syntax; see §5.3.)
**`@hot` is a permanent, structural round-trip gap within function support, not a deferred one**
(distinct from `class`, which was merely not-yet-implemented until this phase): the forward Python
emitter renders `@cold` as a real `@functools.cache` decorator but `@hot` as a bare **comment**
(`# @hot: dynamic state — not cached`), and comments are never tokenized by the reverse lexer — so a
function that was originally `@hot` has no marker left in its emitted Python for the reverse path to
recover. **Verified precisely (not assumed): this does not surface as a reverse-parse error** — the
reverse lexer silently discards the comment and parses the decorator-stripped Python as an ordinary
neutral function, so `transpilePythonToEml` itself succeeds. The information loss only becomes
visible as a silent round-trip **mismatch** (`python1 != python2`, since python1 still carries the
`@hot` comment and the reconstructed python2 does not) — the same category of permanent, one-way
information loss as `async`/`await`, but manifesting as a quiet fixpoint miss rather than a thrown
error. Also note: the reverse path treats a bare `import functools` as auto-generated boilerplate and
never reconstructs it as a literal EML import — the forward semantic analyzer auto-synthesizes
exactly this import whenever a non-async `@cold` function exists, independent of any user-authored
import, so preserving it literally would duplicate it on the next forward pass.
**Known whole-language boundary, not a Phase B2 gap**: neither transpilation direction has ever
supported a bracketed literal (`[...]`, `{...}`, a call's `(...)`) spanning multiple physical lines —
confirmed via a real corpus test (a genuine third-party Python file whose dict literal is written
across many lines): both lexers emit an unconditional `NEWLINE` token per `\n` regardless of bracket
nesting depth, with no Python-style implicit line-joining inside brackets. This is a pre-existing,
whole-language design boundary dating to Phase 0 (every list/dict/matrix literal in this repo's own
examples is written on one line), not a defect introduced by Phase B2 — extending either lexer to
support it would be its own separate, cross-cutting round. (Correction: an earlier revision of this
section also listed matrices as forward-only;
`<M>(...)`/`^T` have always round-tripped via the reverse emitter's `Matrix`/`Transpose` cases — this
was a documentation error, not a capability change.) Arbitrary-Python compression (lossy) is an
AI-assisted, validator-gated, suggestion-only layer (whitepaper §5.4) and is **not** part of the
deterministic core.

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
is untouched.

**Phase 7 addendum.** `break`/`continue`, dict/set literals + subscript, attribute access + user
`import`, `try`/`except`/`finally`/`raise`, and `class` (§6b) were added as new statement/expression
kinds, completing the grammar to general-purpose-program coverage. Also **additive**: nothing in
§4/§5/Appendix A's *existing* entries changed meaning, `AssignTarget` (§3) is a strict widening of
what an assignment target could already be (a bare identifier remains valid everywhere it was), and
the §9 round-trip guarantee for the previously-supported subset is untouched (every Phase 7 construct
is forward-only — reverse Python→EML and the C⁺⁺⁺ back end fail loudly on all of them, §6b). Five new
diagnostic codes were added to Appendix A (`E_BREAK_OUTSIDE_LOOP`, `E_CONTINUE_OUTSIDE_LOOP`,
`E_CLASS_BODY_UNSUPPORTED`, `W_METHOD_DECORATOR_UNSUPPORTED`, `W_CLASS_REDECLARED`) — additive per
the same policy. No language feature remains scoped-out from the original "general-purpose program"
goal; `class` explicitly excludes inheritance, method decorators, and dunders beyond `__init__` as a
permanent (not merely deferred) design simplification for this language generation.

**Phase 8 reverse-transpiler addendum, Phase A (2026-07-16).** The reverse Python→EML path (§9)
gained a real block-statement grammar: `if`/`elif`/`else`, `while`, and `for...in` (§6a) now
round-trip, on top of the INDENT/DEDENT/`COLON`-aware tokenization + suite parsing this required.
This **widens** the §9 round-trip guarantee rather than merely leaving it "untouched" as the Phase 6
addendum above said at the time — additive per the stability policy, since no previously-supported
mapping changed meaning. `break`/`continue`, dict/set literals + subscript, attribute access +
`import`, `try`/`except`/`finally`/`raise`, and `class` (§6b) remain forward-only this round —
explicitly deferred to their own follow-up rounds, not attempted here. One correctness subtlety
worth recording normatively: a name assigned inside only SOME branches of a non-exhaustive `if` (no
`else`) is not considered reliably bound afterward by the reverse emitter (an `AugmentedAssign` on
it fails loudly) — only a name assigned in EVERY branch of an exhaustive `if`/`elif`/`else` chain is
treated as bound going forward, mirroring how the forward semantic analyzer already reasons about
branch scope for Phase 6 control flow (§6a).

**Phase 8 reverse-transpiler addendum, Phase B1 (2026-07-16, same day).** `break`/`continue` (§6b)
now round-trip too — the reverse parser already needed to recognize them explicitly (see the note
below), so emission was a small, low-risk follow-on to Phase A rather than its own large slice.
Further widens §9's round-trip guarantee, additive per the stability policy. dict/set literals +
subscript, attribute access + `import`, `try`/`except`/`finally`/`raise`, and `class` (§6b) remain
forward-only, deferred to their own follow-up rounds.

**Phase 8 reverse-transpiler addendum, Phase B2 (2026-07-16, same day).** dict/set literals +
subscript (§6b) now round-trip, including subscript as an assignment target — `AssignTarget` (the
reverse parser's own target-detection logic, not the shared AST type, which needed no change) widened
from bare-identifier-only to `Identifier | Subscript`, mirroring the forward parser's existing
`Identifier | Subscript | Attribute` union. Further widens §9's round-trip guarantee, additive per
the stability policy. attribute access + `import`, `try`/`except`/`finally`/`raise`, and `class`
(§6b) remain forward-only, deferred to their own follow-up rounds. Re-testing against real,
unmodified third-party Python files (the same B-6 corpus-validation sample used to originally
motivate this whole effort) surfaced the whole-language multi-line-bracketed-literal boundary
recorded in §9 above — a genuine finding, not a regression, and explicitly not addressed this round.

**Phase 8 reverse-transpiler addendum, Phase C (2026-07-16, same day).** Attribute access (§6b) now
round-trips too — as an expression, as a call callee (`math.sqrt(x)`, mirroring
`tests/fixtures/26_import_math.eml`), and as an assignment target (`obj.attr = v` / `obj.attr += v`,
using the same reversed-arrow / real-compound-operator rules Phase B2 established for `Subscript`
targets). `AssignTarget` (the reverse parser's own target-detection logic) widened one final step to
`Identifier | Subscript | Attribute`, now matching the forward parser's `AssignTarget` union exactly.
A bare `import module` statement also now round-trips (parsed only when followed by exactly one
module name then a statement boundary — the sole shape EML's `ImportStatement` can express); an
aliased (`import x as y`) or dotted (`import os.path`) import, or any `from X import Y`, still
silently drops exactly as before this round (unchanged, deliberately not attempted — none of those
forms has an EML source form to round-trip to). Further widens §9's round-trip guarantee, additive
per the stability policy. `try`/`except`/`finally`/`raise` and `class` (§6b) remain forward-only,
deferred to their own follow-up rounds.

**Phase 8 reverse-transpiler addendum, Phase D (2026-07-16, same day).** `try`/`except`/`finally`
and `raise` (§6b) now round-trip too. Per-part `bound`-scope handling deliberately mirrors the
forward semantic analyzer's own documented conservatism (Phase 7d): the `try` body and each
`except` handler each get an ISOLATED scope clone that never merges back into the enclosing scope
(since which of them, if any, actually completed is conditional — the try body might fail partway
through), while `finally` shares the same live scope with no cloning (it always runs
unconditionally, the same reasoning already applied to `while`/`for` bodies in Phase A). A real,
verified-before-writing-code finding: Python's `pass` — commonly needed for an otherwise-empty
`except`/`try` body, since `parseBlock()` requires non-empty bodies — had the exact same silent-
mistranslation vulnerability `break`/`continue` had before Phase A's fix (a bare keyword immediately
followed by end-of-line is indistinguishable from a harmless identifier reference to this
simplified parser). EML has no no-op-statement AST node at all, so `pass` is recognized explicitly
and rejected with a clear error rather than silently accepted. Further widens §9's round-trip
guarantee, additive per the stability policy. Only function definitions and `class` (§6b) remain
forward-only after this round — every other Phase 0–7 statement/expression kind now round-trips.

**Phase 8 reverse-transpiler addendum, Phase E1 (2026-07-16, same day).** Function definitions and
`return` (Phase 2) now round-trip — the `@cold`/neutral subset only. Only the exact decorator shape
the forward emitter ever produces is recognized: `@functools.cache` → `temperature: 'cold'`; a bare
function gets no decorator; anything else (`@staticmethod`, `@property`, a custom decorator,
`functools.lru_cache(...)`, a parenthesized `@functools.cache()`) is rejected outright rather than
partial-matched, since none of those are reachable from this emitter's own output. `async def` is
also explicitly rejected with a dedicated, specific error message (temporal loops are a permanent
forward-only construct) rather than falling through to a generic parse failure. **`@hot` is a
permanent round-trip gap, not a deferred one** — see §9's normative note above; this is the first
Phase 8 round where "forward-only" doesn't mean "not implemented yet" for part of its own scope. A
second real finding, verified against the forward semantic analyzer's source before writing any
parser code: `import functools` is auto-synthesized boilerplate (added to the emitted Python
whenever a non-async `@cold` function exists, independent of any user-authored import), so the
reverse parser special-cases this exact bare import and never reconstructs it as a literal
`ImportStatement` — reconstructing it literally would duplicate it on the next forward pass (once
from the reconstructed import, once again from the auto-collection re-triggered by seeing `@cold`).
Function bodies introduced a new `bound`-scope rule, stricter than every prior block construct: a
FRESH, function-local scope (not cloned from the enclosing scope) pre-seeded only with the
function's own parameter names — the first construct isolated in BOTH directions (nothing declared
inside leaks out, matching if/try's existing behavior, but ALSO nothing from the caller's scope
leaks in, which if/while/for/try never needed since none of them are call boundaries). Further
widens §9's round-trip guarantee, additive per the stability policy. `class` (§6b) is now the only
forward-only construct left that is a deferred (not permanent) gap.

**Phase 8 reverse-transpiler addendum, Phase E2 (2026-07-17) — final phase.** `class` (§7e, minimal
viable OOP) now round-trips, closing out the reverse-transpiler effort: every Phase 0–7 statement/
expression kind that can round-trip now does. Verified directly against the AST and forward parser
before writing any code: `ClassDef` is just `{ name, body }` — no base classes, no decorators, and
methods are ordinary nested `FunctionDef` nodes with `self` as an unremarkable first parameter — so
this phase needed almost no new logic: a `class Name:` header, the same generic `parseBlock()` every
other compound statement already uses (the forward parser itself defers the "methods/assignments
only" body restriction to semantic analysis, not grammar, so the reverse parser mirrors that rather
than duplicating the restriction), and a fresh, class-local `bound` scope in the emitter — nested
method bodies need no special handling since `FunctionDef`'s own case already builds its own fresh
scope regardless of what's passed in. This is the smallest phase of the whole series, smaller even
than Phase B1. One correction surfaced while re-deriving a Phase E1 test for this round: `@hot`'s
round-trip failure is a silent mismatch, not a thrown reverse-parse error (see §9's revised normative
note above) — the original Phase E1 wording ("will not reach a fixpoint") was accurate but imprecise
about the mechanism; this addendum tightens it now that a real test forced the distinction. Further
widens §9's round-trip guarantee, additive per the stability policy. Only `@temporal_loop`,
`async`/`await`, and the permanent `@hot` exception remain outside the round-trip invariant.

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
| `E_BREAK_OUTSIDE_LOOP` | `break` used outside a loop body. |
| `E_CONTINUE_OUTSIDE_LOOP` | `continue` used outside a loop body. |
| `E_CLASS_BODY_UNSUPPORTED` | A class-body statement is neither a method definition nor a plain assignment. |
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
| `W_METHOD_DECORATOR_UNSUPPORTED` | A `@cold`/`@hot`/`@temporal_loop` decorator on a class method — not analyzed this round, has no effect. |
| `W_CLASS_REDECLARED` | A class name is redeclared in the same scope (mirrors `W_FN_REDECLARED`). |

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
