import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';
import { findAnomalies } from '@eml/trace';

/**
 * THE EXECUTION-TRUTH GATE. The browser interpreter (@eml/interp) is only sound
 * if it computes exactly what the transpiled Python computes. This suite runs
 * the SAME program through both and fails on any stdout divergence — so the
 * EML Workbench's in-browser "run + trace" can be trusted as execution truth, not
 * decoration. Programs the interpreter intentionally cannot reproduce (numpy /
 * temporal) must report `unsupported` rather than silently produce a wrong value.
 */

const here = dirname(fileURLToPath(import.meta.url));
const examplesDir = join(here, '..', 'examples');
const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

/** Examples the interpreter legitimately cannot run in-browser (numpy/temporal). */
const UNSUPPORTED_EXAMPLES = new Set(['phase3-temporal/wait.eml']);

function resolvePython(): string | null {
  const cands = process.env.EML_PYTHON
    ? [process.env.EML_PYTHON]
    : process.platform === 'win32'
      ? ['python', 'py', 'python3']
      : ['python3', 'python'];
  for (const c of cands) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return c;
  }
  return null;
}
const PYTHON = resolvePython();

function pythonStdout(py: string): string {
  const r = spawnSync(PYTHON!, ['-c', py], { encoding: 'utf8' });
  if (r.error) throw r.error;
  expect(r.status, `python exited non-zero:\n${r.stderr}`).toBe(0);
  // Python's text-mode stdout uses '\r\n' on Windows; the interpreter emits the
  // logical '\n'. Normalize so the gate compares program semantics, not console
  // line-ending conventions.
  return r.stdout.replace(/\r\n/g, '\n');
}

/** Recursively collect every .eml under examples/. */
function allExamples(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...allExamples(p));
    else if (ent.name.endsWith('.eml')) out.push(p);
  }
  return out;
}

