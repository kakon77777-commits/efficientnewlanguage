import { describe, it, expect } from 'vitest';
import { normalizeSource } from '@eml/parser';

describe('unicode -> ASCII normalization', () => {
  it('superscript 2 -> ^2', () => {
    expect(normalizeSource('i²')).toBe('i^2');
  });
  it('superscript T -> ^T', () => {
    expect(normalizeSource('mᵀ')).toBe('m^T');
  });
  it('∈ -> in', () => {
    expect(normalizeSource('i∈[1:N]')).toBe('i in [1:N]');
  });
  it('⇒ -> =>', () => {
    expect(normalizeSource('x ⇒ y')).toBe('x => y');
  });
  it('Σ is preserved and the rest normalizes', () => {
    expect(normalizeSource('Σ(i², i∈[1:N])')).toBe('Σ(i^2, i in [1:N])');
  });
  it('subscript digits glue as plain digits: r₁⁰ -> r1^0', () => {
    expect(normalizeSource('r₁⁰')).toBe('r1^0');
    expect(normalizeSource('x₂')).toBe('x2');
  });
});
