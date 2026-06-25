# Security Policy

EML 2026 is an early-stage MVP. The transpiler is **deterministic and
rule-based**; it does not execute untrusted code as part of transpilation.

## Supported versions

| Version | Supported |
| ------- | --------- |
| `EML-LANG-2026 v1.0` (current) | ✅ |
| pre-v1.0 drafts (`grammar.md` v0.1, etc.) | ❌ (superseded) |

Until the first tagged public release, "supported" means the current `main`
working tree.

## Code execution surfaces (know what runs)

Three commands run code on your machine; the rest are pure transforms.

- **`eml run`** transpiles to Python and **executes the generated Python** via
  your local interpreter (`$EML_PYTHON`, else `python`/`py`/`python3`). Generated
  Python is written under `.tmp/` and runs with your permissions. Only run `.eml`
  files you trust.
- **`eml trace --run`** and **`eml bugs --run`** likewise execute the generated
  Python (to capture a real trace / classify a crash). Same trust requirement.
- **`eml suggest`** (AI path) executes LLM-proposed Python locally inside the
  round-trip validator — run it only with a trusted `ANTHROPIC_API_KEY`.

The browser **Cogni-Editor never executes Python**: its Trace tab runs the
sandboxed `@eml/interp` interpreter (no `eval`, no subprocess, no filesystem).

## Reporting a vulnerability

Until a public channel is established, report suspected vulnerabilities
privately to the maintainers (EveMissLab / Neo.K). Please include:

- A minimal `.eml` (or input) reproducing the issue.
- The generated Python (`eml transpile`) and/or AST (`eml ast`).
- Expected vs. actual behavior.

Do not open public issues for security-sensitive reports until a fix is
available.

## Disclosure timeline (target)

- **Acknowledge** a report within 7 days.
- **Triage / severity** within 14 days.
- **Fix or mitigation** for confirmed High/Critical issues before any public
  disclosure; coordinated disclosure thereafter. These targets firm up once a
  public reporting channel launches with the project website.
