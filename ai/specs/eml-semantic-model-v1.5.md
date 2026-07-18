# EML 1.5 AI Semantic Specification

**Document ID:** EML-AI-SEMANTIC-2026-v1.5
**Status:** recovered conceptual specification with implementation truth labels
**Project:** Efficient New Language (EML)
**Maintainer:** Neo.K / EveMissLab
**Updated:** 2026-07-18

## 0. Purpose and precedence

This document restores the EML 1.5 concepts that were compressed or omitted when the original
research plan was converted into an engineering MVP. It is written as a self-contained contract
for AI systems. An AI does not need any other theory, project, editor, observability platform, or
rights framework in order to understand EML.

Use the sources in this order:

1. `docs/EML-LANG-2026-v1.0.md` defines executable syntax and normative behavior.
2. `ai/specs/eml-grammar.ebnf` defines the accepted grammar.
3. `eml-symbols.json` defines registered overlay symbols.
4. This document defines the larger EML 1.5 semantic model and its implementation boundary.
5. Historical papers explain design history only. They MUST NOT override items 1–4.

If a construct appears here but not in the normative grammar, an AI MUST treat it as a concept,
not as executable EML syntax.

## 1. Minimal definition

EML is a deterministic semantic-overlay programming layer. It compresses high-frequency program
intent into symbols and structured metadata, then expands that representation into a standard host
language. Python is the canonical execution target of the current reference implementation.

The implemented core is:

```text
EML source
  -> normalize
  -> lex
  -> parse
  -> AST
  -> semantic analysis
  -> emit host-language code
  -> execute or interpret
  -> verify by tests, trace, and round-trip checks
```

The same source and toolchain MUST produce the same normalized result. No language model may alter
the deterministic core chain.

## 2. Status vocabulary

Every EML capability MUST be assigned one of these labels:

| Status | Meaning |
| --- | --- |
| `implemented` | Present in the reference code and covered by tests. |
| `partial` | A bounded MVP exists, but the full EML 1.5 behavior does not. |
| `conceptual` | Semantics are defined here, but no executable syntax/runtime is promised. |
| `planned` | A possible implementation direction; not normative. |

An AI MUST NOT translate `conceptual` or `planned` items into runnable EML unless a later grammar
version explicitly adds them.

## 3. Current implementation truth

| Capability | Status | Current truth |
| --- | --- | --- |
| Deterministic EML-to-Python transpilation | `implemented` | Rule-based parse, semantic analysis, and emission. |
| Python-to-EML reverse transpilation | `implemented` | Supported Python subset only; unsupported input fails loudly. |
| Round-trip fixpoint validation | `implemented` | Applied to the supported reversible subset. |
| Symbol registry | `implemented` | `eml-symbols.json` is authoritative for registered overlays. |
| General Python-like control flow | `implemented` | Includes conditionals, loops, functions, exceptions, classes, and supported collections. |
| Cold/hot function metadata | `implemented` | Purity checks, caching semantics, crystallization hash, and importance score. |
| Temporal loop runtime | `partial` | Async, non-busy waiting with deadline and interval; no durable cross-process suspension. |
| Five-level bug classification | `partial` | Classification, source mapping, and repair direction; no automatic source mutation. |
| Loop classification | `partial` | Recognizes implemented loop kinds; not all 12 semantic classes. |
| Automatic repair engine | `conceptual` | Proposal and validation model only. |
| Spiral/evolutionary loop runtime | `conceptual` | Mathematical semantics exist; no accepted surface syntax. |
| Full dynamic compiler | `partial` | Importance metadata exists; automatic probe injection and live recompilation are not complete. |

## 4. The EML semantic state

EML models a program state as:

$$
\mathcal{P}_t = (V_t, C_t, G_t, Q_t, O_t)
$$

where:

- $V_t$ is the value state: variables, objects, stack, and heap-visible values;
- $C_t$ is the control state: current node, branch, loop, and call context;
- $G_t$ is the dependency graph between symbols, values, functions, and modules;
- $Q_t$ is the temporal decision queue;
- $O_t$ is the observation stream containing structured execution events.

This tuple is an EML-native definition. It has no theoretical dependency outside EML.

## 5. Twelve-loop semantic taxonomy

The taxonomy classifies loops by intent and dynamics, not only by surface keywords. A `while`
statement may represent several semantic classes.

