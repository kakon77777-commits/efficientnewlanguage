/**
 * Unicode -> ASCII-canonical normalization.
 *
 * EML allows a high-density Unicode *display* form (e.g. `Σ(i², i∈[1:N])`),
 * but the lexer operates on an ASCII-canonical form. This normalizer maps the
 * supported Unicode symbols to their canonical ASCII equivalents so that:
 *   - the tokenizer stays simple,
 *   - Git diffs / tests / agent edits work on stable ASCII,
 *   - Nova IME / Cogni-Editor can do the Unicode projection in the UI layer.
 *
 * `Σ` is intentionally left as-is; the lexer recognizes it directly (and also
 * accepts the ASCII keyword `SUM`).
 */

/** Superscript characters mapped to their ASCII payload (without the `^`). */
const SUPERSCRIPT: Record<string, string> = {
  '⁰': '0', // ⁰
  '¹': '1', // ¹
  '²': '2', // ²
  '³': '3', // ³
  '⁴': '4', // ⁴
  '⁵': '5', // ⁵
  '⁶': '6', // ⁶
  '⁷': '7', // ⁷
  '⁸': '8', // ⁸
  '⁹': '9', // ⁹
  '⁺': '+', // ⁺
  '⁻': '-', // ⁻
  'ᵀ': 'T', // ᵀ (superscript capital T -> transpose)
};

/**
 * Subscript digits (U+2080..U+2089) map to PLAIN ASCII digits glued to the
 * identifier — e.g. `r₁` -> `r1` (NOT `r^1`). This differs from superscripts,
 * which gain a leading `^`. Spec: grammar.md §1.2 (`r₁⁰` -> `r1^0`).
 */
const SUBSCRIPT: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
};

/** Direct one-to-one (or one-to-many) symbol replacements. */
const REPLACEMENTS: Array<[string, string]> = [
  ['⇒', '=>'], // ⇒
  ['≥', '>='], // ≥
  ['≤', '<='], // ≤
  ['≠', '!='], // ≠
  ['∈', ' in '], // ∈
  ['⟨', '<'], // ⟨  (matrix open ⟨M⟩ -> <M>)
  ['⟩', '>'], // ⟩
  ['×', '*'], // × (multiplication sign)
  ['−', '-'], // − (minus sign)
];

/**
 * Convert any run of superscript characters into `^<ascii>`.
 * e.g. `i²` -> `i^2`, `mᵀ` -> `m^T`, `x⁺100`-style runs -> `x^+100`.
 */
function normalizeSuperscripts(input: string): string {
  let out = '';
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch in SUPERSCRIPT) {
      let run = '';
      while (i < input.length && input[i] in SUPERSCRIPT) {
        run += SUPERSCRIPT[input[i]];
        i++;
      }
      out += '^' + run;
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}

export function normalizeSource(source: string): string {
  let s = source.replace(/\r\n?/g, '\n');
  for (const [from, to] of REPLACEMENTS) {
    s = s.split(from).join(to);
  }
  // Subscript digits -> plain digits (before superscripts, which add `^`).
  for (const [from, to] of Object.entries(SUBSCRIPT)) {
    s = s.split(from).join(to);
  }
  s = normalizeSuperscripts(s);
  return s;
}
