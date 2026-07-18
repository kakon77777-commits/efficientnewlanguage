import type { Token, TokenType } from '@eml/types';

export class LexError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
  ) {
    super(message);
    this.name = 'LexError';
  }
}

const isDigit = (c: string): boolean => c >= '0' && c <= '9';
const isIdentStart = (c: string): boolean =>
  (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
const isIdentPart = (c: string): boolean => isIdentStart(c) || isDigit(c);

/**
 * Lex the ASCII-canonical source into a flat token stream terminated by EOF.
 * Mid-line whitespace is skipped, `#` starts a line comment, and `\n` becomes
 * NEWLINE. Leading whitespace is significant: it drives Python-style INDENT /
 * DEDENT tokens (Phase 2, for `def` blocks). Blank and comment-only lines never
 * affect indentation. Use spaces for indentation (a tab counts as one column).
 */
export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;
  /** Indentation widths of the enclosing blocks; always starts with 0. */
  const indentStack: number[] = [0];
  /** True at the first column of a fresh logical line (drives INDENT/DEDENT). */
  let atLineStart = true;
  /** Depth of unclosed `(`/`[`/`{` — while > 0, a newline is an implicit line
   *  continuation (Phase 9 item 7): no NEWLINE token, no INDENT/DEDENT check,
   *  matching real Python's own bracketed-literal continuation rule. */
  let bracketDepth = 0;

  const peek = (o = 0): string => source[pos + o] ?? '';
  const at = (s: string, o = 0): boolean => source.startsWith(s, pos + o);

  const advance = (n = 1): string => {
    let consumed = '';
    for (let k = 0; k < n; k++) {
      const c = source[pos];
      consumed += c;
      pos++;
      if (c === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }
    return consumed;
  };

  const push = (type: TokenType, value: string, start: number, sLine: number, sCol: number): void => {
    tokens.push({ type, value, start, end: pos, line: sLine, column: sCol });
  };

  while (pos < source.length) {
    // ── indentation: emit INDENT/DEDENT at the start of a non-blank line ──
    if (atLineStart) {
      atLineStart = false;
      let width = 0;
      while (peek(width) === ' ' || peek(width) === '\t') width++;
      const after = peek(width);
      // Blank or comment-only lines do not change the indentation level; fall
      // through and let the whitespace/comment/newline handlers consume them.
      if (after !== '\n' && after !== '' && after !== '#') {
        const sLine = line;
        const sCol = col;
        const sPos = pos;
        advance(width); // consume the leading indentation
        const top = indentStack[indentStack.length - 1]!;
        if (width > top) {
          indentStack.push(width);
          push('INDENT', '', sPos, sLine, sCol);
        } else if (width < top) {
          while (indentStack.length > 1 && indentStack[indentStack.length - 1]! > width) {
            indentStack.pop();
            push('DEDENT', '', pos, line, col);
          }
          if (indentStack[indentStack.length - 1]! !== width) {
            throw new LexError(
              `Inconsistent indentation: dedent to ${width} does not match any enclosing block`,
              line,
              col,
            );
          }
        }
        continue;
      }
    }

    const c = peek();
    const startPos = pos;
    const startLine = line;
    const startCol = col;

    // whitespace (not newline)
    if (c === ' ' || c === '\t') {
      advance();
      continue;
    }

    // newline — an implicit line continuation while inside an unclosed
    // bracket (Phase 9 item 7): swallow it silently, matching real Python.
    if (c === '\n') {
      advance();
      if (bracketDepth === 0) {
        push('NEWLINE', '\n', startPos, startLine, startCol);
        atLineStart = true;
      }
      continue;
    }

    // line comment
    if (c === '#') {
      while (pos < source.length && peek() !== '\n') advance();
      continue;
    }

    // multi-char operators (check longest first)
    if (at('<M>')) {
      advance(3);
      push('MATRIX', '<M>', startPos, startLine, startCol);
      continue;
    }
    if (at('=>')) {
      advance(2);
      push('ARROW', '=>', startPos, startLine, startCol);
      continue;
    }
    if (at('==')) {
      advance(2);
      push('EQEQ', '==', startPos, startLine, startCol);
      continue;
    }
    if (at('>=')) {
      advance(2);
      push('GE', '>=', startPos, startLine, startCol);
      continue;
    }
    if (at('<=')) {
      advance(2);
      push('LE', '<=', startPos, startLine, startCol);
      continue;
    }
    if (at('!=')) {
      advance(2);
      push('NE', '!=', startPos, startLine, startCol);
      continue;
    }
    if (at('+=')) {
      advance(2);
      push('PLUSEQ', '+=', startPos, startLine, startCol);
      continue;
    }
    if (at('-=')) {
      advance(2);
      push('MINUSEQ', '-=', startPos, startLine, startCol);
      continue;
    }
    if (at('*=')) {
      advance(2);
      push('STAREQ', '*=', startPos, startLine, startCol);
      continue;
    }
    if (at('/=')) {
      advance(2);
      push('SLASHEQ', '/=', startPos, startLine, startCol);
      continue;
    }
    if (at('%=')) {
      advance(2);
      push('PERCENTEQ', '%=', startPos, startLine, startCol);
      continue;
    }

    // sigma (summation keyword)
    if (c === 'Σ') {
      advance();
      push('SIGMA', 'Σ', startPos, startLine, startCol);
      continue;
    }

    // string literal (single/double quoted, or triple-quoted `'''`/`"""` —
    // Phase 9 item 4). A triple-quoted string is representationally IDENTICAL
    // to a regular one once lexed (StringLiteral has no quote-style flag), so
    // both branches share the same escape-handling logic. Embedded raw
    // newlines inside either form are consumed directly by THIS loop's own
    // `advance()` calls and never reach the outer dispatch loop's `c === '\n'`
    // branch, so they can never spuriously trigger INDENT/DEDENT tracking —
    // verified directly, the same guarantee an ordinary string containing a
    // stray literal newline already relies on today.
    if (c === '"' || c === "'") {
      const quote = c;
      const readEscape = (): string => {
        advance(); // backslash
        const e = advance();
        return e === 'n' ? '\n'
          : e === 't' ? '\t'
          : e === 'r' ? '\r'
          : e === '\\' ? '\\'
          : e === '"' ? '"'
          : e === "'" ? "'"
          : e === '0' ? '\0'
          : '\\' + e;
      };
      if (at(quote.repeat(3))) {
        const delim = quote.repeat(3);
        advance(3);
        let value = '';
        while (pos < source.length && !at(delim)) {
          value += peek() === '\\' ? readEscape() : advance();
        }
        if (!at(delim)) {
          throw new LexError('Unterminated triple-quoted string literal', startLine, startCol);
        }
        advance(3); // closing delimiter
        push('STRING', value, startPos, startLine, startCol);
        continue;
      }
      advance();
      let value = '';
      while (pos < source.length && peek() !== quote) {
        value += peek() === '\\' ? readEscape() : advance();
      }
      if (peek() !== quote) {
        throw new LexError('Unterminated string literal', startLine, startCol);
      }
      advance(); // closing quote
      push('STRING', value, startPos, startLine, startCol);
      continue;
    }

    // number
    if (isDigit(c) || (c === '.' && isDigit(peek(1)))) {
      let value = '';
      while (isDigit(peek())) value += advance();
      if (peek() === '.' && isDigit(peek(1))) {
        value += advance(); // dot
        while (isDigit(peek())) value += advance();
      }
      push('NUMBER', value, startPos, startLine, startCol);
      continue;
    }

    // identifier / keyword
    if (isIdentStart(c)) {
      let value = '';
      while (isIdentPart(peek())) value += advance();
      let type: TokenType = 'IDENT';
      if (value === 'in') type = 'IN';
      else if (value === 'and') type = 'AND';
      else if (value === 'or') type = 'OR';
      else if (value === 'not') type = 'NOT';
      else if (value === 'SUM') type = 'SIGMA';
      else if (value === 'def') type = 'DEF';
      else if (value === 'return') type = 'RETURN';
      else if (value === 'async') type = 'ASYNC';
      else if (value === 'await') type = 'AWAIT';
      else if (value === 'if') type = 'IF';
      else if (value === 'elif') type = 'ELIF';
      else if (value === 'else') type = 'ELSE';
      else if (value === 'while') type = 'WHILE';
      else if (value === 'for') type = 'FOR';
      else if (value === 'break') type = 'BREAK';
      else if (value === 'continue') type = 'CONTINUE';
      else if (value === 'import') type = 'IMPORT';
      else if (value === 'try') type = 'TRY';
      else if (value === 'except') type = 'EXCEPT';
      else if (value === 'finally') type = 'FINALLY';
      else if (value === 'raise') type = 'RAISE';
      else if (value === 'as') type = 'AS';
      else if (value === 'class') type = 'CLASS';
      else if (value === 'with') type = 'WITH';
      push(type, value, startPos, startLine, startCol);
      continue;
    }

    // single-char tokens
    const single: Record<string, TokenType> = {
      '^': 'CARET',
      '+': 'PLUS',
      '-': 'MINUS',
      '*': 'STAR',
      '/': 'SLASH',
      '%': 'PERCENT',
      '(': 'LPAREN',
      ')': 'RPAREN',
      '[': 'LBRACKET',
      ']': 'RBRACKET',
      '{': 'LBRACE',
      '}': 'RBRACE',
      ':': 'COLON',
      ',': 'COMMA',
      '.': 'DOT',
      '?': 'QUESTION',
      '>': 'GT',
      '<': 'LT',
      '=': 'EQ',
      '@': 'AT',
    };
    if (c in single) {
      advance();
      const type = single[c];
      if (type === 'LPAREN' || type === 'LBRACKET' || type === 'LBRACE') bracketDepth++;
      else if (type === 'RPAREN' || type === 'RBRACKET' || type === 'RBRACE') bracketDepth = Math.max(0, bracketDepth - 1);
      push(type, c, startPos, startLine, startCol);
      continue;
    }

    throw new LexError(`Unexpected character: ${JSON.stringify(c)}`, startLine, startCol);
  }

  // Close any blocks still open at end of file (Python emits trailing DEDENTs).
  while (indentStack.length > 1) {
    indentStack.pop();
    push('DEDENT', '', pos, line, col);
  }

  tokens.push({ type: 'EOF', value: '', start: pos, end: pos, line, column: col });
  return tokens;
}
