# EML 2026 — Architecture (Phase 0)

## Pipeline

```
source (EML/Py⁺)
  │  normalizeSource()        Unicode display form → ASCII canonical
  ▼
normalized string
  │  lex()                    → Token[]
  ▼
tokens
  │  parseProgram()           → syntactic AST (may contain OverlayAssign)
  ▼
AST
  │  analyzeSemantics()       resolve overlays, collect imports, track decls
  ▼
resolved AST + imports + diagnostics
  │  emitProgram()            → Python fragments
  ▼
Python (raw)
  │  formatPython()           stable, deterministic formatting
  ▼
Python (final)  ──► run (python) / golden test / CTS export
```

`transpileEmlToPython(source, options)` in `@eml/transpiler-python` runs the
whole chain and never throws — lex/parse failures come back as error
diagnostics in the `TranspileResult`.

## Layer responsibilities

| Layer | Does | Does NOT |
|---|---|---|
| Normalizer | Unicode → ASCII canonical | grammar analysis |
| Lexer | source → tokens | AST structure |
| Parser | tokens → syntactic AST | symbol resolution |
| Semantic | resolve overlays, imports, decls, diagnostics | Python string output |
| Emitter | AST → Python fragments | tokenization |
| Formatter | stable formatting | semantic rewriting |
| CTS generator | AST + symbols → CTS | Python emit |

## AST node reference

Expressions: `Identifier`, `NumberLiteral`, `StringLiteral`, `Power`, `Binary`,
`Comparison`, `Conditional`, `Range`, `Sum`, `Membership`, `Call`, `Matrix`,
`Transpose`, `List`.

Statements (syntactic): `OverlayAssign` (parser-only), `Assignment`,
`AugmentedAssign`, `Output`, `ExpressionStatement`.

`OverlayAssign` is resolved away by the semantic analyzer into `Assignment` or
`AugmentedAssign` before emission. See
[agent-handoff.md](agent-handoff.md) §"Two-stage AST".

## Expression precedence (emitter parenthesization)

Higher binds tighter; the emitter parenthesizes a child when it binds looser
than its parent context:

```
1  Conditional (? :)
2  Comparison / Membership (>, <, ==, in, …)
3  Additive (+ -)
4  Multiplicative (* /)
5  Power (**)
6  atoms (identifier, number, call, sum, list, range, matrix, transpose)
```

## CTS (PHOSPHOR-compatible)

`generateCts()` emits the shape in whitepaper Appendix C:

- `symbols` — symbol → `{ type, meaning, target }` from `eml-symbols.json`.
- `nodes` — per statement `{ id, source, python, dependencies, semanticType }`.
- `commentTable` — `nodeId → 人類說明`.
- `crossRefTable` — `identifier → [EML sources that bind it]`.

This is the bridge to PHOSPHOR's observability layer: semantic mapping, symbol
dependencies, and (later) execution trace.

## Module resolution (run-from-source monorepo)

Packages are "internal packages": `package.json#exports` points at
`./src/index.ts`. pnpm symlinks `@eml/*` into `node_modules`; tsx and vitest
load the `.ts` directly, and tsc type-checks via the same resolution. There is
no build step for development. Root-level tests require the `@eml/*` packages to
be listed in the **root** `package.json devDependencies` (`workspace:*`).
