/**
 * AI-assisted Python -> EML compression. Per whitepaper §5.4 and agent-handoff
 * rule 4: the LLM only *suggests*; every suggestion must pass the round-trip
 * validator before it is offered, and nothing is ever auto-written to source.
 */

/** A raw suggestion as returned by an LLM, before validation. */
export interface RawSuggestion {
  /** Suggested EML/Py+ source. */
  eml: string;
  /** The variable whose value should be identical before/after compression. */
  targetVariable: string;
  /** Python assignment snippets defining the free variables, for equivalence runs. */
  testBindings: string[];
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

/** Pluggable LLM backend. The deterministic path needs no LlmClient. */
export interface LlmClient {
  suggest(python: string): Promise<RawSuggestion[]>;
}

export interface Suggestion {
  eml: string;
  /** 'deterministic' = exact inverse of the emitter; 'ai' = LLM-proposed. */
  source: 'deterministic' | 'ai';
  /** 'exact' is reserved for the deterministic inverse. */
  confidence: 'exact' | 'high' | 'medium' | 'low';
  /** True only when the round-trip validator confirmed semantic equivalence. */
  validated: boolean;
  /** The Python that the suggested EML compiles back to. */
  compiledPython: string;
  rationale?: string;
  /** Why validation passed or failed. */
  validationDetail: string;
}

export interface SuggestResult {
  /** All candidates, validated and rejected, in confidence order. */
  suggestions: Suggestion[];
  usedLlm: boolean;
  /** Set when the LLM backend failed; deterministic suggestions are still returned. */
  llmError?: string;
}
