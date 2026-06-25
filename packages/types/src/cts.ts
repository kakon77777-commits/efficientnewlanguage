/**
 * PHOSPHOR-compatible Cross-reference / Comment / Symbol table (CTS).
 *
 * The CTS is a *required* MVP output (not a decorative extra). It lets
 * PHOSPHOR show semantic mapping, symbol dependencies, and execution trace,
 * not just results. Shape follows the whitepaper Appendix C.
 */

export interface CtsSymbolEntry {
  type: string;
  meaning: string;
  target?: string;
}

export interface CtsNode {
  id: string;
  /** EML source fragment for this node. */
  source: string;
  /** Generated Python for this node. */
  python: string;
  /** Variable / identifier dependencies. */
  dependencies: string[];
  /** Semantic type, e.g. "algebraic.sum", "control.output". */
  semanticType: string;
}

/**
 * Dynamic-compiler importance score (whitepaper §8.5, MVP de-scaled form):
 * `score = w1*callFrequency + w2*riskLevel + w3*dependencyDepth`.
 * Components are reported raw alongside the normalized composite so PHOSPHOR can
 * decide whether to trace, require tests, or allow agent refactors.
 */
export interface CtsImportance {
  /** How many call sites reference this function across the program. */
  callFrequency: number;
  /** Heuristic 0..1 error-impact level (hot/I-O raise it, cold-pure lowers it). */
  riskLevel: number;
  /** Call-graph depth: 1 for a leaf, +1 per nested user-function call layer. */
  dependencyDepth: number;
  /** Normalized composite in 0..1. */
  score: number;
}

/**
 * Per-function semantic metadata (cold/hot separation + rule-based
 * crystallization, whitepaper §7). Emitted only for programs that define
 * functions; statement-only programs leave `functions` empty.
 */
export interface CtsFunction {
  name: string;
  /** 'cold' (cacheable pure logic), 'hot' (dynamic state), or 'neutral'. */
  temperature: 'cold' | 'hot' | 'neutral';
  /** True when no side effects were detected (required for a cold function). */
  pure: boolean;
  /** Stable structural hash of (params, body) — the crystallization key. */
  astHash: string;
  /** True when this function's logic was served from the crystallization cache. */
  cached: boolean;
  importance: CtsImportance;
  /** Human-readable side-effect findings (empty when pure). */
  sideEffects: string[];
}

/**
 * Loop classification (whitepaper §8.4, MVP de-scaled form of the "twelve loop
 * kinds"). Each loop-like construct is tagged with a `loopKind` plus whether it
 * is deterministic and provably terminating — metadata an agent/PHOSPHOR can use
 * without a runtime.
 */
export interface CtsLoop {
  /** e.g. 'algebraic_sum' | 'temporal' | 'recursive' | 'basic_repeat'. */
  loopKind: string;
  /** EML source fragment (first line). */
  source: string;
  /** True when the iteration is fully determined by the program (no I/O/dynamic state). */
  deterministic: boolean;
  /** True when termination is provable (e.g. a finite range or a max_wait bound). */
  terminating: boolean;
  /** Associated function name or CTS node id, when applicable. */
  ref?: string;
}

export interface Cts {
  file: string;
  /** symbolTable: symbol -> semantic meaning. */
  symbols: Record<string, CtsSymbolEntry>;
  /** nodes: per-statement source/python/deps mapping. */
  nodes: CtsNode[];
  /** functions: per-function cold/hot + crystallization + importance metadata. */
  functions: CtsFunction[];
  /** loops: per-loop kind + determinism/termination metadata (Phase 4). */
  loops: CtsLoop[];
  /** commentTable: nodeId -> human explanation. */
  commentTable: Record<string, string>;
  /** crossRefTable: identifier -> EML sources that define/produce it. */
  crossRefTable: Record<string, string[]>;
}
