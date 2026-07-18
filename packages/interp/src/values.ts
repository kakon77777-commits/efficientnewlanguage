/**
 * Python-faithful value model for the EML interpreter (`@eml/interp`).
 *
 * The interpreter is the browser-safe "execution truth" layer: it computes the
 * SAME results the transpiled Python would, so the EML Workbench can show a real
 * run + trace without a Python runtime. To stay faithful to Python we
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
  // Phase 9 item 3a: a real, immutable sequence value — same shape as `list`,
  // but a DIFFERENT kind (a tuple never equals a list with the same elements,
  // matching real Python). Deliberately narrower than list this round: no
  // arith (`+`/`*`) or ordering-comparison support, and NOT hashable (see
  // `isHashable`) — none of these are exercised by the real corpus yet, and
  // each already fails loud via an existing generic default rather than
  // computing something silently wrong. See docs/roadmap.md Phase 9 item 3a.
  | { k: 'tuple'; v: PyVal[] }
  // Phase 7b: dict/set, keyed by `canonicalKey()` (a JS Map can't use PyVal
  // structural equality directly). A dict entry keeps both the original key
  // PyVal (for repr/iteration) and its value; a set just keeps the element.
  | { k: 'dict'; v: Map<string, { key: PyVal; value: PyVal }> }
  | { k: 'set'; v: Map<string, PyVal> }
  // A first-class function value. `def` (the FunctionDef) and `closure` (the
  // defining Scope, for lexical closures) are interpreter-owned and kept opaque
  // here so this module stays dependency-free; the interpreter casts them.
  | { k: 'func'; name: string; def?: unknown; closure?: unknown }
  // Phase 7e: minimal viable OOP. `def`/`classDef` (both ClassDef ASTs) are
  // kept opaque for the same dependency-free reason as `func`'s `def`. An
  // instance's `attrs` map is the ONLY place instance state lives — there is
  // no separate class-level attribute store this round (see docs).
  | { k: 'class'; name: string; def: unknown }
  | { k: 'instance'; className: string; classDef: unknown; attrs: Map<string, PyVal> }
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
export const TUPLE = (v: PyVal[]): PyVal => ({ k: 'tuple', v });
export const NONE: PyVal = { k: 'none' };

/**
 * Canonical dict/set key: Python treats int/float/bool as the SAME key when
 * numerically equal (`hash(1) == hash(1.0) == hash(True)`; `{1: 'a'}[1.0]`
 * returns `'a'`), so numeric values normalize to one shared form. Everything
 * else gets a type-tagged form so e.g. the string `"n:1"` can never collide
 * with the canonicalization of the int `1`.
 */
export function canonicalKey(v: PyVal): string {
  if (v.k === 'int') return `n:${v.v}`;
  if (v.k === 'bool') return `n:${v.v ? '1' : '0'}`;
  if (v.k === 'float') {
    if (Number.isFinite(v.v) && Number.isInteger(v.v)) return `n:${BigInt(v.v)}`;
    return `n:${v.v}`; // NaN/Infinity/non-integral float: distinct from any int key
  }
  if (v.k === 'str') return `s:${v.v}`;
  if (v.k === 'none') return 'z:None';
  throw new PyError('TypeError', `unhashable type: '${typeName(v)}'`);
}

/** Build a dict PyVal from literal entries, in source order. A later entry
 *  with a numerically-equal key UPDATES the value but keeps the first key's
 *  identity for repr — matches Python's own `{1: 'a', 1.0: 'b'}` -> `{1: 'b'}`. */
export const DICT = (entries: { key: PyVal; value: PyVal }[]): PyVal => {
  const m = new Map<string, { key: PyVal; value: PyVal }>();
  for (const e of entries) {
    const ck = canonicalKey(e.key);
    const existing = m.get(ck);
    m.set(ck, { key: existing ? existing.key : e.key, value: e.value });
  }
  return { k: 'dict', v: m };
};

/** Build a set PyVal from literal elements; duplicates (by canonical key)
 *  collapse to the first-seen representative, matching Python set literals. */
