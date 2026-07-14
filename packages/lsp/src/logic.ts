/**
 * Pure LSP logic — no `vscode-languageserver/node` import, no process I/O, no
 * `Connection`. Every function here takes plain values and returns plain
 * values, so it's directly vitest-testable with zero protocol machinery
 * (mirrors the codebase's existing "pure computation in one file, thin I/O
 * adapter in another" pattern — e.g. `emitter.ts`/`semantic.ts` vs
 * `cli/index.ts`). `server.ts` is the thin adapter wiring these to a real
 * `Connection`.
 */
import { transpileEmlToPython } from '@eml/transpiler-python';
import { emitStatement } from '@eml/transpiler-python';
import type { Diagnostic as EmlDiagnostic, Program, Statement, SourceSpan } from '@eml/types';
import { EML_SYMBOLS } from '@eml/symbols';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  Diagnostic,
  DiagnosticSeverity,
  Hover,
  CompletionItem,
  CompletionItemKind,
  MarkupKind,
  Position,
  Range,
} from 'vscode-languageserver';
import { KEYWORDS } from './keywords';

export interface AnalyzedDocument {
  /** ASCII-canonical source (`normalizeSource(rawText)`, already run by `transpileEmlToPython`). */
  normalized: string;
  /** The resolved program (semantic pass already ran; every OverlayAssign is rewritten). */
  ast: Program;
  diagnostics: EmlDiagnostic[];
  /**
   * Offset<->position calculator over `normalized` — NEVER exposed to the
   * client and NEVER used for `getText()`. Position accuracy for
   * ASCII-canonical source survives EOL-style differences (CRLF vs LF)
   * because `normalizeSource()` only collapses line endings, which never
   * changes which line/column a character is on. Unicode display-form
   * source (`Σ`, `∈`, `⇒`, `²`, …) shifts columns within a line during
   * normalization and is out of scope this round — see docs/roadmap.md
   * Phase 8.
   */
  scratch: TextDocument;
}

export function analyzeDocument(rawText: string): AnalyzedDocument {
  const result = transpileEmlToPython(rawText);
  return {
    normalized: result.normalized,
    ast: result.ast,
    diagnostics: result.diagnostics,
    scratch: TextDocument.create('scratch:normalized', 'eml', 0, result.normalized),
  };
}

const SEVERITY: Record<EmlDiagnostic['severity'], DiagnosticSeverity> = {
  error: DiagnosticSeverity.Error,
  warning: DiagnosticSeverity.Warning,
  info: DiagnosticSeverity.Information,
};

/**
 * AST-span -> LSP Range. Uses `span.line`/`span.column` (1-based, survive EOL
 * normalization) for the START position rather than `span.start` (an absolute
 * offset) — `transpileEmlToPython`'s catch-block diagnostic for E_LEX/E_PARSE
 * hardcodes `span: {start: 0, end: 0, line, column}` (real line/column, but
 * always-zero start/end), so trusting `start` uniformly would silently place
 * every lex/parse-error squiggle at document position (0,0).
 */
