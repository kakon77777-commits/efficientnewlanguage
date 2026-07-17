/**
 * Lexer for the Python *subset* that the EML transpiler emits (and a little
 * more, to tolerate hand-written Python in the same subset). Not a full Python
 * lexer — it covers assignments, augmented assigns, print, arithmetic, power,
 * comparisons, ternary, calls, lists, ranges, sum-comprehensions,
 * np.array/np.transpose, (Phase A) `if`/`elif`/`else`, `while`, and `for...in`
 * block statements via COLON + INDENT/DEDENT tokenization, and (Phase B2)
 * dict/set literals + subscript via LBRACE/RBRACE.
 */

export type PyTokenType =
  | 'NAME'
  | 'NUMBER'
  | 'STRING'
  | 'ASSIGN' // =
  | 'PLUSEQ' // +=
  | 'MINUSEQ' // -=
  | 'STAREQ' // *=
  | 'SLASHEQ' // /=
  | 'POW' // **
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'LBRACE'
  | 'RBRACE'
  | 'COMMA'
  | 'DOT'
  | 'COLON'
  | 'AT'
  | 'GT'
  | 'LT'
  | 'GE'
  | 'LE'
  | 'EQEQ'
  | 'NE'
  | 'NEWLINE'
  | 'INDENT'
  | 'DEDENT'
  | 'EOF';

export interface PyToken {
  type: PyTokenType;
  value: string;
  line: number;
  column: number;
}

export class PyLexError extends Error {
  constructor(message: string, public readonly line: number, public readonly column: number) {
    super(message);
    this.name = 'PyLexError';
  }
}

const isDigit = (c: string): boolean => c >= '0' && c <= '9';
const isNameStart = (c: string): boolean =>
  (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
const isNamePart = (c: string): boolean => isNameStart(c) || isDigit(c);

export function lexPython(source: string): PyToken[] {
  const tokens: PyToken[] = [];
  const src = source.replace(/\r\n?/g, '\n');
  let pos = 0;
  let line = 1;
  let col = 1;
  // Indentation tracking (Phase A) — ported from the forward EML lexer
  // (packages/parser/src/lexer.ts), adapted to this file's helper names. A tab
  // counts as width 1 (no tab-stop expansion), matching the forward lexer's
  // own documented simplification.
  const indentStack: number[] = [0];
  let atLineStart = true;

  const peek = (o = 0): string => src[pos + o] ?? '';
  const at = (s: string): boolean => src.startsWith(s, pos);
  const advance = (n = 1): void => {
    for (let k = 0; k < n; k++) {
      if (src[pos] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
      pos++;
    }
  };
  const push = (type: PyTokenType, value: string, l: number, c: number): void => {
    tokens.push({ type, value, line: l, column: c });
  };

  while (pos < src.length) {
    if (atLineStart) {
      atLineStart = false;
      let width = 0;
      while (peek(width) === ' ' || peek(width) === '\t') width++;
      const after = peek(width);
      // Blank or comment-only lines don't change the indentation level; fall
      // through and let the whitespace/comment/newline handlers consume them.
      if (after !== '\n' && after !== '' && after !== '#') {
        const sLine = line;
        const sCol = col;
        advance(width);
        const top = indentStack[indentStack.length - 1]!;
        if (width > top) {
          indentStack.push(width);
          push('INDENT', '', sLine, sCol);
        } else if (width < top) {
          while (indentStack.length > 1 && indentStack[indentStack.length - 1]! > width) {
            indentStack.pop();
            push('DEDENT', '', line, col);
          }
          if (indentStack[indentStack.length - 1]! !== width) {
            throw new PyLexError(
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
    const l = line;
    const cc = col;

    if (c === ' ' || c === '\t') {
      advance();
      continue;
    }
    if (c === '\n') {
      advance();
      push('NEWLINE', '\n', l, cc);
      atLineStart = true;
      continue;
    }
    if (c === '#') {
      while (pos < src.length && peek() !== '\n') advance();
      continue;
    }

    // two-char operators first
    const two: Array<[string, PyTokenType]> = [
      ['**', 'POW'],
      ['+=', 'PLUSEQ'],
      ['-=', 'MINUSEQ'],
      ['*=', 'STAREQ'],
      ['/=', 'SLASHEQ'],
      ['==', 'EQEQ'],
      ['!=', 'NE'],
      ['>=', 'GE'],
      ['<=', 'LE'],
    ];
    let matchedTwo = false;
    for (const [lit, type] of two) {
      if (at(lit)) {
        advance(2);
        push(type, lit, l, cc);
        matchedTwo = true;
        break;
      }
    }
    if (matchedTwo) continue;

    if (c === '"' || c === "'") {
      const quote = c;
      advance();
      let value = '';
      while (pos < src.length && peek() !== quote) {
        if (peek() === '\\') {
          advance(); // backslash
          const e = peek();
          advance();
          value +=
            e === 'n' ? '\n'
            : e === 't' ? '\t'
            : e === 'r' ? '\r'
            : e === '\\' ? '\\'
            : e === '"' ? '"'
            : e === "'" ? "'"
            : e === '0' ? '\0'
            : '\\' + e;
        } else {
          value += peek();
          advance();
        }
      }
      if (peek() !== quote) throw new PyLexError('Unterminated string', l, cc);
      advance();
      push('STRING', value, l, cc);
      continue;
    }

    if (isDigit(c) || (c === '.' && isDigit(peek(1)))) {
      let value = '';
      while (isDigit(peek())) {
        value += peek();
        advance();
      }
      if (peek() === '.' && isDigit(peek(1))) {
        value += peek();
        advance();
        while (isDigit(peek())) {
          value += peek();
          advance();
        }
      }
      push('NUMBER', value, l, cc);
      continue;
    }

    if (isNameStart(c)) {
      let value = '';
      while (isNamePart(peek())) {
        value += peek();
        advance();
      }
      push('NAME', value, l, cc);
      continue;
    }

    const single: Record<string, PyTokenType> = {
      '=': 'ASSIGN',
      '+': 'PLUS',
      '-': 'MINUS',
      '*': 'STAR',
      '/': 'SLASH',
      '(': 'LPAREN',
      ')': 'RPAREN',
      '[': 'LBRACKET',
      ']': 'RBRACKET',
      '{': 'LBRACE',
      '}': 'RBRACE',
      ',': 'COMMA',
      '.': 'DOT',
      ':': 'COLON',
      '>': 'GT',
      '<': 'LT',
      '@': 'AT',
    };
    if (c in single) {
      advance();
      push(single[c]!, c, l, cc);
      continue;
    }

    throw new PyLexError(`Unexpected character: ${JSON.stringify(c)}`, l, cc);
  }

  // Close any blocks still open at end of file (mirrors the forward lexer).
  while (indentStack.length > 1) {
    indentStack.pop();
    push('DEDENT', '', line, col);
  }

  tokens.push({ type: 'EOF', value: '', line, column: col });
  return tokens;
}
