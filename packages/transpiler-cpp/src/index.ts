import type { Diagnostic } from '@eml/types';
import { normalizeSource, lex, parseProgram, LexError, ParseError } from '@eml/parser';
import { analyzeSemantics } from '@eml/transpiler-python';
import { emitCppProgram, CppEmitError } from './emitter';

export {
  emitCppProgram,
  emitCppStatement,
  emitCppExpression,
  CppEmitError,
  CPP_PREAMBLE,
} from './emitter';

/** Result of the EML / C⁺⁺⁺ → C++ prototype transpilation. Never throws. */
export interface CppResult {
  ok: boolean;
  source: string;
  normalized: string;
  /** Emitted C++ (empty when ok is false). */
  cpp: string;
  diagnostics: Diagnostic[];
}

/**
 * Transpile EML / C⁺⁺⁺ to standalone C++ (Phase 4 prototype). Reuses the shared
 * pipeline (normalize -> lex -> parse -> semantic) so the SAME resolved AST that
 * targets Python also targets C++; only the emitter differs. Returns
 * `ok: false` with diagnostics on lex/parse/semantic errors or on a construct
 * the C++ prototype does not support (E_CPP_UNSUPPORTED).
 */
export function transpileEmlToCpp(source: string): CppResult {
  const normalized = normalizeSource(source);
  try {
    const ast = parseProgram(lex(normalized));
    const semantic = analyzeSemantics(ast);
    const errors = semantic.diagnostics.filter((d) => d.severity === 'error');
    if (errors.length > 0) {
      return { ok: false, source, normalized, cpp: '', diagnostics: semantic.diagnostics };
    }
    const cpp = emitCppProgram(semantic.program);
    return { ok: true, source, normalized, cpp, diagnostics: semantic.diagnostics };
  } catch (err) {
    const diagnostic: Diagnostic =
      err instanceof LexError || err instanceof ParseError
        ? {
            severity: 'error',
            code: err instanceof LexError ? 'E_LEX' : 'E_PARSE',
            message: err.message,
            span: { start: 0, end: 0, line: err.line, column: err.column },
          }
        : err instanceof CppEmitError
          ? { severity: 'error', code: 'E_CPP_UNSUPPORTED', message: err.message }
          : { severity: 'error', code: 'E_INTERNAL', message: err instanceof Error ? err.message : String(err) };
    return { ok: false, source, normalized, cpp: '', diagnostics: [diagnostic] };
  }
}
