/**
 * Python-faithful value model for the EML interpreter (`@eml/interp`).
 *
 * The interpreter is the browser-safe "execution truth" layer: it computes the
 * SAME results the transpiled Python would, so the Cogni-Editor can show a real
 * run + PHOSPHOR trace without a Python runtime. To stay faithful to Python we
 * model its value distinctions explicitly:
 *
 *  - `int` uses **bigint** (Python ints are arbitrary precision; JS numbers are
 *    not — `sum(i**2 …)` must not silently lose precision vs CPython).
 *  - `int / int` is **true division** -> float (Python 3), never integer floor.
 *  - `int ** nonNegInt` stays int; a negative/float operand promotes to float.
 *  - `print()` uses `str()`; values inside a list use `repr()` (strings quoted).
 *
 * Everything here is pure and dependency-free (browser-safe). Operations that a
 * faithful interpreter cannot reproduce (numpy matrices, asyncio temporal loops)
 * are NOT modeled here — the interpreter raises {@link PyError}/Unsupported for
 * them and the CLI defers those to a real Python run.
 */

export type PyVal =
  | { k: 'int'; v: bigint }
  | { k: 'float'; v: number }
  | { k: 'str'; v: string }
  | { k: 'bool'; v: boolean }
  | { k: 'list'; v: PyVal[] }
  // A first-class function value. `def` (the FunctionDef) and `closure` (the
  // defining Scope, for lexical closures) are interpreter-owned and kept opaque
  // here so this module stays dependency-free; the interpreter casts them.
  | { k: 'func'; name: string; def?: unknown; closure?: unknown }
  | { k: 'none' };

/** A Python-style runtime error (name mirrors the CPython exception class). */
export class PyError extends Error {
  constructor(
    public readonly pyType: string,
    message: string,
  ) {
    super(message);
    this.name = 'PyError';
  }
}

export const INT = (v: bigint | number): PyVal => ({ k: 'int', v: typeof v === 'bigint' ? v : BigInt(Math.trunc(v)) });
export const FLOAT = (v: number): PyVal => ({ k: 'float', v });
export const STR = (v: string): PyVal => ({ k: 'str', v });
export const BOOL = (v: boolean): PyVal => ({ k: 'bool', v });
export const LIST = (v: PyVal[]): PyVal => ({ k: 'list', v });
export const NONE: PyVal = { k: 'none' };

type PyNumeric = Extract<PyVal, { k: 'int' | 'float' | 'bool' }>;
const isNumeric = (a: PyVal): a is PyNumeric => a.k === 'int' || a.k === 'float' || a.k === 'bool';

const isFloaty = (a: PyVal): boolean => a.k === 'float';

/** Coerce an int/bool to bigint (bool is an int subtype in Python: True==1). */
const toBig = (a: PyVal): bigint => {
  if (a.k === 'int') return a.v;
  if (a.k === 'bool') return a.v ? 1n : 0n;
  throw new PyError('TypeError', `expected int, got ${typeName(a)}`);
};

/** Coerce any numeric (int/float/bool) to a JS number for float math. */
const toNum = (a: PyVal): number => {
  if (a.k === 'float') return a.v;
  if (a.k === 'int') return Number(a.v);
  if (a.k === 'bool') return a.v ? 1 : 0;
  throw new PyError('TypeError', `expected a number, got ${typeName(a)}`);
};

export function typeName(a: PyVal): string {
  switch (a.k) {
    case 'int':
      return 'int';
    case 'float':
      return 'float';
    case 'str':
      return 'str';
    case 'bool':
      return 'bool';
    case 'list':
      return 'list';
    case 'func':
      return 'function';
    case 'none':
      return 'NoneType';
  }
}

/** Python truthiness. */
export function truthy(a: PyVal): boolean {
  switch (a.k) {
    case 'int':
      return a.v !== 0n;
    case 'float':
      return a.v !== 0;
    case 'str':
      return a.v.length > 0;
    case 'bool':
      return a.v;
    case 'list':
      return a.v.length > 0;
    case 'func':
      return true;
    case 'none':
      return false;
  }
}

// ── Arithmetic ───────────────────────────────────────────────────────────────

export type ArithOp = '+' | '-' | '*' | '/';

