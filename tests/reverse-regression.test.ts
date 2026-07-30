import { describe, it, expect } from 'vitest';
import { transpilePythonToEml, roundTripFromPython } from '@eml/transpiler-eml';
import { transpileEmlToPython } from '@eml/transpiler-python';

/**
 * Regression tests for the 9 issues from the reverse-direction adversarial
 * review. The reverse path must FAIL LOUDLY (ok:false) on constructs EML cannot
 * express, never emit ok:true with malformed EML.
 */

describe('reverse path rejects inexpressible constructs', () => {
  it('power with a non-numeric exponent (a ** b)', () => {
    expect(transpilePythonToEml('y = a ** b').ok).toBe(false);
  });
  it('power with exponent 0 (collides with ^0 output)', () => {
    expect(transpilePythonToEml('y = x ** 0').ok).toBe(false);
  });
  it('augmented assignment with a compound RHS', () => {
    expect(transpilePythonToEml('x += a + b').ok).toBe(false);
  });
  it('standalone += on an undeclared name', () => {
    expect(transpilePythonToEml('x += 10').ok).toBe(false);
  });
});

describe('reverse path handles what it should', () => {
  it('power with a numeric exponent round-trips', () => {
    expect(transpilePythonToEml('y = x ** 2').ok).toBe(true);
    expect(roundTripFromPython('y = x ** 2').ok).toBe(true);
  });
  it('augmented -= and *= on undeclared are fine (no declare ambiguity)', () => {
    expect(transpilePythonToEml('x -= 5').ok).toBe(true);
    expect(transpilePythonToEml('x *= 2').ok).toBe(true);
  });
});

describe('negative number literals (now supported both ways)', () => {
  it('x = -5 round-trips', () => {
    expect(transpilePythonToEml('x = -5').eml.trim()).toBe('x^+-5');
    expect(transpileEmlToPython('x^+-5').python).toBe('x = -5\n');
    expect(roundTripFromPython('x = -5').ok).toBe(true);
  });
  it('a * -1 round-trips', () => {
    expect(roundTripFromPython('y = a * -1').ok).toBe(true);
  });
});

describe('string escapes survive round-trip (validator soundness)', () => {
  it('newline escape is preserved, not corrupted to a literal n', () => {
    const rt = roundTripFromPython('x = "a\\nb"\n');
    expect(rt.ok).toBe(true);
    // the round-tripped Python keeps the escape, not the bare letter n
    expect(rt.steps['python']).toContain('\\n');
    expect(rt.steps['python']).not.toContain('anb');
  });
});

describe('range canonicalization', () => {
  it('range(1, n) round-trips (n-1 inclusive folds back)', () => {
    expect(roundTripFromPython('i in range(1, n)').ok).toBe(true);
  });
});

describe('round-trip diagnostics', () => {
  it('reports a reverse failure clearly for inexpressible input', () => {
    const rt = roundTripFromPython('y = a ** b');
    expect(rt.ok).toBe(false);
    expect(rt.message.toLowerCase()).toContain('failed');
  });
});

describe('a name bound by a for loop is still bound after it', () => {
  /**
   * `for n in xs:` leaves `n` bound in Python, so a later `n = 0` is a
   * REASSIGNMENT. The reverse emitter already knew not to use the `^+` sigil
   * for a reassignment — it just never recorded loop targets as bound, so it
   * emitted `n^+0`, which the forward emitter renders as `n += 0` exactly
   * because the name is declared. The round trip therefore turned `n = 0`
   * into `n = n + 0`: a silent semantic change, not a cosmetic one.
   *
   * Found by examples/comprehension-pipeline, whose whole subject is which
   * names leak out of which construct.
   */
  const SRC = 'xs = [1, 2, 3]\nacc = []\nfor n in xs:\n    acc = acc + [n]\nn = 0\nprint(str(n))\n';

  it('round-trips to a fixpoint', () => {
    const rt = roundTripFromPython(SRC);
    expect(rt.ok, rt.message).toBe(true);
  });

  it('emits a plain assignment, not the augmenting sigil', () => {
    const eml = transpilePythonToEml(SRC);
    expect(eml.ok).toBe(true);
    expect(eml.eml).toContain('0 => n');
    expect(eml.eml).not.toContain('n^+0');
  });
});

describe('reverse regression: sum() is not always Sigma', () => {
  /**
   * `sum(` is ambiguous in the Python projection. `sum(x for i in range(n))`
   * is EML's Sigma operator; `sum(xs)` and `sum(xs, start)` are plain builtin
   * calls. The reverse parser assumed the first unconditionally and required a
   * `for`, so EVERY ordinary sum() call failed to reverse-parse with
   * "Expected 'for'".
   *
   * Nothing noticed because sum() as a builtin was called by zero of the 149
   * corpus programs — the Sigma form was covered, the builtin form was not.
   * It now decides by scanning for a top-level `for` inside the parentheses.
   */
  it('reverse-parses an ordinary sum() call', () => {
    for (const src of ['x = sum([])\n', 'x = sum([1, 2])\n', 'x = sum([1, 2], 10)\n', 'x = sum((1, 2))\n']) {
      const rt = roundTripFromPython(src);
      expect(rt.ok, `${src.trim()} -> ${rt.message}`).toBe(true);
    }
  });

  it('still recognizes the Sigma form', () => {
    const rt = roundTripFromPython('total = sum(i * i for i in range(1, 11))\n');
    expect(rt.ok, rt.message).toBe(true);
    const eml = transpilePythonToEml('total = sum(i * i for i in range(1, 11))\n');
    expect(eml.eml).toContain('Σ');
  });

  it('handles both forms in one expression', () => {
    const rt = roundTripFromPython('x = sum([1, 2]) + sum(i for i in range(0, 3))\n');
    expect(rt.ok, rt.message).toBe(true);
  });
});

describe('reverse regression: a tuple assignment must not re-parse as a call', () => {
  /**
   * The inline sigil form rendered a tuple assignment as `x^+(3, 4)` — and the
   * FORWARD parser reads those parentheses as a call, producing `x(3, 4)`.
   * An assignment silently became a function call.
   *
   * Only `(` is affected, because only `(` is also a postfix operator that can
   * follow a bare name. Tuples therefore use the arrow form, which cannot be
   * misread. Same family as the `n = 0` -> `n += 0` bug above: emitting text
   * that re-parses as something else.
   */
  it('round-trips a tuple assignment', () => {
    for (const src of ['x = (3, 4)\n', 'p = (1, 2, 3)\n', 'x = ((1 + 2) / 2, 4)\n']) {
      const rt = roundTripFromPython(src);
      expect(rt.ok, `${src.trim()} -> ${rt.message}`).toBe(true);
    }
  });

  it('uses the arrow form for a tuple, not the sigil', () => {
    const eml = transpilePythonToEml('x = (3, 4)\n');
    expect(eml.ok).toBe(true);
    expect(eml.eml).toContain('=> x');
    expect(eml.eml).not.toContain('x^+(');
  });

  it('still uses the sigil for list and dict literals, which are unambiguous', () => {
    const list = transpilePythonToEml('x = [1, 2]\n');
    expect(list.eml).toContain('x^+[1, 2]');
    const dict = transpilePythonToEml('x = {1: 2}\n');
    expect(dict.eml).toContain('x^+{1: 2}');
  });
});
