import { transpilePythonToEml } from '@eml/transpiler-eml';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { validateEquivalence } from './validator';
import type { LlmClient, RawSuggestion, Suggestion, SuggestResult } from './types';

export * from './types';
export { validateEquivalence } from './validator';
export type { EquivalenceResult } from './validator';
export { ClaudeClient } from './claude-client';

export interface SuggestOptions {
  llm?: LlmClient;
  /** Query the LLM even when the deterministic reverse already succeeds. */
  alwaysAskLlm?: boolean;
}

const RANK: Record<Suggestion['confidence'], number> = { exact: 0, high: 1, medium: 2, low: 3 };

/**
 * Suggest EML compressions for a Python snippet. The deterministic inverse runs
 * first (exact, no LLM). An LLM is consulted only when the deterministic path
 * fails (or when alwaysAskLlm), and EVERY LLM suggestion is gated by the
 * execution-based round-trip validator. Nothing is written to disk.
 */
export async function suggestEml(python: string, options: SuggestOptions = {}): Promise<SuggestResult> {
  const suggestions: Suggestion[] = [];

  const det = transpilePythonToEml(python);
  if (det.ok) {
    const back = transpileEmlToPython(det.eml);
    suggestions.push({
      eml: det.eml.trimEnd(),
      source: 'deterministic',
      confidence: 'exact',
      validated: true,
      compiledPython: back.python.trimEnd(),
      validationDetail: 'exact inverse of the emitter (round-trip fixpoint, proven by construction)',
    });
  }

  const deterministicEmls = new Set(suggestions.map((s) => s.eml.trim()));
  let usedLlm = false;
  let llmError: string | undefined;
  if (options.llm && (!det.ok || options.alwaysAskLlm)) {
    usedLlm = true;
    let raw: RawSuggestion[] = [];
    try {
      raw = await options.llm.suggest(python);
    } catch (e) {
      // Soft-degrade: keep the deterministic (proven) suggestions; report the failure.
      llmError = e instanceof Error ? e.message : String(e);
      raw = [];
    }
    for (const r of raw) {
      if (deterministicEmls.has(r.eml.trim())) continue; // dedup against the exact inverse
      const fwd = transpileEmlToPython(r.eml);
      if (!fwd.ok) {
        suggestions.push({
          eml: r.eml.trim(),
          source: 'ai',
          confidence: r.confidence,
          validated: false,
          compiledPython: '',
          rationale: r.rationale,
          validationDetail:
            'rejected: suggested EML does not transpile — ' +
            fwd.diagnostics.map((d) => d.message).join('; '),
        });
        continue;
      }
      const eq = validateEquivalence(python, fwd.python, r.targetVariable, r.testBindings);
      suggestions.push({
        eml: r.eml.trim(),
        source: 'ai',
        confidence: r.confidence,
        validated: eq.equivalent,
        compiledPython: fwd.python.trimEnd(),
        rationale: r.rationale,
        validationDetail: (eq.equivalent ? 'validated: ' : 'rejected: ') + eq.detail,
      });
    }
  }

  suggestions.sort(
    (a, b) => Number(b.validated) - Number(a.validated) || RANK[a.confidence] - RANK[b.confidence],
  );
  return { suggestions, usedLlm, llmError };
}