export function arith(op: ArithOp, a: PyVal, b: PyVal): PyVal {
  // Non-numeric overloads first (str/list `+` and `*`), matching Python.
  if (op === '+') {
    if (a.k === 'str' && b.k === 'str') return STR(a.v + b.v);
    if (a.k === 'list' && b.k === 'list') return LIST([...a.v, ...b.v]);
    if (a.k === 'str' || b.k === 'str' || a.k === 'list' || b.k === 'list') {
      if (!(isNumeric(a) && isNumeric(b)))
        throw new PyError('TypeError', `unsupported operand type(s) for +: '${typeName(a)}' and '${typeName(b)}'`);
    }
  }
  if (op === '*') {
    const rep = seqRepeat(a, b);
    if (rep) return rep;
  }

  if (!isNumeric(a) || !isNumeric(b)) {
    const sym = op;
    throw new PyError('TypeError', `unsupported operand type(s) for ${sym}: '${typeName(a)}' and '${typeName(b)}'`);
  }

  // True division always yields a float (Python 3).
  if (op === '/') {
    const d = toNum(b);
    if (d === 0) throw new PyError('ZeroDivisionError', floatDivByZero(a, b));
    return FLOAT(toNum(a) / d);
  }

  // If either side is a float, compute in floats; otherwise exact bigint.
  if (isFloaty(a) || isFloaty(b)) {
    const x = toNum(a);
    const y = toNum(b);
    return FLOAT(op === '+' ? x + y : op === '-' ? x - y : x * y);
  }
  const x = toBig(a);
  const y = toBig(b);
  return INT(op === '+' ? x + y : op === '-' ? x - y : x * y);
}

function floatDivByZero(a: PyVal, b: PyVal): string {
  return isFloaty(a) || isFloaty(b) ? 'float division by zero' : 'division by zero';
}

/** Python `seq * int` / `int * seq` repetition; null if not a repeat case. */
function seqRepeat(a: PyVal, b: PyVal): PyVal | null {
  const pair =
    (a.k === 'str' || a.k === 'list') && (b.k === 'int' || b.k === 'bool')
      ? ([a, b] as const)
      : (b.k === 'str' || b.k === 'list') && (a.k === 'int' || a.k === 'bool')
        ? ([b, a] as const)
        : null;
  if (!pair) return null;
  const [seq, count] = pair;
  const n = Number(toBig(count));
  const times = n > 0 ? n : 0;
  if (seq.k === 'str') return STR(seq.v.repeat(times));
  const out: PyVal[] = [];
  for (let i = 0; i < times; i++) out.push(...seq.v);
  return LIST(out);
}

export function power(base: PyVal, exp: PyVal): PyVal {
  if (!isNumeric(base) || !isNumeric(exp))
    throw new PyError('TypeError', `unsupported operand type(s) for ** or pow(): '${typeName(base)}' and '${typeName(exp)}'`);
  const expIsNegInt = !isFloaty(exp) && toBig(exp) < 0n;
  if (!isFloaty(base) && !isFloaty(exp) && !expIsNegInt) {
    return INT(toBig(base) ** toBig(exp));
  }
  // Negative or float exponent -> float result (Python 3 semantics).
  const b = toNum(base);
  const e = toNum(exp);
  if (b === 0 && e < 0) throw new PyError('ZeroDivisionError', '0.0 cannot be raised to a negative power');
  return FLOAT(b ** e);
}

// ── Comparison & equality ────────────────────────────────────────────────────

export type CmpOp = '>' | '<' | '>=' | '<=' | '==' | '!=';

const isNan = (v: PyVal): boolean => v.k === 'float' && Number.isNaN(v.v);

export function compare(op: CmpOp, a: PyVal, b: PyVal): PyVal {
  if (op === '==') return BOOL(pyEquals(a, b));
  if (op === '!=') return BOOL(!pyEquals(a, b));
  // Any ordering comparison involving NaN is False in Python.
  if (isNan(a) || isNan(b)) return BOOL(false);
  // Ordering: numbers among themselves, strings among themselves, lists lexicographically.
  const c = order(a, b);
  switch (op) {
    case '>':
      return BOOL(c > 0);
    case '<':
      return BOOL(c < 0);
    case '>=':
      return BOOL(c >= 0);
    case '<=':
      return BOOL(c <= 0);
  }
}

/** Exact order of an int `i` against a FINITE float `f`: -1/0/1 (i vs f). */
function intFloatOrder(i: bigint, f: number): number {
  const fi = Math.floor(f);
  const ib = BigInt(fi); // exact: fi is an integral float
  if (i < ib) return -1;
  if (i > ib) return 1;
  return f > fi ? -1 : 0; // i == floor(f); a fractional part makes f the larger
}

function order(a: PyVal, b: PyVal): number {
  if (isNumeric(a) && isNumeric(b)) {
    const aF = isFloaty(a);
    const bF = isFloaty(b);
    if (!aF && !bF) {
      const x = toBig(a);
      const y = toBig(b);
      return x < y ? -1 : x > y ? 1 : 0;
    }
    if (aF && bF) {
      const x = toNum(a);
      const y = toNum(b);
      return x < y ? -1 : x > y ? 1 : 0;
    }
    // Exactly one float: compare by exact value (Python does NOT coerce the int
    // to a double — 2**53+1 != 2.0**53, and a huge int can exceed any finite float).
    const f = aF ? toNum(a) : toNum(b);
    const i = aF ? toBig(b) : toBig(a);
    const io = f === Infinity ? -1 : f === -Infinity ? 1 : intFloatOrder(i, f);
    return aF ? -io : io;
  }
  if (a.k === 'str' && b.k === 'str') return a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
  if (a.k === 'list' && b.k === 'list') {
    const n = Math.min(a.v.length, b.v.length);
    for (let i = 0; i < n; i++) {
      const c = order(a.v[i]!, b.v[i]!);
      if (c !== 0) return c;
    }
    return a.v.length - b.v.length;
  }
  throw new PyError(
    'TypeError',
    `'<' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`,
  );
}

