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
  // A real, immutable sequence value — same shape as `list`, but a DIFFERENT
  // kind (a tuple never equals a list with the same elements, matching real
  // Python).
  //
  // Introduced deliberately narrow: no `+`/`*`, no ordering, not hashable, on
  // the reasoning that none were exercised by the corpus and each failed loud
  // rather than computing something wrong. Failing loud was true; "not
  // exercised" was an artifact of what the corpus happened to contain, and the
  // four narrowings turned out to be four SEPARATE omissions in four
  // hand-written type lists. All are now implemented and gated by
  // tests/operator-matrix.test.ts: concatenation, repetition (preserving the
  // type), lexicographic ordering, and recursive hashability so `(row, col)`
  // can key a dict — which is the main reason tuples exist.
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
  // `attrs` is the class-level namespace: what the class BODY bound, other
  // than methods. Python executes a class body in its own namespace and keeps
  // it as the class dict; instance lookup falls back to it. Modelling it as a
  // Map here (rather than re-walking `def.body` on each read) is what makes
  // that fallback a one-line lookup instead of a second statement evaluator.
  | { k: 'class'; name: string; def: unknown; attrs: Map<string, PyVal> }
  // `classAttrs` is the SAME Map object the class value holds, not a copy —
  // so a class attribute assigned after instances exist is visible to them,
  // which is what Python does.
  | { k: 'instance'; className: string; classDef: unknown; attrs: Map<string, PyVal>; classAttrs: Map<string, PyVal> }
  // Exceptions as real values. Before these existed, `except E as e` bound a
  // plain STRING (the message) and `__exit__`'s first argument was the type's
  // NAME as a string — so `exc_type == ValueError` could not be written at all
  // (`ValueError` was not a value), and printing exc_type gave `ValueError`
  // where CPython gives `<class 'ValueError'>`. Both were silent divergences
  // from the Python projection rather than loud deferrals.
  //
  // `exc_class` is the class object (`ValueError`); `exception` is an instance,
  // which carries the PyError it was built from so that equality is IDENTITY,
  // as in Python — two separately constructed `ValueError('x')` are not equal.
  | { k: 'exc_class'; name: string }
  | { k: 'exception'; err: PyError }
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
export const EXC_CLASS = (name: string): PyVal => ({ k: 'exc_class', name });
export const EXCEPTION = (err: PyError): PyVal => ({ k: 'exception', err });

/** The exception classes bound as names in a program's root scope. Kept in one
 *  place so the interpreter and any tooling agree on what `ValueError` resolves
 *  to. Only builtins the interpreter can actually RAISE are listed — binding a
 *  name it will never produce would make a handler look reachable when it is
 *  not. */
export const BUILTIN_EXCEPTIONS = [
  'Exception',
  'ArithmeticError',
  'AttributeError',
  'IndexError',
  'KeyError',
  'NameError',
  'OverflowError',
  'RecursionError',
  'RuntimeError',
  'StopIteration',
  'TypeError',
  'UnboundLocalError',
  'ValueError',
  'ZeroDivisionError',
] as const;

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
  // A TUPLE is hashable in Python iff all its elements are, which is what
  // makes `(row, col)` usable as a dict key — the single most common reason
  // to reach for a tuple at all. This was rejected outright, so a coordinate
  // could not key a grid. Recursive by construction: a tuple containing a
  // list raises here, exactly as Python does.
  if (v.k === 'tuple') return `t:(${v.v.map(canonicalKey).join(',')})`;
  throw new PyError('TypeError', `unhashable type: '${typeName(v)}'`);
}

/**
 * `canonicalKey`, but reporting the failure the way CPython does at a USE SITE.
 *
 * Bare `hash((1, [2]))` says `unhashable type: 'list'` — the inner offender.
 * Using the same value as a container key says
 *
 *     cannot use 'tuple' as a dict key (unhashable type: 'list')
 *
 * naming BOTH the value you tried to use and the element that made it
 * impossible. That extra context is the whole difference between an error that
 * points at your code and one that points at a type you never mentioned.
 * Wording verified against 3.14 for dict keys, set elements and both
 * membership tests, not reconstructed from memory.
 */