/** Inline cases that probe Python value-model corners (int/float/list/str/bool). */
const CASES: Array<[string, string]> = [
  ['init + output', 'x^+100\nx^0'],
  ['augmented add/mul', 'x^+100\nx^+10\nx^*2\nx^0'],
  ['augmented sub', 'x^+100\nx^-30\nx^0'],
  ['true division is float', 'a^+10\nb^+3\na^/b\na^0'],
  ['division grouping 25.0', 'x^+10\ny^+2\nz^+5\nx / (y / z) => r\nr^0'],
  ['subtraction grouping 9', 'x^+10\ny^+3\nz^+2\nx - (y - z) => r\nr^0'],
  ['power stays int', 'x^+2\nx^3 => r\nr^0'],
  ['big int precision', 'Σ(i^2, i in [1:1000]) => r\nr^0'],
  ['conditional true', 'x^+50\nx > 40 ? 1 : 0 => y\ny^0'],
  ['conditional false', 'x^+10\nx > 40 ? 1 : 0 => y\ny^0'],
  ['membership over range -> True', 'x^+50\nx in [1:100] => r\nr^0'],
  ['membership over range -> False', 'x^+500\nx in [1:100] => r\nr^0'],
  ['list literal prints', 'list^+[1, 2, 3]\nlist^0'],
  ['sum over range', 'Σ(i, i in [1:10]) => r\nr^0'],
  ['cold function call', '@cold\ndef sq(N):\n    Σ(i^2, i in [1:N]) => r\n    return r\n\nsq(100) => t\nt^0'],
  ['cold function called twice (cache)', '@cold\ndef sq(N):\n    Σ(i^2, i in [1:N]) => r\n    return r\n\nsq(50) => a\nsq(50) => b\na^0\nb^0'],
  ['hot function with io', '@hot\ndef greet(n):\n    n^0\n    return n\n\ngreet(7)'],
  // float repr boundaries (CPython switches to sci notation at exp10 >= 16 / < -4)
  ['float >= 1e16 -> sci', 'a^+10000000000000000\nb^+1\na^/b\na^0'],
  ['float 1e17 -> sci', 'a^+100000000000000000\nb^+1\na^/b\na^0'],
  ['float just below 1e16 -> .0', 'a^+9999999999999998\nb^+1\na^/b\na^0'],
  ['small float < 1e-4 -> sci', 'x^+1\ny^+100000\nx^/y\nx^0'],
  ['small float at 1e-4 -> fixed', 'x^+1\ny^+10000\nx^/y\nx^0'],
  // exact int-vs-float comparison (no precision collapse)
  ['large int != float', 'a^+9007199254740993\nb^+9007199254740992.0\na == b ? 1 : 0 => c\nc^0'],
  ['large int > float', 'a^+9007199254740993\nb^+9007199254740992.0\na > b ? 1 : 0 => c\nc^0'],
  // builtins
  ['abs of negative', 'abs(0 - 5) => r\nr^0'],
  ['abs of bool', 'abs(2 > 1) => r\nr^0'],
  ['len of list', 'list^+[1, 2, 3, 4]\nlen(list) => r\nr^0'],
  ['min over args (tie keeps first)', 'min(1, 1.0) => r\nr^0'],
  ['max over list', 'list^+[4, 9, 2]\nmax(list) => r\nr^0'],
  ['sum builtin over list', 'list^+[1, 2, 3]\nsum(list) => r\nr^0'],
  // strings
  ['str concat', 'a^+"foo"\nb^+"bar"\na + b => c\nc^0'],
  ['str membership', 'a^+"hello"\n"ell" in a ? 1 : 0 => r\nr^0'],
  ['repr escapes control char in list', 'list^+["\\0"]\nlist^0'],
  // bool as int subtype in a range bound
  ['bool range bound', 'Σ(i, i in [(2 > 1):3]) => r\nr^0'],
  // recursion
  ['recursive factorial', 'def fact(n):\n    n <= 1 ? 1 : n * fact(n - 1) => r\n    return r\n\nfact(5) => x\nx^0'],
  // lexical closures + mutual recursion (Phase 5 follow-up)
  ['nested function closure', 'def g(a):\n    def h():\n        return a\n    h() => r\n    return r\n\ng(7) => out\nout^0'],
  ['mutual recursion', 'def is_even(n):\n    n == 0 ? 1 : is_odd(n - 1) => r\n    return r\n\ndef is_odd(n):\n    n == 0 ? 0 : is_even(n - 1) => r\n    return r\n\nis_even(4) => x\nx^0'],
  // Phase 6: control flow (if/elif/else, while, for...in)
  ['if/elif/else branch selection', 'x^+15\nif x > 20:\n    y^+1\nelif x > 10:\n    y^+2\nelse:\n    y^+3\ny^0'],
  ['while loop accumulator', 'n^+5\ntotal^+0\nwhile n > 0:\n    total + n => total\n    n - 1 => n\ntotal^0'],
  ['for...in over a range', 'N^+5\ntotal^+0\nfor i in [1:N]:\n    total + i^2 => total\ntotal^0'],
  ['for with an if inside', 'count^+0\nfor i in [1:10]:\n    if i > 5:\n        count + 1 => count\ncount^0'],
  ['fibonacci via while', 'a^+0\nb^+1\nn^+10\nwhile n > 0:\n    a + b => c\n    b => a\n    c => b\n    n - 1 => n\na^0'],
  ['for-loop target leaks its final value after the loop (Python semantics)', 'for i in [1:3]:\n    i^0\ni^0'],
  ['return inside a nested if/while unwinds correctly', 'def f(n):\n    while n > 0:\n        if n == 3:\n            return n\n        n - 1 => n\n    return 0 - 1\n\nf(5) => r\nr^0'],
  // Phase 7a: break / continue
  ['break exits a while loop early', 'n^+0\ntotal^+0\nwhile n < 100:\n    n + 1 => n\n    if n > 5:\n        break\n    total + n => total\ntotal^0'],
  ['continue skips the rest of a for-loop iteration', 'total^+0\nfor i in [1:10]:\n    if i > 5:\n        continue\n    total + i => total\ntotal^0'],
  ['break in an inner loop does not affect an outer loop', 'total^+0\nfor i in [1:3]:\n    for j in [1:5]:\n        break\n        total + 1 => total\n    total + 1 => total\ntotal^0'],
  // Phase 7d: try/except/finally + raise
  ['try/except catches ZeroDivisionError, finally always runs', 'result^+0\ntry:\n    10 / 0 => ignored\nexcept ZeroDivisionError:\n    result^-1\nfinally:\n    result + 100 => result\nresult^0'],
  ['raise + except-as binds the message (print(e) matches str(e))', 'def validate(n):\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    return n\n\ntry:\n    validate(0 - 5) => r\n    r^0\nexcept ValueError as e:\n    e^0'],
  ['finally runs even when no exception occurs', 'log^+0\ntry:\n    1 + 1 => x\nexcept ValueError:\n    log^+1\nfinally:\n    log^+2\nx^0\nlog^0'],
  // Phase 7e: class (minimal viable OOP)
  [
    'class construction + methods + self.attr (arrow-form self.value assignment)',
    'class Counter:\n    def __init__(self, start):\n        start => self.value\n    def increment(self):\n        self.value + 1 => self.value\n    def get(self):\n        return self.value\n\nCounter(0) => c\nc.increment()\nc.increment()\nc.get() => r\nr^0',
  ],
  [
    'two instances of the same class carry independent state',
    'class Counter:\n    def __init__(self, start):\n        start => self.value\n    def increment(self):\n        self.value + 1 => self.value\n\nCounter(0) => a\nCounter(100) => b\na.increment()\nb.increment()\nb.increment()\na.value => x\nb.value => y\nx^0\ny^0',
  ],
  [
    'two classes with a same-named method do not collide at runtime',
    'class Dog:\n    def __init__(self):\n        "woof" => self.sound\n    def speak(self):\n        return self.sound\n\nclass Cat:\n    def __init__(self):\n        "meow" => self.sound\n    def speak(self):\n        return self.sound\n\nDog() => d\nCat() => cat\nd.speak() => a\ncat.speak() => b\na^0\nb^0',
  ],
];

