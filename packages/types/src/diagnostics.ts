import type { SourceSpan } from './ast';

export type Severity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  severity: Severity;
  /** Stable machine-readable code, e.g. "E_PARSE", "W_COLD_SIDE_EFFECT". */
  code: string;
  message: string;
  span?: SourceSpan;
}
