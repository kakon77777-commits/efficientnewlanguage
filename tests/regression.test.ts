import { describe, it, expect } from 'vitest';
import { transpileLine, transpileEmlToPython } from '@eml/transpiler-python';

/**
 * Regression tests for the 13 issues surfaced by the adversarial review
 * (beyond the 46 happy-path tests). Each `it` maps to a confirmed finding.
 */

describe('emitter precedence — parenthesization', () => {
  // CRITICAL: right operand of non-associative - and / must be parenthesized.
  it('parenthesizes right operand of - and /', () => {
    expect(transpileLine('a - (b - c) => z')).toBe('z = a - (b - c)');
    expect(transpileLine('a - (b + c) => z')).toBe('z = a - (b + c)');
    expect(transpileLine('a / (b / c) => z')).toBe('z = a / (b / c)');
    expect(transpileLine('a / (b * c) => z')).toBe('z = a / (b * c)');
  });
  it('does not over-parenthesize safe arithmetic', () => {
    expect(transpileLine('a - b * c => z')).toBe('z = a - b * c');
    expect(transpileLine('a + b + c => z')).toBe('z = a + b + c');
    expect(transpileLine('a * b / c => z')).toBe('z = a * b / c');
  });

  // CRITICAL/MAJOR: nested conditionals need parens in test/consequent.
  it('parenthesizes nested conditionals correctly', () => {
    expect(transpileLine('a ? (b ? c : d) : e')).toBe('(c if b else d) if a else e');
    expect(transpileLine('(a ? b : c) ? d : e')).toBe('d if (b if a else c) else e');
    expect(transpileLine('x > 40 ? A : B')).toBe('A if x > 40 else B'); // flat: unchanged
  });

  // MAJOR: ** is right-associative; a Power base must be parenthesized.
  it('parenthesizes a power base', () => {
    expect(transpileLine('(a^2)^3')).toBe('(a**2)**3');
    expect(transpileLine('i^2')).toBe('i**2'); // unchanged
  });

  // MAJOR: inclusive +1 must wrap a low-precedence range end.
  it('parenthesizes low-precedence range ends before +1', () => {
    expect(transpileLine('i in [1 : a ? b : c]')).toBe('i in range(1, (b if a else c)+1)');
    expect(transpileLine('i in [1:N]')).toBe('i in range(1, N+1)'); // identifier: unchanged
    expect(transpileLine('i in [1:10]')).toBe('i in range(1, 11)'); // literal fold: unchanged
  });
});

describe('semantic diagnostics', () => {
  // MINOR: non-integer literal range bound -> error (range() rejects floats).
  it('rejects non-integer range bounds', () => {
    const r = transpileEmlToPython('i in [1:2.5]');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_RANGE_NONINT')).toBe(true);
  });

  // MAJOR: list/lst alias collision must fail loudly, not silently clobber.
  it('flags a list/lst alias collision', () => {
    const r = transpileEmlToPython('list^+[1,2,3]\n5 => lst');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_ALIAS_COLLISION')).toBe(true);
  });
});

describe('parser robustness', () => {
  // MINOR: only the literal `0` is the output operator.
  it('x^0 is output but x^00 is a parse error', () => {
    expect(transpileLine('x^0')).toBe('print(x)');
    const r = transpileEmlToPython('x^00');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]!.code).toBe('E_PARSE');
  });
});

describe('list alias scope', () => {
  // MINOR: alias the binding/reads, but preserve a genuine builtin call list(...).
  it('aliases the list binding but not a call callee', () => {
    expect(transpileLine('list^+[1,2,3]')).toBe('lst = [1, 2, 3]');
    expect(transpileLine('list(1) => x')).toBe('x = list(1)');
  });
});
