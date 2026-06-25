/**
 * Static EML symbol table (`eml-symbols.json`).
 *
 * This is the language's authoritative symbol -> semantics mapping, NOT the
 * per-program variable scope used during semantic analysis. The format is a
 * stable public asset: future domain symbol libraries extend it, and agents
 * must not break its shape (see docs/agent-handoff.md).
 */

export type SymbolCategory =
  | 'control'
  | 'algebraic'
  | 'range'
  | 'linear'
  | 'assignment'
  | 'list'
  | 'matrix'
  | 'conditional'
  | 'arithmetic'
  // open-ended on purpose; domain libraries may add categories.
  | (string & {});

export interface SymbolDefinition {
  /** Canonical semantic name, e.g. "summation", "output". */
  name: string;
  category: SymbolCategory;
  /** Python emission template, e.g. "print({value})". Informational/CTS use. */
  python: string;
  /** Human-readable description (zh-Hant or en). */
  description: string;
  /** Optional namespace, e.g. "core", "linear", "ai". */
  namespace?: string;
}

export type EmlSymbolTable = Record<string, SymbolDefinition>;