export function pyEquals(a: PyVal, b: PyVal): boolean {
  if (isNumeric(a) && isNumeric(b)) {
    const aF = isFloaty(a);
    const bF = isFloaty(b);
    if (!aF && !bF) return toBig(a) === toBig(b);
    if (aF && bF) return toNum(a) === toNum(b); // NaN !== NaN handled by JS
    // One int, one float: exact (an int never equals a non-integral / non-finite float).
    const f = aF ? toNum(a) : toNum(b);
    const i = aF ? toBig(b) : toBig(a);
    return Number.isFinite(f) && Number.isInteger(f) && i === BigInt(f);
  }
  if (a.k === 'str' && b.k === 'str') return a.v === b.v;
  if (a.k === 'none' && b.k === 'none') return true;
  if (a.k === 'list' && b.k === 'list')
    return a.v.length === b.v.length && a.v.every((x, i) => pyEquals(x, b.v[i]!));
  return false;
}

/** `element in collection` (list membership / substring). */
export function contains(element: PyVal, collection: PyVal): PyVal {
  if (collection.k === 'list') return BOOL(collection.v.some((x) => pyEquals(x, element)));
  if (collection.k === 'str') {
    if (element.k !== 'str')
      throw new PyError('TypeError', `'in <string>' requires string as left operand, not ${typeName(element)}`);
    return BOOL(collection.v.includes(element.v));
  }
  throw new PyError('TypeError', `argument of type '${typeName(collection)}' is not iterable`);
}

// ── Formatting (str / repr) ──────────────────────────────────────────────────

/** Python `str(value)` — used by `print()`. */
export function pyStr(a: PyVal): string {
  switch (a.k) {
    case 'int':
      return a.v.toString();
    case 'float':
      return floatRepr(a.v);
    case 'str':
      return a.v;
    case 'bool':
      return a.v ? 'True' : 'False';
    case 'none':
      return 'None';
    case 'list':
      return '[' + a.v.map(pyRepr).join(', ') + ']';
    case 'func':
      return `<function ${a.name}>`;
  }
}

/** Python `repr(value)` — used for list elements (strings get quoted). */
export function pyRepr(a: PyVal): string {
  if (a.k === 'str') return reprStr(a.v);
  return pyStr(a);
}

function reprStr(s: string): string {
  // Python prefers single quotes; switches to double quotes only if the string
  // contains a single quote but no double quote.
  const hasSingle = s.includes("'");
  const hasDouble = s.includes('"');
  const quote = hasSingle && !hasDouble ? '"' : "'";
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (ch === '\\') out += '\\\\';
    else if (ch === quote) out += '\\' + quote;
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    // CPython escapes non-printable code points; cover C0 controls, DEL, and C1.
    else if (cp < 0x20 || cp === 0x7f || (cp >= 0x80 && cp <= 0xa0)) {
      out += '\\x' + cp.toString(16).padStart(2, '0');
    } else out += ch;
  }
  return quote + out + quote;
}

/**
 * Python `repr(float)` — shortest round-trip. CPython chooses scientific notation
 * when the decimal exponent is `< -4` or `>= 16`, otherwise fixed form with a
 * trailing `.0` for integral values. (JS `toString` only switches to exponent at
 * `< 1e-7` / `>= 1e21`, so we must decide the form ourselves from the true
 * decimal exponent given by `toExponential`.)
 */
export function floatRepr(n: number): string {
  if (Number.isNaN(n)) return 'nan';
  if (n === Infinity) return 'inf';
  if (n === -Infinity) return '-inf';
  if (n === 0) return Object.is(n, -0) ? '-0.0' : '0.0';
  const exp = n.toExponential(); // shortest mantissa, normalized 1 <= m < 10
  const m = /^(-?\d(?:\.\d+)?)e([+-])(\d+)$/.exec(exp);
  if (!m) return exp;
  const exp10 = Number(m[2] + m[3]);
  if (exp10 < -4 || exp10 >= 16) {
    return `${m[1]}e${m[2]}${m[3]!.padStart(2, '0')}`;
  }
  let s = n.toString(); // fixed form is non-exponential for -4 <= exp10 < 16
  if (!/[.eE]/.test(s)) s += '.0';
  return s;
}

/** Whether a value is hashable (usable as a dict key / functools.cache arg). */
export function isHashable(v: PyVal): boolean {
  return v.k !== 'list'; // dict/set not modeled; everything else is hashable
}
