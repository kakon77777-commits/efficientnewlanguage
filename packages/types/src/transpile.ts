import type { Token } from './tokens';
import type { Program } from './ast';
import type { Diagnostic } from './diagnostics';
import type { CtsFunction, CtsLoop } from './cts';

/**
 * Result of the deterministic EML/Py+ -> Python transpilation pipeline.
 * Mirrors the staged flow in docs/transpiler-spec.md.
 */
export interface TranspileResult {
  /** True when there are no error-severity diagnostics. */
  ok: boolean;
  /** Original source as provided. */
  source: string;
  /** ASCII-canonical source after Unicode normalization. */
  normalized: string;
  tokens: Token[];
  ast: Program;
  diagnostics: Diagnostic[];
  /** Required Python imports collected during semantic analysis, e.g. "import numpy as np". */
  imports: string[];
  /** Final formatted Python source (includes imports when emitProgram=true). */
  python: string;
  metadata: TranspileMetadata;
}

export interface TranspileMetadata {
  emlLines: number;
  pythonLines: number;
  symbolsUsed: string[];
  declaredNames: string[];
  /** Per-function cold/hot + crystallization + importance analysis (Phase 2). */
  functions: CtsFunction[];
  /** Per-loop kind + determinism/termination classification (Phase 4). */
  loops: CtsLoop[];
}

export interface TranspileOptions {
  /** When true (default), prepend collected imports to the emitted Python. */
  emitProgram?: boolean;
  /** Source file name, used for diagnostics and CTS. */
  fileName?: string;
}