| ID | EML loop class | Semantic rule | Current status |
| --- | --- | --- | --- |
| L1 | Basic repetition | Repeat a deterministic body a bounded number of times. | `partial` (`basic_repeat`, `for_loop`) |
| L2 | Conditional loop | Continue while a predicate holds. | `partial` (`while_loop`) |
| L3 | Algebraic loop | Accumulate under an algebraic operator. | `partial` (`algebraic_sum`) |
| L4 | Event loop | Wait for and dispatch external events. | `conceptual` |
| L5 | Convergent loop | Iterate toward a fixed point within tolerance. | `conceptual` |
| L6 | Recursive loop | Generate repetition through self- or cycle-calls. | `partial` (`recursive`) |
| L7 | Fractal loop | Repeat a self-similar transformation across depth. | `conceptual` |
| L8 | Quantum loop | Evolve a superposed state and collapse by measurement. | `conceptual` |
| L9 | Chaotic loop | Deterministic transition with high sensitivity to initial conditions. | `conceptual` |
| L10 | Spiral loop | Follow one selected, progressively refined trajectory. | `conceptual` |
| L11 | Evolutionary loop | Generate multiple candidates and select by an objective function. | `conceptual` |
| L12 | Temporal loop | Suspend without busy-waiting until a condition, event, or deadline matures. | `partial` (`temporal`) |

### 5.1 Shared classification dimensions

Each detected loop may carry:

```json
{
  "loopKind": "temporal",
  "deterministic": false,
  "terminating": true,
  "bounded": true,
  "objective": "wait_for_condition",
  "implementation_status": "partial"
}
```

The minimum dimensions are:

- termination: bounded, conditionally terminating, or unbounded;
- determinism: deterministic or nondeterministic;
- objective: repeat, accumulate, converge, dispatch, search, refine, or wait;
- time mode: synchronous, asynchronous, or suspended;
- path count: single path or multiple candidate paths;
- adaptation: static, parameter-adaptive, or structure-adaptive.

### 5.2 Algebraic loop

For an accumulator $A_i$, an algebraic loop has the form:

$$
A_{i+1} = A_i \odot g(i)
$$

where $\odot$ may be addition, multiplication, minimum, maximum, or another declared algebraic
operator. The currently implemented `Σ(...)` construct is the summation subset.

### 5.3 Convergent loop

A convergent loop seeks a fixed point $S^*$:

$$
S_{i+1}=f(S_i),
\qquad
\lVert S_{i+1}-S_i\rVert < \varepsilon
$$

This is a semantic classification. EML does not currently provide dedicated convergent-loop syntax.

### 5.4 Spiral loop

A spiral loop follows one selected refinement path:

$$
S_{i+1}=S_i+\Delta S_i,
\qquad
\lVert\Delta S_{i+1}\rVert < \lVert\Delta S_i\rVert
$$

Its defining property is not literal geometric rotation. It is single-path, directed refinement
whose update magnitude contracts as it approaches a target or stable regime.

### 5.5 Evolutionary loop

An evolutionary loop explores multiple candidates:

$$
E_{i+1}
=
\operatorname*{arg\,max}_{k\in\{1,\ldots,K\}}
J\!\left(M_k(E_i,\xi_k)\right)
$$

where $M_k$ is a candidate-producing transformation, $\xi_k$ is an exploration parameter, and
$J$ is an explicit evaluation function.

The distinction is strict:

| Property | Spiral | Evolutionary |
| --- | --- | --- |
| Active paths | One | Many candidates |
| Direction | Selected and refined | Explored and compared |
| Evaluation | Internal progress rule | Explicit objective function |
| Typical risk | Lower | Higher |

An evolutionary loop may transition into a spiral loop after uncertainty collapses. One possible
transition rule is:

$$
\operatorname{Var}\!\left(\{J(M_k(E_i,\xi_k))\}_{k=1}^{K}\right)<\varepsilon
$$

This rule is conceptual and is not currently executed by the reference implementation.

## 6. Temporal loop model

The full temporal state is:

$$
\mathcal{S}_{\mathrm{temporal}}
=
\mathcal{S}_{\mathrm{program}}
\times
\mathcal{T}
\times
\mathcal{D}
$$