export const SET = (elements: PyVal[]): PyVal => {
  const m = new Map<string, PyVal>();
  for (const e of elements) {
    const ck = canonicalKey(e);
    if (!m.has(ck)) m.set(ck, e);
  }
  return { k: 'set', v: m };
};

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
    case 'tuple':
      return 'tuple';
    case 'dict':
      return 'dict';
    case 'set':
      return 'set';
    case 'func':
      return 'function';
    case 'class':
      return 'type';
    case 'instance':
      return a.className;
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
    case 'tuple':
      return a.v.length > 0;
    case 'dict':
    case 'set':
      return a.v.size > 0;
    case 'func':
    case 'class':
    case 'instance':
      return true; // a plain object with no __bool__/__len__ override is always truthy
    case 'none':
      return false;
  }
}

// ── Arithmetic ───────────────────────────────────────────────────────────────

export type ArithOp = '+' | '-' | '*' | '/' | '%';

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

  // Python's `%` is FLOOR-mod (result takes the sign of the DIVISOR:
  // `-7 % 3 == 2`), unlike JS's native `%` (truncating, sign of the
  // dividend: `-7 % 3 === -1`). `((a % b) + b) % b` converts JS's truncating
  // mod into Python's floor-mod for both the bigint and float paths —
  // verified against real Python (3.14.5) for several sign combinations
  // before writing this, not assumed. The zero-modulus message is the same
  // literal 'division by zero' for int and float alike, also verified
  // directly (unlike `/`, whose message differs by type in this Python
  // version — `%`'s doesn't).
  if (op === '%') {
    const d = toNum(b);
    if (d === 0) throw new PyError('ZeroDivisionError', 'division by zero');
    if (isFloaty(a) || isFloaty(b)) {
      const x = toNum(a);
      const y = toNum(b);
      return FLOAT(((x % y) + y) % y);
    }
    const x = toBig(a);
    const y = toBig(b);
    return INT(((x % y) + y) % y);
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
  // Same kind required — a tuple never equals a list with the same elements
  // in real Python (`(1,2) == [1,2]` is False), so this deliberately does NOT
  // share a branch with the list case above.
  if (a.k === 'tuple' && b.k === 'tuple')
    return a.v.length === b.v.length && a.v.every((x, i) => pyEquals(x, b.v[i]!));
  if (a.k === 'dict' && b.k === 'dict') {
    if (a.v.size !== b.v.size) return false;
    for (const [key, entry] of a.v) {
      const other = b.v.get(key);
      if (!other || !pyEquals(entry.value, other.value)) return false;
    }
    return true;
  }
  if (a.k === 'set' && b.k === 'set') {
    if (a.v.size !== b.v.size) return false;
    for (const key of a.v.keys()) if (!b.v.has(key)) return false;
    return true;
  }
  // No `__eq__` override is modeled this round, so a class/instance falls
  // back to Python's own default: identity. Without this, `c == c` would
  // incorrectly fall through to `return false` below (neither side matches
  // any of the cases above), breaking reflexivity for the SAME object.
  if (a.k === 'instance' && b.k === 'instance') return a === b;
  if (a.k === 'class' && b.k === 'class') return a === b;
  return false;
}