describe.skipIf(!PYTHON)('interpreter ≡ python (execution-truth gate)', () => {
  for (const [name, src] of CASES) {
    it(`case: ${name}`, () => {
      const { python, ok } = transpileEmlToPython(src);
      expect(ok).toBe(true);
      const expected = pythonStdout(python);
      const r = interpret(src, { now: FIXED_CLOCK });
      expect(r.error, r.error ? `${r.error.type}: ${r.error.message}` : '').toBeUndefined();
      expect(r.ok).toBe(true);
      expect(r.output).toBe(expected);
    });
  }

  for (const file of allExamples(examplesDir)) {
    const src = readFileSync(file, 'utf8');
    const rel = file.slice(examplesDir.length + 1).replace(/\\/g, '/');
    it(`example: ${rel}`, () => {
      const { python, ok } = transpileEmlToPython(src);
      expect(ok, `example did not transpile: ${rel}`).toBe(true);
      const r = interpret(src, { now: FIXED_CLOCK });
      // Deferral must happen IFF the example is intentionally unsupported — a
      // spurious 'unsupported' on a runnable demo must fail, not pass trivially.
      expect(r.unsupported.length > 0, `deferral mismatch for ${rel}`).toBe(UNSUPPORTED_EXAMPLES.has(rel));
      if (UNSUPPORTED_EXAMPLES.has(rel)) {
        expect(r.ok).toBe(false);
        expect(r.output).toBe('');
        return;
      }
      expect(r.output).toBe(pythonStdout(python));
    });
  }
});

describe('interpreter defers unsupported constructs (no fabricated output)', () => {
  it('numpy matrix + transpose -> unsupported, not a wrong value', () => {
    const r = interpret('<M>([[1, 2], [3, 4]]) => m\nm^T => t\nt^0', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.output).toBe('');
    expect(r.unsupported.join(' ')).toMatch(/matrix|transpose/);
    expect(r.events.some((e) => e.type === 'eml:unsupported')).toBe(true);
  });

  it('temporal loop (await/async) -> unsupported', () => {
    const src = readFileSync(join(examplesDir, 'phase3-temporal', 'wait.eml'), 'utf8');
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.unsupported.length).toBeGreaterThan(0);
  });

  it('a transpile error surfaces, not a crash', () => {
    const r = interpret('x in [1.5:3]\nx^0', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.diagnostics.length).toBeGreaterThan(0);
  });

  it('negative base ** non-integer exponent -> complex -> unsupported (not "nan")', () => {
    const r = interpret('(0 - 8)^0.5 => r\nr^0', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.output).toBe('');
    expect(r.unsupported.join(' ')).toMatch(/complex/);
  });

});

