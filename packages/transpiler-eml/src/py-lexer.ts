/**
 * Lexer for the Python *subset* that the EML transpiler emits (and a little
 * more, to tolerate hand-written Python in the same subset). Not a full Python
 * lexer — it covers assignments, augmented assigns, print, arithmetic, power,
 * comparisons, ternary, calls, lists, ranges, sum-comprehensions, and
 * np.array/np.transpose.
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
  | 'COMMA'
  | 'DOT'
  | 'GT'
  | 'LT'
  | 'GE'
  | 'LE'
  | 'EQEQ'
  | 'NE'
  | 'NEWLINE'
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
      ',': 'COMMA',
      '.': 'DOT',
      '>': 'GT',
      '<': 'LT',
    };
    if (c in single) {
      advance();
      push(single[c]!, c, l, cc);
      continue;
    }

    throw new PyLexError(`Unexpected character: ${JSON.stringify(c)}`, l, cc);
  }

  tokens.push({ type: 'EOF', value: '', line, column: col });
  return tokens;
}
