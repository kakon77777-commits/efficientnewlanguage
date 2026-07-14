/**
 * Hand-maintained keyword list, mirroring `packages/parser/src/lexer.ts`'s
 * keyword-recognition branches exactly (an if/else-if chain over a
 * `TokenType` switch, not an exported `Set` — a small duplication here is
 * cheaper than refactoring the lexer just for this). Keep in sync if the
 * lexer's keyword list ever changes.
 */
export const KEYWORDS: readonly string[] = [
  'in',
  'SUM',
  'def',
  'return',
  'async',
  'await',
  'if',
  'elif',
  'else',
  'while',
  'for',
  'break',
  'continue',
  'import',
  'try',
  'except',
  'finally',
  'raise',
  'as',
  'class',
];