where $\mathcal{T}$ is time and $\mathcal{D}$ is the delayed-decision queue.

The temporal transition is:

$$
\mathcal{L}_{T}(S,t,\Delta t)
=
\begin{cases}
(S',t',D') & \text{if } \Phi(S,t)=\mathrm{true},\\
\operatorname{Suspend}(S,t+\Delta t,D\cup\{d\}) & \text{otherwise}.
\end{cases}
$$

A delayed decision is:

$$
d=(\mathrm{id},\mathrm{issue},t_{\mathrm{ready}},\mathrm{resolver},\mathrm{priority})
$$

### 6.1 Required semantics

A temporal loop MUST define:

- the condition or awaited operation;
- a check or wake strategy;
- a maximum wait or an explicit unbounded policy;
- timeout behavior;
- observable start, wait, resolution, timeout, and completion states.

### 6.2 Current MVP boundary

The reference implementation supports `@temporal_loop`, `async def`, `await temporal_wait(...)`,
`max_wait`, `check_interval`, and `timeout_action` through an injected Python async runtime.

It does not yet guarantee:

- durable suspension across process restart;
- distributed wake-up coordination;
- persisted decision queues;
- exactly-once resumption;
- automatic migration between runtime hosts.

Those items remain conceptual or planned.

## 7. Five-level bug model

EML separates detection, classification, action, and repair. A bug report is data; it is not
permission to mutate source code.

| Level | Meaning | Default action |
| --- | --- | --- |
| `CRITICAL` | Parsing, internal, or runtime failure that prevents safe continuation. | Stop and require intervention. |
| `MAJOR` | Localized blocking fault with a plausible repair direction. | Reject the affected result and propose repair. |
| `MINOR` | Soundness or runtime risk that does not block compilation. | Record, warn, and continue only when safe. |
| `TRIVIAL` | Advisory hygiene issue. | Record. |
| `COSMETIC` | Presentation-only issue. | Ignore or display. |

The implemented classifier maps diagnostics and Python tracebacks back to EML source locations and
semantic nodes. It never auto-fixes.

## 8. Automatic repair model

Automatic repair is a future EML capability. The safe pipeline is:

```text
detect
  -> classify
  -> generate one or more candidate patches
  -> static validation
  -> unit and property tests
  -> behavior comparison
  -> performance and side-effect checks
  -> human/policy approval when required
  -> apply with rollback metadata
  -> observe the repaired execution
```

A repair candidate $f'$ is acceptable only if all required gates hold:

$$
\operatorname{Accept}(f')
=
G_{\mathrm{syntax}}
\land G_{\mathrm{tests}}
\land G_{\mathrm{behavior}}
\land G_{\mathrm{effects}}
\land G_{\mathrm{performance}}
$$

An AI may propose a patch, but deterministic validators decide whether it is admissible. No
proposal may overwrite source without an explicit policy decision.

## 9. EML-native criticality model

The recovered dynamic-compiler idea is expressed entirely inside EML. For function $f$:

$$
I(f)=w_c C(f)+w_r R(f)+w_d D(f)
$$

where:

- $C(f)$ is call frequency;
- $R(f)$ is estimated risk;
- $D(f)$ is dependency depth;
- $w_c,w_r,w_d$ are configuration weights.

The current implementation computes these values as metadata. A future policy may use them to
select test strength, trace detail, review requirements, or probe placement.

The score MUST NOT silently authorize code mutation. Criticality and authority are separate.

## 10. EML-native module strata

To avoid importing external classifications, EML uses three descriptive strata:

| Stratum | Stability | Change rate | Default control |
| --- | --- | --- | --- |
| `kernel` | Highest | Lowest | Strong verification and human approval. |
| `core` | High | Moderate | Tests, trace, and bounded automated changes. |
| `adaptive` | Variable | High | Experimentation allowed inside explicit constraints. |

These names describe change policy only. They do not create new executable syntax.

## 11. Projection and observation

EML distinguishes one semantic artifact from its projections:

```text
EML source / AST
  -> host-language projection
  -> human-readable explanation
  -> structured execution events
  -> diagnostics and repair proposals
```

The editor, website, CLI, MCP server, and HTTP tools are interfaces to EML. None is required to
define EML semantics.

The current trace envelope retains the protocol string `phosphor-jsonl-v1` for compatibility. In
this specification it is treated as an EML wire-format identifier. Understanding or installing any
external project is not required, and the reference implementation has no runtime dependency on one.

## 12. AI interpretation rules

An AI reading EML documentation MUST follow these rules:

1. Parse `status` before interpreting a capability.
2. Never infer executable syntax from a mathematical definition.
3. Prefer the normative grammar and tests over prose examples.
4. Treat `eml-symbols.json` as a symbol registry, not as the complete grammar.
5. Distinguish a syntax symbol, an AST semantic type, a runtime capability, and a product UI.
6. Report unsupported input loudly; do not invent an approximation silently.
7. Treat legacy names in protocol strings or source paths as compatibility identifiers, not as
   prerequisites.
8. Keep EML conceptually self-contained unless an integration is explicitly requested.

## 13. Machine summary

```json
{
  "document": "EML-AI-SEMANTIC-2026-v1.5",
  "project": "EML",
  "selfContained": true,
  "normativeSyntaxSource": "docs/EML-LANG-2026-v1.0.md",
  "grammarSource": "ai/specs/eml-grammar.ebnf",
  "symbolSource": "eml-symbols.json",
  "recoveredConcepts": [
    "twelve_loop_taxonomy",
    "temporal_state",
    "spiral_evolution_transition",
    "five_level_bug_model",
    "validated_repair_pipeline",
    "criticality_scoring",
    "module_strata"
  ],
  "implementedLoopKinds": [
    "basic_repeat",
    "for_loop",
    "while_loop",
    "algebraic_sum",
    "recursive",
    "temporal"
  ],
  "nonExecutableWithoutFutureGrammar": [
    "event_loop_annotation",
    "convergent_loop_annotation",
    "fractal_loop_annotation",
    "quantum_loop_annotation",
    "chaotic_loop_annotation",
    "spiral_loop_syntax",
    "evolutionary_loop_syntax",
    "automatic_source_repair"
  ]
}
```

## 14. Completion criterion

The EML 1.5 recovery is successful when an AI can answer all four questions without consulting an
external theory:

1. What does EML execute today?
2. What larger semantic model does EML preserve?
3. Which items are partial, conceptual, or planned?
4. Which source is authoritative when documents disagree?

This document supplies that missing boundary.

## Appendix A — Integration gap and remedy

### A.1 Root cause of the gap

The original EML 1.5 plan had its concept layer compressed into a handful of engineering labels
when integrated into the MVP; the website's `/docs#symbols` page also used an independently
hand-written `SYMBOLS` array rather than reading directly from the language core's
`eml-symbols.json`. So when the language core gained capabilities, the website and AI docs stayed
on an old slice.

### A.2 Remedy strategy

- Put the full twelve-loop taxonomy and EML 1.5 semantics in an independent AI spec (this document).
- Give every capability a status, so concept and implementation are never conflated.
- Expand `/docs#symbols`'s symbol table into syntax families, and list the twelve-loop
  classification separately.
- Rewrite legacy product/theory names as EML-native components; compatibility strings may remain.
- Synchronize the AI manifest, `llms.txt`, spec summaries, and stale examples.

## Appendix B — Local agent handoff guidelines

| Aspect | Handoff rule |
| --- | --- |
| Source authority | Read the spec, EBNF, and tests first, then this document — never the reverse. |
| Conceptual syntax | `conceptual`/`planned` items must not produce parser or runtime syntax unless a separate, explicit change task says so. |
| Symbol data | When adding a new overlay, sync `eml-symbols.json`, the AI spec, the website table, and tests together. |
| Round-trip | Do not cite the old "all functions are forward-only" claim; go by the current test suite. |
| Repair authority | An AI may propose a patch, but tests, behavior gates, and explicit approval decide whether it's applied. |
| External integration | Integration may only be an optional interface, never written as a prerequisite for understanding EML. |

## Appendix C — Version information

| Field | Value |
| --- | --- |
| Document ID | EML-AI-SEMANTIC-2026-v1.5 |
| Formal name | Efficient New Language (EML) |
| Document status | Recovered conceptual specification with implementation truth labels |
| Original source | EML 1.5終極版：時間感知的自適應程式語言範式 |
| Rewrite date | 2026-07-18 |
| Maintainer | Neo.K / EveMissLab |
