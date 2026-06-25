import { describe, it, expect } from 'vitest';
import { suggestEml, validateEquivalence, type LlmClient, type RawSuggestion } from '@eml/ai-converter';

class MockLlm implements LlmClient {
  constructor(private readonly out: RawSuggestion[]) {}
  async suggest(): Promise<RawSuggestion[]> {
    return this.out;
  }
}
class ThrowingLlm implements LlmClient {
  async suggest(): Promise<RawSuggestion[]> {
    throw new Error('429 rate_limit_error');
  }
}

// A Python accumulation loop that is semantically a sum of squares.
const LOOP = 'total = 0\nfor i in range(1, n+1):\n    total += i*i';

describe('deterministic-first', () => {
  it('returns an exact deterministic suggestion for subset Python (no LLM)', async () => {
    const r = await suggestEml('x = 100\nprint(x)');
    expect(r.usedLlm).toBe(false);
    expect(r.suggestions[0]).toMatchObject({ source: 'deterministic', confidence: 'exact', validated: true });
    expect(r.suggestions[0]!.eml).toContain('x^+100');
  });
});

describe('AI suggestions are gated by the round-trip validator', () => {
  it('ACCEPTS a semantically-equivalent loop -> Σ compression', async () => {
    const llm = new MockLlm([
      { eml: 'Σ(i^2, i in [1:n]) => total', targetVariable: 'total', testBindings: ['n = 5'], rationale: 'sum of squares', confidence: 'high' },
    ]);
    const ai = (await suggestEml(LOOP, { llm })).suggestions.find((s) => s.source === 'ai')!;
    expect(ai.validated).toBe(true);
  });

  // The KEY soundness regression: a degenerate binding the LLM picked (n=1, where
  // sum(i)==sum(i**2)) must NOT validate a wrong suggestion — the validator
  // generates its own diverse inputs.
  it('REJECTS a wrong suggestion even when the LLM supplies a degenerate binding (n=1)', async () => {
    const llm = new MockLlm([
      { eml: 'Σ(i, i in [1:n]) => total', targetVariable: 'total', testBindings: ['n = 1'], rationale: 'wrong: drops the square', confidence: 'high' },
    ]);
    const ai = (await suggestEml(LOOP, { llm })).suggestions.find((s) => s.source === 'ai')!;
    expect(ai.validated).toBe(false);
  });

  // Empty-range exploit: an arbitrary wrong body hidden behind n=0 (empty range).
  it('REJECTS an arbitrary wrong body hidden by an empty-range binding (n=0)', async () => {
    const llm = new MockLlm([
      { eml: 'Σ(i*999 + 7, i in [1:n]) => total', targetVariable: 'total', testBindings: ['n = 0'], rationale: 'garbage body', confidence: 'high' },
    ]);
    const ai = (await suggestEml(LOOP, { llm })).suggestions.find((s) => s.source === 'ai')!;
    expect(ai.validated).toBe(false);
  });

  it('REJECTS a suggestion whose EML does not transpile', async () => {
    const llm = new MockLlm([
      { eml: 'this is not eml ^^^', targetVariable: 'total', testBindings: ['n = 5'], rationale: 'garbage', confidence: 'low' },
    ]);
    const ai = (await suggestEml(LOOP, { llm })).suggestions.find((s) => s.source === 'ai')!;
    expect(ai.validated).toBe(false);
  });
});

describe('graceful degradation', () => {
  it('keeps the deterministic suggestion when the LLM backend throws (alwaysAskLlm)', async () => {
    const r = await suggestEml('x = 100\nprint(x)', { llm: new ThrowingLlm(), alwaysAskLlm: true });
    expect(r.llmError).toContain('429');
    expect(r.suggestions.some((s) => s.source === 'deterministic' && s.validated)).toBe(true);
  });
});

describe('validateEquivalence hardening', () => {
  it('passes for semantically identical Python', () => {
    expect(validateEquivalence('x = 1 + 2', 'x = 3', 'x', ['']).equivalent).toBe(true);
  });
  it('fails when the value differs', () => {
    expect(validateEquivalence('x = 1', 'x = 2', 'x', ['']).equivalent).toBe(false);
  });
  it('is stable for sets of strings (hash seed pinned)', () => {
    const prog = "x = {'a', 'b', 'c', 'd', 'e', 'f', 'g'}";
    expect(validateEquivalence(prog, prog, 'x', ['']).equivalent).toBe(true);
  });
  it('isolates the target from the program\'s own stdout', () => {
    // x is identical (10); the extra print(5) must not pollute the comparison.
    expect(validateEquivalence('print(5)\nx = 10', 'x = 10', 'x', ['']).equivalent).toBe(true);
  });
  it('does not hang on an infinite-loop binding (timeout)', () => {
    const r = validateEquivalence('x = 1', 'x = 1', 'x', ['while True:\n    pass'], { timeoutMs: 800 });
    expect(r.equivalent).toBe(false);
  });
});
