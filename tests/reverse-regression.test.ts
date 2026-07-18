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
