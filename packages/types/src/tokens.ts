/**
 * Token definitions for the EML / Py+ lexer.
 *
 * The lexer operates on the ASCII-canonical form produced by the normalizer.
 * A small set of high-value Unicode symbols (Σ, ∈, ⇒, ²) are normalized to
 * their canonical ASCII forms before lexing; see {@link packages/parser}.
 */

export type TokenType =
  // literals & names
  | 'IDENT'
  | 'NUMBER'
  | 'STRING'
  // overlay / arithmetic punctuation
  | 'CARET' // ^
  | 'PLUS' // +
  | 'MINUS' // -
  | 'STAR' // *
  | 'SLASH' // /
  // grouping
  | 'LPAREN' // (
  | 'RPAREN' // )
  | 'LBRACKET' // [
  | 'RBRACKET' // ]
  // structural
  | 'COLON' // :
  | 'COMMA' // ,
  | 'QUESTION' // ?
  | 'ARROW' // => (also ⇒)
  | 'AT' // @ — decorator marker (@cold / @hot)
  // comparison
  | 'GT' // >
  | 'LT' // <
  | 'GE' // >= (also ≥)
  | 'LE' // <= (also ≤)
  | 'EQEQ' // ==
  | 'NE' // != (also ≠)
  | 'EQ' // = (single equals, treated as equality comparison)
  // keywords / special multi-char
  | 'SIGMA' // Σ or SUM — summation keyword
  | 'IN' // in or ∈ — range membership
  | 'MATRIX' // <M> — matrix constructor opener
  | 'DEF' // def — function definition keyword
  | 'RETURN' // return — function return keyword
  | 'ASYNC' // async — async function modifier (temporal loops)
  | 'AWAIT' // await — await an async expression
  | 'IF' // if — conditional statement
  | 'ELIF' // elif — chained conditional branch
  | 'ELSE' // else — conditional / fallback branch
  | 'WHILE' // while — condition-controlled loop
  | 'FOR' // for — iteration over a range or list
  // block structure (Python-style significant indentation)
  | 'INDENT' // emitted when a logical line is more indented than the prior block
  | 'DEDENT' // emitted when indentation decreases back to an enclosing block
  // trivia
  | 'NEWLINE'
  | 'EOF';

export interface Token {
  type: TokenType;
  /** Raw lexeme as it appeared in the normalized source. */
  value: string;
  /** Start offset (inclusive) in the normalized source. */
  start: number;
  /** End offset (exclusive) in the normalized source. */
  end: number;
  /** 1-based line number. */
  line: number;
  /** 1-based column number. */
  column: number;
}
