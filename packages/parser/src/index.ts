import type { Program } from '@eml/types';
import { normalizeSource } from './normalizer';
import { lex } from './lexer';
import { parseProgram } from './parser';

export { normalizeSource } from './normalizer';
export { lex, LexError } from './lexer';
export { parseProgram, ParseError } from './parser';

/** Convenience: normalize -> lex -> parse, returning the AST. */
export function parse(source: string): Program {
  return parseProgram(lex(normalizeSource(source)));
}
