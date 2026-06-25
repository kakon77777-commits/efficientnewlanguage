import { parse as parseEml } from '@eml/parser';
import {
  transpileEmlToPython,
  emitProgram,
  formatPython,
} from '@eml/transpiler-python';
import { parsePython, PyParseError } from './py-parser';
import { PyLexError } from './py-lexer';
import { emitEmlProgram } from './eml-emitter';

export { parsePython, PyParseError } from './py-parser';
export { PyLexError, lexPython } from './py-lexer';
export { emitEmlProgram, emitEmlStatement, emitEmlExpression } from './eml-emitter';

export interface PyToEmlResult {
  ok: boolean;
  eml: string;
  error?: string;
}

/** Deterministic Python (supported subset) -> EML/Py+. Never throws. */
export function transpilePythonToEml(source: string): PyToEmlResult {
  try {
    const ast = parsePython(source);
    return { ok: true, eml: emitEmlProgram(ast) };
  } catch (err) {
    if (err instanceof PyLexError || err instanceof PyParseError) {
      return {
        ok: false,
        eml: '',
        error: `${err.name}: ${err.message} (line ${err.line}, col ${err.column})`,
      };
    }
    return { ok: false, eml: '', error: err instanceof Error ? err.message : String(err) };
  }
}

export interface RoundTripResult {
  /** True when the bidirectional transpilation reaches a fixpoint. */
  ok: boolean;
  steps: Record<string, string>;
  message: string;
}

/**
 * EML -> Python -> EML -> Python. If the bidirectional transpilation is
 * faithful, the two Python outputs are byte-identical. This is the strongest
 * validation that "the transpiler actually transpiles".
 */
export function roundTripFromEml(emlSource: string): RoundTripResult {
  const fwd1 = transpileEmlToPython(emlSource);
  if (!fwd1.ok) {
    return {
      ok: false,
      steps: { python1: fwd1.python },
      message: 'forward EML->Python failed: ' + fwd1.diagnostics.map((d) => d.message).join('; '),
    };
  }
  const back = transpilePythonToEml(fwd1.python);
  if (!back.ok) {
    return {
      ok: false,
      steps: { python1: fwd1.python },
      message: 'reverse Python->EML failed: ' + (back.error ?? 'unknown'),
    };
  }
  const fwd2 = transpileEmlToPython(back.eml);
  const ok = fwd2.ok && fwd1.python === fwd2.python;
  return {
    ok,
    steps: { python1: fwd1.python, eml2: back.eml, python2: fwd2.python },
    message: ok ? 'round-trip fixpoint reached (python1 == python2)' : 'round-trip MISMATCH (python1 != python2)',
  };
}

/**
 * Python -> EML -> Python. Compares against the canonical re-emission of the
 * input Python so formatting differences in the source don't cause spurious
 * mismatches.
 */
export function roundTripFromPython(pySource: string): RoundTripResult {
  let canonical: string;
  try {
    canonical = formatPython(emitProgram(parsePython(pySource), [], { emitProgram: false }));
  } catch (err) {
    return {
      ok: false,
      steps: {},
      message: 'could not parse input Python: ' + (err instanceof Error ? err.message : String(err)),
    };
  }
  const back = transpilePythonToEml(pySource);
  if (!back.ok) {
    return { ok: false, steps: { canonical }, message: 'reverse Python->EML failed: ' + (back.error ?? 'unknown') };
  }
  const fwd = transpileEmlToPython(back.eml, { emitProgram: false });
  if (!fwd.ok) {
    return {
      ok: false,
      steps: { eml: back.eml, canonical },
      message: 'forward EML->Python failed: ' + fwd.diagnostics.map((d) => d.message).join('; '),
    };
  }
  const ok = fwd.python === canonical;
  return {
    ok,
    steps: { eml: back.eml, python: fwd.python, canonical },
    message: ok ? 'round-trip fixpoint reached (python == canonical)' : 'round-trip MISMATCH',
  };
}

// re-export the EML forward parse for convenience
export { parseEml };