/** `element in collection` (list membership / substring / dict keys / set membership). */
export function contains(element: PyVal, collection: PyVal): PyVal {
  if (collection.k === 'list' || collection.k === 'tuple')
    return BOOL(collection.v.some((x) => pyEquals(x, element)));
  if (collection.k === 'str') {
    if (element.k !== 'str')
      throw new PyError('TypeError', `'in <string>' requires string as left operand, not ${typeName(element)}`);
    return BOOL(collection.v.includes(element.v));
  }
  if (collection.k === 'dict' || collection.k === 'set') {
    if (!isHashable(element)) throw new PyError('TypeError', `unhashable type: '${typeName(element)}'`);
    return BOOL(collection.v.has(canonicalKey(element)));
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
    case 'tuple':
      // Single-element tuple needs the trailing comma in its repr too, e.g.
      // `(1,)` — matches real Python (`repr((1,))` is `'(1,)'`, not `'(1)'`).
      if (a.v.length === 0) return '()';
      if (a.v.length === 1) return `(${pyRepr(a.v[0]!)},)`;
      return '(' + a.v.map(pyRepr).join(', ') + ')';
    case 'dict':
      return '{' + [...a.v.values()].map((e) => `${pyRepr(e.key)}: ${pyRepr(e.value)}`).join(', ') + '}';
    case 'set':
      // Python has no `{}` literal for an empty set (that's a dict); repr matches.
      return a.v.size === 0 ? 'set()' : '{' + [...a.v.values()].map(pyRepr).join(', ') + '}';
    case 'func':
      return `<function ${a.name}>`;
    case 'class':
      return `<class '${a.name}'>`;
    case 'instance':
      // Real Python's default repr embeds a memory address (`<Counter object
      // at 0x7f...>`), which is inherently non-reproducible — there is no
      // meaningful "exact match" to chase here (no `__str__`/`__repr__`
      // override is modeled this round), so this is a deliberately stable
      // placeholder rather than a fabricated address. Never asserted against
      // real Python in the equivalence tests for that reason.
      return `<${a.className} object>`;
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

/**
 * Whether a value is hashable (usable as a dict key / functools.cache arg).
 * Real Python objects ARE hashable by default (identity-based hash) — `class`/
 * `instance` are marked unhashable here as a deliberate conservative
 * simplification (there is no meaningful *structural* key to assign them,
 * and this avoids ever needing one for dict-key / cache-key purposes this
 * round). Divergence, not a correctness gap: forward Python emission is
 * unaffected; only the interpreter's own caching/dict-key logic declines.
 *
 * A real Python tuple is hashable when every element is (`hash((1,2))` works;
 * `hash((1,[2]))` raises `TypeError`), but that recursive check isn't needed
 * by the real corpus this round (Phase 9 item 3a), so `tuple` stays excluded
 * here too — a documented gap (tuple-as-dict-key fails loud), not a partial,
 * possibly-wrong hashability implementation.
 */
export function isHashable(v: PyVal): boolean {
  return (
    v.k !== 'list' && v.k !== 'tuple' && v.k !== 'dict' && v.k !== 'set' && v.k !== 'class' && v.k !== 'instance'
  );
}

// ── `%` string-formatting (Phase 9 item 3a) ─────────────────────────────────

/**
 * Python's printf-style `%` string-formatting operator (`"%s and %d" % (a,
 * b)`). Deliberately scoped to what the real corpus needs — `%s`/`%d`/`%f`/
 * `%%`, no flags/width/precision/`%(name)s` mapping keys — anything beyond
 * that throws clearly rather than mis-formatting silently. `%d`'s float
 * truncation and `%f`'s 6-decimal default, and every error message below,
 * were verified directly against the real, installed Python before writing
 * this (not assumed): `'%d' % 3.9` -> `'3'`, `'%d' % -3.9` -> `'-3'`, `'%f' %
 * 3.14159265` -> `'3.141593'`.
 */
export function percentFormat(fmt: string, args: PyVal[]): string {
  let argIdx = 0;
  let out = '';
  for (let i = 0; i < fmt.length; i++) {
    const c = fmt[i];
    if (c !== '%') {
      out += c;
      continue;
    }
    const spec = fmt[++i];
    if (spec === '%') {
      out += '%';
      continue;
    }
    if (spec === undefined) throw new PyError('ValueError', "incomplete format");
    if (argIdx >= args.length) throw new PyError('TypeError', 'not enough arguments for format string');
    const val = args[argIdx++]!;
    if (spec === 's') {
      out += pyStr(val);
    } else if (spec === 'd') {
      if (!isNumeric(val)) {
        throw new PyError('TypeError', `%d format: a real number is required, not ${typeName(val)}`);
      }
      const n = isFloaty(val) ? BigInt(Math.trunc(toNum(val))) : toBig(val);
      out += n.toString();
    } else if (spec === 'f') {
      if (!isNumeric(val)) {
        throw new PyError('TypeError', `%f format: a real number is required, not ${typeName(val)}`);
      }
      out += toNum(val).toFixed(6);
    } else {
      throw new PyError('ValueError', `unsupported format character '${spec}'`);
    }
  }
  if (argIdx < args.length) throw new PyError('TypeError', 'not all arguments converted during string formatting');
  return out;
}