export function spanToRange(span: SourceSpan | undefined, scratch: TextDocument): Range {
  if (!span) return { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
  const start: Position = { line: span.line - 1, character: span.column - 1 };
  if (span.end > span.start) {
    return { start, end: scratch.positionAt(span.end) };
  }
  // Degenerate (e.g. the hardcoded start:0,end:0 case) — a 1-char-wide range.
  return { start, end: { line: start.line, character: start.character + 1 } };
}

export function toLspDiagnostics(analyzed: AnalyzedDocument): Diagnostic[] {
  return analyzed.diagnostics.map((d) => ({
    severity: SEVERITY[d.severity],
    range: spanToRange(d.span, analyzed.scratch),
    message: `${d.code}: ${d.message}`,
    source: 'eml',
  }));
}

/** Half-open interval overlap test (`span.end` is an exclusive slice bound). */
export function spansOverlap(a: SourceSpan, b: SourceSpan): boolean {
  return a.start < b.end && a.end > b.start;
}

function firstDefined<T>(items: (T | undefined)[]): T | undefined {
  for (const item of items) if (item !== undefined) return item;
  return undefined;
}

/** Standard half-open containment: `[span.start, span.end)`. */
function statementContains(stmt: Statement, offset: number): boolean {
  return stmt.span !== undefined && offset >= stmt.span.start && offset < stmt.span.end;
}

/**
 * Recurse into a MATCHED statement's nested body/bodies, or return it
 * directly if it's a leaf. `ExceptHandler` (the sub-node of
 * `TryStatement.handlers`) never carries a `.span` (the parser doesn't set
 * one — see `packages/parser/src/parser.ts`'s `parseExceptHandler()`), so
 * `Try` recurses straight into `handler.body` without ever testing
 * `handler.span`. Hovering an `except X as e:` header line itself (not
 * inside its body) therefore falls through to the whole enclosing
 * `TryStatement`, showing its full multi-line Python — correct, if
 * occasionally large, not a bug.
 */
function resolveNested(stmt: Statement, offset: number): Statement {
  switch (stmt.type) {
    case 'If':
      return findEnclosingStatement(stmt.body, offset) ?? findEnclosingStatement(stmt.orelse, offset) ?? stmt;
    case 'While':
    case 'ForIn':
    case 'FunctionDef':
    case 'ClassDef':
      return findEnclosingStatement(stmt.body, offset) ?? stmt;
    case 'Try':
      return (
        findEnclosingStatement(stmt.body, offset) ??
        firstDefined(stmt.handlers.map((h) => findEnclosingStatement(h.body, offset))) ??
        findEnclosingStatement(stmt.finallyBody, offset) ??
        stmt
      );
    default:
      return stmt;
  }
}

/**
 * Find the innermost statement in `stmts` whose span contains `offset`,
 * recursing into every AST kind that nests further statements.
 *
 * Two passes, deliberately in this order:
 *
 * 1. **Half-open containment** (`[start, end)`) across ALL siblings first.
 *    This is the unambiguous case and must win outright — see the DEDENT
 *    subtlety below.
 * 2. **Inclusive-end fallback** (`offset === span.end`), only if pass 1 found
 *    nothing anywhere in the list. This exists so hovering right after a
 *    statement's very last character (before a trailing newline/EOF, with no
 *    following sibling) still resolves to something, instead of a dead zone.
 *
 * Running the inclusive-end check in the SAME pass as half-open containment
 * (rather than as a strictly lower-priority fallback) would be a real bug:
 * a compound statement (`If`/`While`/`ForIn`/`FunctionDef`/`ClassDef`) that
 * owns its own nested block consumes the DEDENT token closing that block as
 * part of its OWN span (`parseStatementWithSpan()` wraps the entire
 * `parseFunctionDef()`/etc. call, which itself calls `parseBlock()` and
 * consumes that DEDENT before returning). A DEDENT token is zero-width at
 * the position of the very FIRST character of the next sibling — so e.g. in
 * `def __init__(...): ...\n    def get(...): ...`, `__init__`'s span ends
 * exactly at `get`'s starting offset. If inclusive-end were checked in the
 * same pass, iterating `[__init__, get]` in order would make `__init__` (the
 * FIRST match found) incorrectly win at that exact boundary offset, even
 * though `get`'s own half-open range genuinely contains it. Checking
 * half-open across every sibling FIRST, and only falling back to
 * inclusive-end in a second pass, makes `get` the correct winner.
 */
export function findEnclosingStatement(stmts: Statement[], offset: number): Statement | undefined {
  for (const stmt of stmts) {
    if (statementContains(stmt, offset)) return resolveNested(stmt, offset);
  }
  for (const stmt of stmts) {
    if (stmt.span !== undefined && offset === stmt.span.end) return resolveNested(stmt, offset);
  }
  return undefined;
}

/**
 * Hover content: the Python expansion of the statement under the cursor
 * (via the existing `emitStatement()`), plus any diagnostic whose span
 * overlaps that statement.
 */
export function computeHover(analyzed: AnalyzedDocument, position: Position): Hover | null {
  const offset = analyzed.scratch.offsetAt(position);
  const stmt = findEnclosingStatement(analyzed.ast.body, offset);
  if (!stmt) return null;
  const stmtSpan = stmt.span;
  const overlapping = stmtSpan
    ? analyzed.diagnostics.filter((d) => d.span && spansOverlap(d.span, stmtSpan))
    : [];
  const lines = ['```python', emitStatement(stmt), '```'];
  for (const d of overlapping) lines.push(`⚠ **${d.code}**: ${d.message}`);
  return { contents: { kind: MarkupKind.Markdown, value: lines.join('\n') } };
}

let cachedCompletionItems: CompletionItem[] | undefined;

/**
 * Static completion list: every `EML_SYMBOLS` entry (label = the symbol
 * itself, documentation = its description + Python expansion template) plus
 * every lexer keyword not already covered by a symbol entry. `^+=` is
 * deliberately excluded — the spec (`docs/EML-LANG-2026-v1.0.md` §4) marks it
 * an *internal* symbol-table tag, not writable surface syntax; suggesting it
 * would be actively misleading.
 */
export function buildCompletionItems(): CompletionItem[] {
  if (cachedCompletionItems) return cachedCompletionItems;
  const items: CompletionItem[] = [];
  const covered = new Set<string>();
  for (const [symbol, def] of Object.entries(EML_SYMBOLS)) {
    if (symbol === '^+=') continue;
    items.push({
      label: symbol,
      kind: CompletionItemKind.Operator,
      detail: def.name,
      documentation: { kind: MarkupKind.Markdown, value: `${def.description}\n\n\`${def.python}\`` },
    });
    covered.add(symbol);
  }
  for (const kw of KEYWORDS) {
    if (covered.has(kw)) continue;
    items.push({ label: kw, kind: CompletionItemKind.Keyword });
  }
  cachedCompletionItems = items;
  return items;
}