describe('lexical closures (nested functions)', () => {
  const NESTED = 'def g(a):\n    def h():\n        return a\n    h() => r\n    return r\n\ng(7) => out\nout^0';

  it('a nested function closes over its enclosing scope', () => {
    const r = interpret(NESTED, { now: FIXED_CLOCK });
    expect(r.error, r.error ? `${r.error.type}: ${r.error.message}` : '').toBeUndefined();
    expect(r.ok).toBe(true);
    expect(r.output).toBe('7\n');
  });

  it('a nested function does not leak to module scope', () => {
    // h is local to g; calling it at module scope is a NameError (no global leak).
    const r = interpret(NESTED + '\nh() => z\nz^0', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('NameError');
  });

  it('calling a non-function value raises TypeError', () => {
    const r = interpret('x^+5\nx() => r\nr^0', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('TypeError');
  });
});

describe('interpreter matches Python error semantics (no fabricated output)', () => {
  it('reading a function-local before assignment is UnboundLocalError (not the module global)', () => {
    // Python: `x` is assigned in f, so it is local for the whole body; the first
    // read raises UnboundLocalError rather than seeing the module `x = 10`.
    const src = 'x^+10\n@hot\ndef f():\n    x^0\n    x^+5\n    x^0\n\nf()';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('UnboundLocalError');
  });

  it('@cold called with an unhashable (list) arg raises TypeError, like functools.cache', () => {
    const src = '@cold\ndef f(xs):\n    return xs\n\nf([1, 2, 3]) => r\nr^0';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toMatch(/unhashable/);
  });
});

describe.skipIf(!PYTHON)('runtime errors match Python (exception class + non-zero exit)', () => {
  const ERROR_CASES: Array<[string, string, string]> = [
    ['NameError', 'undefined_var + 1 => r\nr^0', 'NameError'],
    ['ZeroDivisionError', 'a^+1\nb^+0\na^/b\na^0', 'ZeroDivisionError'],
    ['ValueError from int()', 'int("abc") => r\nr^0', 'ValueError'],
    ['TypeError from abs(str)', 'abs("x") => r\nr^0', 'TypeError'],
    ['KeyError from a missing dict key', 'd^+{}\nd["missing"] => x\nx^0', 'KeyError'],
    ['IndexError from an out-of-range list subscript', 'lst^+[1,2,3]\nlst[10] => x\nx^0', 'IndexError'],
    ['TypeError from string item assignment (immutable)', 's^+"hi"\n5 => s[0]', 'TypeError'],
    [
      'an unmatched except type lets the exception propagate uncaught',
      'try:\n    10 / 0 => x\nexcept ValueError:\n    x^+0\nx^0',
      'ZeroDivisionError',
    ],
    [
      'AttributeError from a missing instance attribute',
      'class C:\n    def __init__(self):\n        1 => self.x\n\nC() => c\nc.y => r\nr^0',
      'AttributeError',
    ],
  ];
  for (const [name, src, type] of ERROR_CASES) {
    it(`${name}`, () => {
      const r = interpret(src, { now: FIXED_CLOCK });
      expect(r.ok).toBe(false);
      expect(r.error?.type).toBe(type);
      const { python } = transpileEmlToPython(src);
      const py = spawnSync(PYTHON!, ['-c', python], { encoding: 'utf8' });
      expect(py.status, `python should fault for ${name}`).not.toBe(0);
      expect(py.stderr).toContain(type);
    });
  }
});

describe('trace shape (phosphor-jsonl-v1)', () => {
  it('a clean run brackets output with run:start / run:done and no anomalies', () => {
    const r = interpret('N^+100\nΣ(i^2, i in [1:N]) => r\nr^0', { now: FIXED_CLOCK });
    const types = r.events.map((e) => e.type);
    expect(types[0]).toBe('eml:run:start');
    expect(types).toContain('eml:assign');
    expect(types).toContain('eml:sum');
    expect(types).toContain('eml:output');
    expect(types.at(-1)).toBe('eml:run:done');
    expect(findAnomalies(r.events)).toHaveLength(0);
    expect(r.events.every((e) => e.proto === 'phosphor-jsonl-v1' && e.stream === 'eml')).toBe(true);
  });

  it('@cold caching: second identical call hits the cache (body runs once)', () => {
    const src = '@cold\ndef sq(N):\n    Σ(i^2, i in [1:N]) => r\n    return r\n\nsq(50) => a\nsq(50) => b\na^0\nb^0';
    const r = interpret(src, { now: FIXED_CLOCK });
    const types = r.events.map((e) => e.type);
    expect(types.filter((t) => t === 'eml:cache:miss')).toHaveLength(1);
    expect(types.filter((t) => t === 'eml:cache:hit')).toHaveLength(1);
    // The summation (body) executed exactly once despite two calls.
    expect(types.filter((t) => t === 'eml:sum')).toHaveLength(1);
    expect(r.output).toBe('42925\n42925\n'); // sum(i^2, 1..50) = 50·51·101/6

  });

  it('a runtime fault emits eml:run:error and is flagged as an anomaly', () => {
    const r = interpret('a^+1\nb^+0\na^/b\na^0', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('ZeroDivisionError');
    expect(findAnomalies(r.events).some((e) => e.type === 'eml:run:error')).toBe(true);
  });

  it('a deferred (unsupported) run ends in run:incomplete and is NOT an anomaly', () => {
    const r = interpret('<M>([[1, 2], [3, 4]]) => m\nm^T => t\nt^0', { now: FIXED_CLOCK });
    const types = r.events.map((e) => e.type);
    expect(types).toContain('eml:unsupported');
    expect(types.at(-1)).toBe('eml:run:incomplete');
    expect(types).not.toContain('eml:run:done');
    // Deferral is not a bug — the anomaly scan must stay clean for it.
    expect(findAnomalies(r.events)).toHaveLength(0);
  });
});