/**
 * Does rendering this value to text expose a SET's iteration order?
 *
 * CPython prints a set in hash order; this interpreter stores insertion order.
 * They coincide often enough to be dangerous — `{1, 2, 3}` matches — and
 * diverge as soon as the elements are strings, or the ints were inserted out
 * of order:
 *
 *     list({"washers", "rivets"})  ->  ['rivets', 'washers']   in CPython
 *                                      ['washers', 'rivets']   here
 *
 * Iterating a set already defers for exactly this reason. PRINTING one is the
 * same hazard through a different door, and it was still open: `str(a_set)`
 * happily produced our order, so a program could print a different line than
 * its own Python projection and nothing would say so.
 *
 * A set of 0 or 1 elements has only one possible rendering, so it prints
 * normally. Recursive, because a set can sit inside a list or a tuple.
 */
export function rendersSetOrder(v: PyVal): boolean {
  if (v.k === 'set') return v.v.size > 1;
  if (v.k === 'list' || v.k === 'tuple') return v.v.some(rendersSetOrder);
  if (v.k === 'dict') return [...v.v.values()].some((e) => rendersSetOrder(e.key) || rendersSetOrder(e.value));
  return false;
}

export function canonicalKeyAt(v: PyVal, site: 'dict key' | 'set element'): string {
  try {
    return canonicalKey(v);
  } catch (e) {
    if (e instanceof PyError && e.pyType === 'TypeError') {
      throw new PyError('TypeError', `cannot use '${typeName(v)}' as a ${site} (${e.message})`);
    }
    throw e;
  }
}

/** Build a dict PyVal from literal entries, in source order. A later entry
 *  with a numerically-equal key UPDATES the value but keeps the first key's
 *  identity for repr — matches Python's own `{1: 'a', 1.0: 'b'}` -> `{1: 'b'}`. */
