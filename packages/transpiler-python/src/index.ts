import type { TranspileResult, TranspileOptions, Program, CtsFunction } from '@eml/types';
import { normalizeSource, lex, parseProgram, LexError, ParseError } from '@eml/parser';
import { analyzeSemantics, type SemanticOptions, type FunctionInfo } from './semantic';
import { emitProgram, emitStatement } from './emitter';
import { formatPython } from './formatter';
import { CrystalCache } from './crystallize';
import { TEMPORAL_RUNTIME_PREAMBLE } from './temporal-runtime';

export { analyzeSemantics } from './semantic';
export type { SemanticOptions, SemanticResult, FunctionInfo } from './semantic';
export { emitProgram, emitStatement, emitExpression, aliasIdentifier, IDENTIFIER_ALIASES } from './emitter';
export { formatPython } from './formatter';
export { CrystalCache, hashFunction, type CrystalCacheData } from './crystallize';
export { checkPurity, type PurityResult } from './purity';
export { computeImportance } from './importance';
export { classifyLoops, type LoopFact } from './loop-classifier';
export { TEMPORAL_RUNTIME_PREAMBLE } from './temporal-runtime';

/** Transpile options plus an optional shared crystallization cache (Phase 2). */
export interface EmlTranspileOptions extends TranspileOptions {
  /** Reuse a crystallization cache across calls (e.g. in the editor). */
  crystalCache?: CrystalCache;
}

/**
 * Resolve crystallization `cached` flags: a cold function whose logic hash was
 * already in the cache is a cache hit. Cold hashes are recorded; non-cold
 * functions are never cached. Output Python is unaffected either way.
 */
function applyCrystallization(functions: FunctionInfo[], cache: CrystalCache): CtsFunction[] {
  return functions.map((f) => ({
    ...f,
    cached: f.temperature === 'cold' ? cache.store(f.astHash) : false,
  }));
}

const countNonEmpty = (s: string): number =>
  s.split('\n').filter((l) => l.trim() !== '').length;

/**
 * Byte offset of a 1-based (line, column) in `text`. Every other span in the
 * pipeline carries an offset because the AST nodes do; lex and parse errors do
 * not, so theirs is computed from the position they DO carry. Clamped to the
 * text length so a position past the end still lands somewhere real.
 */
const offsetOfLineColumn = (text: string, line: number, column: number): number => {
  let offset = 0;
  for (let l = 1; l < line; l++) {
    const nl = text.indexOf('\n', offset);
    if (nl < 0) break;
    offset = nl + 1;
  }
  return Math.min(offset + Math.max(0, column - 1), text.length);
};

/**
 * The deterministic EML/Py+ -> Python transpilation pipeline.
 * Never throws: lex/parse failures are returned as error diagnostics.
 */
export function transpileEmlToPython(
  source: string,
  options: EmlTranspileOptions = {},
): TranspileResult {
  const normalized = normalizeSource(source);
  try {
    const tokens = lex(normalized);
    const ast = parseProgram(tokens);
    const semantic = analyzeSemantics(ast);
    const emitted = emitProgram(semantic.program, semantic.imports, {
      emitProgram: options.emitProgram ?? true,
      preamble: semantic.usesTemporal ? TEMPORAL_RUNTIME_PREAMBLE : undefined,
    });
    const python = formatPython(emitted);
    const ok = semantic.diagnostics.every((d) => d.severity !== 'error');
    const functions = applyCrystallization(
      semantic.functions,
      options.crystalCache ?? new CrystalCache(),
    );
    // Fill each loop's source fragment from its span. A FunctionDef span starts
    // at its first decorator line, so skip decorator lines to land on the
    // `def`/`async def` header (which actually identifies the loop construct).
    const firstSignificantLine = (text: string): string => {
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '');
      return lines.find((l) => !l.startsWith('@')) ?? lines[0] ?? '';
    };
    const loops = semantic.loops.map((l) => ({
      loopKind: l.loopKind,
      deterministic: l.deterministic,
      terminating: l.terminating,
      ref: l.ref,
      source: l.span
        ? firstSignificantLine(normalized.slice(l.span.start, l.span.end))
        : (l.ref ?? ''),
    }));
    return {
      ok,
      source,
      normalized,
      tokens,
      ast: semantic.program,
      diagnostics: semantic.diagnostics,
      imports: semantic.imports,
      python,
      metadata: {
        emlLines: countNonEmpty(normalized),
        pythonLines: countNonEmpty(python),
        symbolsUsed: semantic.symbolsUsed,
        declaredNames: semantic.declaredNames,
        functions,
        loops,
        importedModules: semantic.importedModules,
      },
    };
  } catch (err) {
    // LexError and ParseError carry a line and a column and no offset, so the
    // offset half of the span has to be derived here, where the text they were
    // measured against is still in scope. It used to be hardcoded to 0: the
    // line/column said one place and the offset said the top of the file, and
    // nothing compared the two halves of a span to each other. The span is
    // zero-width because the error carries no token length — a caret, not a
    // range.
    const errLine = err instanceof LexError || err instanceof ParseError ? err.line : 1;
    const errColumn = err instanceof LexError || err instanceof ParseError ? err.column : 1;
    const errStart = offsetOfLineColumn(normalized, errLine, errColumn);
    const diagnostic =
      err instanceof LexError || err instanceof ParseError
        ? {
            severity: 'error' as const,
            code: err instanceof LexError ? 'E_LEX' : 'E_PARSE',
            message: err.message,
            span: { start: errStart, end: errStart, line: err.line, column: err.column },
          }
        : {
            severity: 'error' as const,
            code: 'E_INTERNAL',
            message: err instanceof Error ? err.message : String(err),
          };
    const emptyAst: Program = { type: 'Program', body: [] };
    return {
      ok: false,
      source,
      normalized,
      tokens: [],
      ast: emptyAst,
      diagnostics: [diagnostic],
      imports: [],
      python: '',
      metadata: { emlLines: countNonEmpty(normalized), pythonLines: 0, symbolsUsed: [], declaredNames: [], functions: [], loops: [], importedModules: [] },
    };
  }
}

/**
 * Transpile a single EML statement to a single line of Python (no imports, no
 * trailing newline). Used for the documented statement-mapping cases, where a
 * context of already-declared names disambiguates `x^+n` (init vs. augmented).
 */
export function transpileLine(
  line: string,
  context: SemanticOptions = {},
): string {
  const ast = parseProgram(lex(normalizeSource(line)));
  const semantic = analyzeSemantics(ast, context);
  return semantic.program.body.map(emitStatement).join('\n');
}