export const DICT = (entries: { key: PyVal; value: PyVal }[]): PyVal => {
  const m = new Map<string, { key: PyVal; value: PyVal }>();
  for (const e of entries) {
    const ck = canonicalKeyAt(e.key, 'dict key');
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
    const ck = canonicalKeyAt(e, 'set element');
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
    case 'exc_class':
      return 'type'; // `type(ValueError)` is `type`, as for any class
    case 'exception':
      return a.err.pyType;
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
    case 'exc_class':
    case 'exception':
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
    // Tuples concatenate too, and the result is a TUPLE. This was the fifth
    // place a hand-written "which types are sequences" list had left tuple
    // off; the recurring shape is the finding, not the individual omission.
    if (a.k === 'tuple' && b.k === 'tuple') return TUPLE([...a.v, ...b.v]);
    // A failed `+` gets one of TWO messages, decided by the LEFT operand:
    //
    //   "3" + 4      can only concatenate str (not "int") to str
    //   4 + "3"      unsupported operand type(s) for +: 'int' and 'str'
    //
    // The concatenation wording appears whenever the left side is a sequence,
    // because that is the operand whose __add__ ran and refused. Same failure,
    // opposite operands, different sentence — verified across the whole
    // combination table against 3.14 rather than inferred from one example.
    if (a.k === 'str' || a.k === 'list' || a.k === 'tuple') {
      throw new PyError('TypeError', `can only concatenate ${typeName(a)} (not "${typeName(b)}") to ${typeName(a)}`);
    }
    if (b.k === 'str' || b.k === 'list' || b.k === 'tuple') {
      if (!(isNumeric(a) && isNumeric(b)))
        throw new PyError('TypeError', `unsupported operand type(s) for +: '${typeName(a)}' and '${typeName(b)}'`);
    }
  }
  // Set difference. `-` is the only arithmetic operator a set supports here:
  // Python also gives sets `|`, `&` and `^`, which EML has no tokens for, so
  // they are not reachable and are not modelled.
  if (op === '-' && a.k === 'set' && b.k === 'set') {
    return SET([...a.v.entries()].filter(([k]) => !b.v.has(k)).map(([, v]) => v));
  }
  if (op === '*') {
    const rep = seqRepeat(a, b);
    if (rep) return rep;
    // A sequence multiplied by a non-integer has its own message naming the
    // OTHER operand — `can't multiply sequence by non-int of type 'float'` —
    // rather than the generic unsupported-operand form. Sixty cells of the
    // matrix differed only in this sentence.
    const seqSide = a.k === 'str' || a.k === 'list' || a.k === 'tuple' ? b : b.k === 'str' || b.k === 'list' || b.k === 'tuple' ? a : null;
    if (seqSide) {
      throw new PyError('TypeError', `can't multiply sequence by non-int of type '${typeName(seqSide)}'`);
    }
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

/** CPython's `sum()` — NOT a fold of `arith('+')`, which is what this used to be.
 *
 *  Since 3.12 `builtin_sum_impl` (Python/bltinmodule.c) accumulates floats with the
 *  improved Kahan-Babuska algorithm by Neumaier, carrying a compensation term for the
 *  low-order bits each addition discards. A naive fold drifts from it. Both `Σ` and the
 *  `sum()` builtin project onto CPython's `sum(...)`, so a naive fold makes the
 *  interpreter disagree with its own Python projection:
 *
 *      Σ(1 / i, i in [1:1000])   naive fold  7.485470860550343
 *                                CPython     7.485470860550345   (== math.fsum here)
 *
 *  Found by examples/harmonic-series-sigma, the corpus's first float summation — 119
 *  earlier programs summed only integers, where exact bigint accumulation hid it.
 *
 *  The int prefix stays exact (CPython uses a C long with an overflow fallback to
 *  arbitrary precision; bigint is exact throughout, so it agrees). Compensation starts
 *  fresh at the int->float transition, and a non-numeric summand drops to the generic
 *  `arith('+')` path after folding the compensation back in — both as CPython does. */
export function pySum(items: Iterable<PyVal>, start: PyVal): PyVal {
  const it = items[Symbol.iterator]();

  /** Neumaier accumulation from `f0`, consuming the rest of `it`. */
  const floatMode = (f0: number): PyVal => {
    let f = f0;
    let c = 0;
    for (let n = it.next(); !n.done; n = it.next()) {
      const x = n.value;
      if (!isNumeric(x)) {
        // Fold the compensation in before handing off, so nothing is silently dropped.
        if (c !== 0 && Number.isFinite(c)) f += c;
        let acc = arith('+', FLOAT(f), x);
        for (let m = it.next(); !m.done; m = it.next()) acc = arith('+', acc, m.value);
        return acc;
      }
      const v = toNum(x);
      const t = f + v;
      // The larger magnitude keeps its bits; the smaller one's lost bits go to `c`.
      if (Math.abs(f) >= Math.abs(v)) c += f - t + v;
      else c += v - t + f;
      f = t;
    }
    // Guard from CPython: don't let the compensation turn an infinite sum into NaN.
    if (c !== 0 && Number.isFinite(c)) f += c;
    return FLOAT(f);
  };

  if (start.k === 'float') return floatMode(start.v);

  if (start.k === 'int' || start.k === 'bool') {
    let i = toBig(start);
    for (let n = it.next(); !n.done; n = it.next()) {
      const x = n.value;
      if (x.k === 'int' || x.k === 'bool') {
        i += toBig(x);
        continue;
      }
      if (x.k === 'float') return floatMode(Number(i) + x.v);
      let acc = arith('+', INT(i), x);
      for (let m = it.next(); !m.done; m = it.next()) acc = arith('+', acc, m.value);
      return acc;
    }
    return INT(i);
  }

  let acc: PyVal = start;
  for (let n = it.next(); !n.done; n = it.next()) acc = arith('+', acc, n.value);
  return acc;
}

/** Python `seq * int` / `int * seq` repetition; null if not a repeat case. */
function seqRepeat(a: PyVal, b: PyVal): PyVal | null {
  // Tuple was missing here, so `(1, 2) * 3` and `3 * (1, 2)` both raised
  // TypeError where Python repeats. Repetition preserves the TYPE — a
  // repeated tuple is a tuple, not a list — which is why this cannot just
  // funnel everything through LIST().
  const isSeq = (v: PyVal) => v.k === 'str' || v.k === 'list' || v.k === 'tuple';
  const isCount = (v: PyVal) => v.k === 'int' || v.k === 'bool';
  const pair = isSeq(a) && isCount(b) ? ([a, b] as const) : isSeq(b) && isCount(a) ? ([b, a] as const) : null;
  if (!pair) return null;
  const [seq, count] = pair;
  const n = Number(toBig(count));
  const times = n > 0 ? n : 0;
  if (seq.k === 'str') return STR(seq.v.repeat(times));
  const out: PyVal[] = [];
  for (let i = 0; i < times; i++) out.push(...seq.v);
  return seq.k === 'tuple' ? TUPLE(out) : LIST(out);
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
  // SETS DO NOT ORDER — they compare by INCLUSION. `<` is proper subset, `<=`
  // is subset, and the pair is PARTIAL: for {1,2} and {2,3}, all four of
  // `<`, `<=`, `>`, `>=` are False and neither set is "smaller". Sorting by
  // this operator is therefore meaningless, which is exactly the trap: the
  // syntax looks like ordering and is not.
  if (a.k === 'set' && b.k === 'set') {
    const subset = (x: typeof a.v, y: typeof b.v) => [...x.keys()].every((k) => y.has(k));
    const aSubB = subset(a.v, b.v);
    const bSubA = subset(b.v, a.v);
    switch (op) {
      case '<':
        return BOOL(aSubB && !bSubA);
      case '<=':
        return BOOL(aSubB);
      case '>':
        return BOOL(bSubA && !aSubB);
      case '>=':
        return BOOL(bSubA);
    }
  }
  // Ordering: numbers among themselves, strings among themselves, lists lexicographically.
  const c = order(a, b, op);
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

function order(a: PyVal, b: PyVal, op: string = '<'): number {
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
  // Lexicographic, element by element, shorter-is-smaller on a common prefix —
  // for BOTH lists and tuples, which is how Python orders either. Tuple was
  // missing here, so `(1, 5) < (2, 0)` raised TypeError; it is the fourth place
  // a hand-written list of types had left tuple off. A list never compares
  // against a tuple, in Python or here: they are different types.
  if ((a.k === 'list' && b.k === 'list') || (a.k === 'tuple' && b.k === 'tuple')) {
    const n = Math.min(a.v.length, b.v.length);
    for (let i = 0; i < n; i++) {
      const c = order(a.v[i]!, b.v[i]!, op);
      if (c !== 0) return c;
    }
    return a.v.length - b.v.length;
  }
  throw new PyError(
    'TypeError',
    `'${op}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`,
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
  // Exception CLASSES compare by name, so `exc_type == ValueError` works.
  if (a.k === 'exc_class' && b.k === 'exc_class') return a.name === b.name;
  // Exception INSTANCES compare by identity, as in Python: two separately
  // constructed `ValueError('x')` are not equal. Carrying the PyError object
  // makes that a reference check rather than a structural one.
  if (a.k === 'exception' && b.k === 'exception') return a.err === b.err;
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
    // CPython quirk, verified rather than assumed: `set.__contains__` catches
    // the TypeError from an unhashable SET argument and retries it as a
    // frozenset, so `{1, 2} in {1, 2}` answers False instead of raising. A
    // set can therefore be asked about even though it can never be stored.
    // Nothing else gets this rescue — `[1] in {1}` still raises.
    if (element.k === 'set' && collection.k === 'set') {
      return BOOL(collection.v.has(`f:{${[...element.v.keys()].sort().join(',')}}`));
    }
    return BOOL(collection.v.has(canonicalKeyAt(element, collection.k === 'dict' ? 'dict key' : 'set element')));
  }
  throw new PyError('TypeError', `argument of type '${typeName(collection)}' is not a container or iterable`);
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
    case 'exc_class':
      return `<class '${a.name}'>`;
    case 'exception':
      // Python's `str(e)` is the MESSAGE, not the class — `str(ValueError('x'))`
      // is `'x'`. repr() below is where the class name appears.
      return a.err.message;
  }
}

/** Python `repr(value)` — used for list elements (strings get quoted). */
export function pyRepr(a: PyVal): string {
  if (a.k === 'str') return reprStr(a.v);
  // `repr(ValueError('x'))` is `ValueError('x')`, while `str()` of the same is
  // just `x`. This is the one place the two genuinely differ for exceptions.
  if (a.k === 'exception') return `${a.err.pyType}(${reprStr(a.err.message)})`;
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
 * The values Python can iterate, as a flat array — `null` for everything else.
 *
 * `len`, `min`/`max` and `sum` each used to decide this for themselves, and
 * each drew the line somewhere different: `len` accepted str/list/dict/set but
 * not tuple, `sum` accepted only list, and `min`/`max` unwrapped a list but
 * treated any other single argument as a one-element sequence — so `max(5)`
 * returned 5 where Python raises TypeError, and `max("hello")` returned the
 * whole string where Python iterates it and returns 'o'.
 *
 * One definition, so they cannot disagree again. Dict iterates its KEYS, as in
 * Python. Insertion order is preserved for set and dict, which is what CPython
 * does for dict and merely what we do for set — set order is unspecified in
 * Python, so a program whose OUTPUT depends on it is relying on something the
 * language does not promise.
 */
export function iterableItems(v: PyVal): PyVal[] | null {
  switch (v.k) {
    case 'list':
    case 'tuple':
      return v.v;
    case 'set':
      return [...v.v.values()];
    case 'dict':
      return [...v.v.values()].map((e) => e.key);
    case 'str':
      return [...v.v].map((c) => STR(c));
    default:
      return null;
  }
}

/*
 * ── Numeric strings ────────────────────────────────────────────────────────
 *
 * `int(s)` and `float(s)` used to delegate to JS `parseInt`-ish checks and
 * `Number(s)`. JS and Python disagree about what a numeric string IS, so every
 * disagreement was a silent wrong answer rather than an error:
 *
 *   float("")        JS 0        Python ValueError
 *   float("0x10")    JS 16       Python ValueError
 *   float("1_000.5") JS NaN      Python 1000.5      (underscores are legal)
 *   float("inf")     JS NaN      Python inf         (JS wants "Infinity")
 *   int("1_000")     rejected    Python 1000
 *
 * and the one that gave this away — the old guard was
 * `Number.isNaN(n) && !/nan/i.test(s)`, meaning any string CONTAINING "nan"
 * skipped the error path. `float("banana")` returned nan instead of raising.
 *
 * So the grammar is spelled out here instead of borrowed. Underscores are the
 * subtle part: Python allows them only BETWEEN digits, so `1_000` parses and
 * `_1`, `1_`, and `1__0` do not — expressed as `\d(?:_?\d)*`.
 */
const DIGITS = String.raw`\d(?:_?\d)*`;
const PY_INT_RE = new RegExp(`^[+-]?${DIGITS}$`);
const PY_FLOAT_RE = new RegExp(
  `^[+-]?(?:(?:${DIGITS}(?:\\.(?:${DIGITS})?)?|\\.${DIGITS})(?:[eE][+-]?${DIGITS})?)$`,
);
const PY_SPECIAL_RE = /^[+-]?(?:inf(?:inity)?|nan)$/i;

/** `int(s)` for base 10 — `null` when Python would raise ValueError. */
export function parsePyInt(s: string): bigint | null {
  const t = s.trim();
  if (!PY_INT_RE.test(t)) return null;
  return BigInt(t.replace(/_/g, ''));
}

/** `float(s)` — `null` when Python would raise ValueError. */
export function parsePyFloat(s: string): number | null {
  const t = s.trim();
  if (PY_SPECIAL_RE.test(t)) {
    const neg = t.startsWith('-');
    if (/nan$/i.test(t)) return NaN;
    return neg ? -Infinity : Infinity;
  }
  if (!PY_FLOAT_RE.test(t)) return null;
  return Number(t.replace(/_/g, ''));
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
 * `hash((1,[2]))` raises `TypeError`). That recursive rule is now implemented,
 * because `(row, col)` as a dict key is the single most common reason to reach
 * for a tuple and it used to fail.
 *
 * DERIVED from `canonicalKey` rather than restated. This used to be a second
 * hand-written list of kinds that had to agree with canonicalKey's, and the
 * two disagreeing is precisely the bug shape this project keeps finding — the
 * same set enumerated twice, drifting apart. Asking the one authority whether
 * it can produce a key makes disagreement impossible rather than unlikely.
 *
 * Exception classes and instances ARE hashable in Python, but canonicalKey has
 * no identity-stable form for them, so it declines and they are reported
 * unhashable here: a loud TypeError instead of a key that would silently merge
 * distinct objects.
 */
export function isHashable(v: PyVal): boolean {
  try {
    canonicalKey(v);
    return true;
  } catch {
    return false;
  }
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
/** Pad `body` to `width`, honouring the '-' (left-justify) and '0' (zero-fill)
 *  flags. Zero-fill goes AFTER any sign, which is why the sign is passed
 *  separately rather than already glued onto the body. */
function padded(sign: string, body: string, width: number, left: boolean, zero: boolean): string {
  const total = sign.length + body.length;
  if (total >= width) return sign + body;
  const fill = width - total;
  if (left) return sign + body + ' '.repeat(fill); // '-' beats '0' in CPython
  if (zero) return sign + '0'.repeat(fill) + body;
  return ' '.repeat(fill) + sign + body;
}

/** CPython's exponent form is at least two digits (`1e+05`, not `1e+5`). */
function fixExponent(s: string): string {
  return s.replace(/e([+-])(\d)$/, 'e$10$2');
}

/**
 * Decompose a finite non-negative double into exact integers `mant * 2**pow2`.
 * Reading the IEEE-754 bits is the only way to get the EXACT value: the decimal
 * you see in source (`2.675`) is a different number from the double it denotes
 * (2.674999999999999822...), and every rounding decision below depends on the
 * latter.
 */
function decompose(x: number): { mant: bigint; pow2: number } {
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, x);
  const bits = buf.getBigUint64(0);
  const exp = Number((bits >> 52n) & 0x7ffn);
  const frac = bits & 0xfffffffffffffn;
  return exp === 0
    ? { mant: frac, pow2: -1074 } // subnormal: no implicit leading bit
    : { mant: frac + (1n << 52n), pow2: exp - 1075 };
}

/**
 * `round(|x| * 10**places)` as an exact integer, breaking ties to even.
 *
 * C's printf — and therefore CPython's `%f`/`%e`/`%g` — rounds the exact binary
 * value half-to-even. JavaScript has neither primitive:
 *   - `toFixed` reads the exact value but rounds ties AWAY from zero, so
 *     `(2.5).toFixed(0)` is '3' where CPython's `%.0f` is '2'.
 *   - `Intl` with roundingMode 'halfEven' breaks ties correctly but rounds the
 *     SHORTEST DECIMAL rather than the exact value, so 2.675 becomes '2.68'
 *     where CPython gives '2.67'.
 * Neither is usable, so the arithmetic is done exactly in BigInt instead.
 */
function scaledRoundHalfEven(x: number, places: number): bigint {
  const { mant, pow2 } = decompose(x);
  // |x| * 10**places  ==  num / den, both exact integers.
  let num = mant * 10n ** BigInt(Math.max(places, 0));
  let den = 1n;
  if (places < 0) den *= 10n ** BigInt(-places);
  if (pow2 >= 0) num <<= BigInt(pow2);
  else den <<= BigInt(-pow2);

  const q = num / den;
  const rem = num % den;
  const twice = rem * 2n;
  if (twice > den) return q + 1n;
  if (twice < den) return q;
  return q % 2n === 0n ? q : q + 1n; // exact tie -> nearest even
}

/** `|x|` with exactly `places` digits after the point, rounded like CPython. */
function fixedExact(x: number, places: number): string {
  const digits = scaledRoundHalfEven(x, places).toString();
  if (places === 0) return digits;
  const padded0 = digits.padStart(places + 1, '0');
  return padded0.slice(0, padded0.length - places) + '.' + padded0.slice(padded0.length - places);
}

/** `|x|` in exponent form with `places` digits after the point. */
function expExact(x: number, places: number): string {
  if (x === 0) return fixedExact(0, places) + 'e+00';
  let e = Math.floor(Math.log10(x));
  // log10 is not exact at powers of ten; settle the exponent by construction.
  for (let guard = 0; guard < 4; guard++) {
    const d = scaledRoundHalfEven(x, places - e);
    const want = 10n ** BigInt(places);
    if (d < want) e -= 1;
    else if (d >= want * 10n) e += 1;
    else {
      const s = d.toString();
      const mantissa = places === 0 ? s : s.slice(0, 1) + '.' + s.slice(1);
      const sign = e < 0 ? '-' : '+';
      return mantissa + 'e' + sign + String(Math.abs(e)).padStart(2, '0');
    }
  }
  return fixExponent(x.toExponential(places));
}

/**
 * `%`-formatting, the real grammar: `%[flags][width][.precision][length]type`.
 *
 * This used to accept ONLY bare `%s`, `%d`, `%f` and `%%`, and threw
 * `ValueError: unsupported format character` for everything else — so
 * `"%.2f" % (x,)` CRASHED in the interpreter while running fine as Python.
 * That is not an exotic corner: `%.2f` is how you format money, and `%5d` is
 * how you line up a column. Any such program was correct as its own Python
 * projection and dead in the browser.
 *
 * Behaviour here is pinned against real CPython by a generated matrix of
 * specs x values in tests/percent-format.test.ts, rather than reasoned out
 * from the docs — several details (zero-fill sitting after the sign, '-'
 * overriding '0', two-digit exponents, `%g` stripping trailing zeros unless
 * '#') are easy to get subtly wrong and only a diff catches them.
 *
 * `%(name)s` mapping keys are deliberately NOT supported: they require a dict
 * right-hand side, and EML's `%` operator only ever passes a tuple or a single
 * value. CPython raises TypeError for that combination too.
 */
export function percentFormat(fmt: string, args: PyVal[], mappingLike = false): string {
  let argIdx = 0;
  const nextArg = (): PyVal => {
    if (argIdx >= args.length) throw new PyError('TypeError', 'not enough arguments for format string');
    return args[argIdx++]!;
  };
  const isDigit = (ch: string | undefined): boolean => ch !== undefined && ch >= '0' && ch <= '9';
  const asNumber = (v: PyVal, spec: string): number => {
    if (!isNumeric(v)) throw new PyError('TypeError', `%${spec} format: a real number is required, not ${typeName(v)}`);
    return toNum(v);
  };
  const asInt = (v: PyVal, spec: string): bigint => {
    if (!isNumeric(v)) throw new PyError('TypeError', `%${spec} format: a real number is required, not ${typeName(v)}`);
    return isFloaty(v) ? BigInt(Math.trunc(toNum(v))) : toBig(v);
  };

  let out = '';
  for (let i = 0; i < fmt.length; i++) {
    if (fmt[i] !== '%') {
      out += fmt[i];
      continue;
    }
    i++;
    if (fmt[i] === undefined) throw new PyError('ValueError', 'incomplete format');
    if (fmt[i] === '%') {
      out += '%';
      continue;
    }
    if (fmt[i] === '(') throw new PyError('TypeError', 'format requires a mapping');

    let left = false;
    let zero = false;
    let plus = false;
    let space = false;
    let alt = false;
    for (;;) {
      const f = fmt[i];
      if (f === '-') left = true;
      else if (f === '0') zero = true;
      else if (f === '+') plus = true;
      else if (f === ' ') space = true;
      else if (f === '#') alt = true;
      else break;
      i++;
    }

    let width = 0;
    if (fmt[i] === '*') {
      i++;
      width = Number(asInt(nextArg(), '*'));
      if (width < 0) {
        left = true;
        width = -width;
      }
    } else {
      while (isDigit(fmt[i])) width = width * 10 + Number(fmt[i++]);
    }

    let precision = -1;
    if (fmt[i] === '.') {
      i++;
      precision = 0;
      if (fmt[i] === '*') {
        i++;
        precision = Number(asInt(nextArg(), '*'));
      } else {
        while (isDigit(fmt[i])) precision = precision * 10 + Number(fmt[i++]);
      }
    }
    while (fmt[i] === 'h' || fmt[i] === 'l' || fmt[i] === 'L') i++; // ignored, as in CPython

    const spec = fmt[i];
    if (spec === undefined) throw new PyError('ValueError', 'incomplete format');
    if (spec === '%') {
      out += '%';
      continue;
    }

    const val = nextArg();
    // A numeric sign is built separately from the digits so zero-fill can go
    // between them ('%05d' % -3 is '-0003', not '000-3').
    const signFor = (negative: boolean): string => (negative ? '-' : plus ? '+' : space ? ' ' : '');

    if (spec === 's' || spec === 'r' || spec === 'a') {
      let body = spec === 's' ? pyStr(val) : pyRepr(val);
      if (precision >= 0) body = body.slice(0, precision);
      out += padded('', body, width, left, false); // '0' never zero-fills a string
    } else if (spec === 'd' || spec === 'i' || spec === 'u' || spec === 'x' || spec === 'X' || spec === 'o') {
      const n = asInt(val, spec);
      const neg = n < 0n;
      const radix = spec === 'o' ? 8 : spec === 'x' || spec === 'X' ? 16 : 10;
      let body = (neg ? -n : n).toString(radix);
      if (spec === 'X') body = body.toUpperCase();
      // For integers `.N` is a MINIMUM DIGIT COUNT, not a truncation — and it
      // suppresses the '0' flag, since it already zero-fills. Missing this made
      // `"%.3d" % 0` print '0' where CPython prints '000'.
      if (precision >= 0 && body.length < precision) body = '0'.repeat(precision - body.length) + body;
      if (alt && radix !== 10) body = (spec === 'o' ? '0o' : spec === 'x' ? '0x' : '0X') + body;
      out += padded(signFor(neg), body, width, left, zero);
    } else if (spec === 'f' || spec === 'F' || spec === 'e' || spec === 'E' || spec === 'g' || spec === 'G') {
      const x = asNumber(val, spec);
      const neg = x < 0 || Object.is(x, -0);
      const mag = Math.abs(x);
      const p = precision < 0 ? 6 : precision;
      let body: string;
      if (!Number.isFinite(mag)) {
        body = Number.isNaN(mag) ? 'nan' : 'inf';
        if (spec === 'F' || spec === 'E' || spec === 'G') body = body.toUpperCase();
        zero = false; // CPython never zero-pads inf/nan
      } else if (spec === 'f' || spec === 'F') {
        body = fixedExact(mag, p);
      } else if (spec === 'e' || spec === 'E') {
        body = expExact(mag, p);
        if (spec === 'E') body = body.toUpperCase();
      } else {
        // %g: `p` significant digits, exponent form outside [-4, p), and
        // trailing zeros stripped unless '#' asks to keep them. The exponent
        // has to be read back from the ROUNDED value, since rounding can carry
        // (9.99 at 2 significant digits becomes 1.0e+01, not 10).
        const pg = p === 0 ? 1 : p;
        const rounded = expExact(mag, pg - 1);
        const exp = mag === 0 ? 0 : Number(rounded.slice(rounded.indexOf('e') + 1));
        if (exp < -4 || exp >= pg) {
          body = rounded;
          if (!alt) body = body.replace(/\.?0+e/, 'e');
        } else {
          body = fixedExact(mag, Math.max(0, pg - 1 - exp));
          if (!alt && body.indexOf('.') >= 0) body = body.replace(/\.?0+$/, '');
        }
        if (spec === 'G') body = body.toUpperCase();
      }
      // '#' on a float conversion keeps the decimal point even when the
      // precision left no digits after it: `"%#.0f" % 0` is '0.', not '0'.
      if (alt && Number.isFinite(mag) && body.indexOf('.') < 0) {
        const e = body.search(/[eE]/);
        body = e < 0 ? body + '.' : body.slice(0, e) + '.' + body.slice(e);
      }
      out += padded(signFor(neg), body, width, left, zero);
    } else if (spec === 'c') {
      let body: string;
      if (val.k === 'str') {
        if ([...val.v].length !== 1) throw new PyError('TypeError', '%c requires int or char');
        body = val.v;
      } else {
        body = String.fromCodePoint(Number(asInt(val, 'c')));
      }
      out += padded('', body, width, left, false);
    } else {
      throw new PyError('ValueError', `unsupported format character '${spec}' (0x${spec.charCodeAt(0).toString(16)})`);
    }
  }
  // Leftover arguments are an error only when the right operand was NOT
  // mapping-like — see the caller for why a list counts as mapping-like.
  if (!mappingLike && argIdx < args.length) {
    throw new PyError('TypeError', 'not all arguments converted during string formatting');
  }
  return out;
}
