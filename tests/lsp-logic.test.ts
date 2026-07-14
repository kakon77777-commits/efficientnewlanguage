import { describe, it, expect } from 'vitest';
import {
  analyzeDocument,
  toLspDiagnostics,
  findEnclosingStatement,
  computeHover,
  buildCompletionItems,
  spanToRange,
  spansOverlap,
} from '@eml/lsp';
import { Diagnostic } from 'vscode-languageserver';
import { EML_SYMBOLS } from '@eml/symbols';

/** Locate a substring's offset in the analyzed (normalized) text — robust
 *  against exact formatting, unlike hand-counted character offsets. */
function offsetOf(normalized: string, needle: string): number {
  const i = normalized.indexOf(needle);
  expect(i, `expected to find ${JSON.stringify(needle)} in source`).toBeGreaterThanOrEqual(0);
  return i;
}

describe('@eml/lsp logic — analyzeDocument / toLspDiagnostics', () => {
  it('a lex/parse error diagnostic uses line/column, NOT the hardcoded start:0,end:0 span', () => {
    // A `class Foo(Bar):` base-class clause is E_PARSE (no base-class support) — the
    // error surfaces partway through the source, not at position (0,0).
    const src = 'x^+1\nclass Foo(Bar):\n    def m(self):\n        return 1\n';
    const analyzed = analyzeDocument(src);
    expect(analyzed.diagnostics[0]?.code).toBe('E_PARSE');
    const diags = toLspDiagnostics(analyzed);
    expect(diags).toHaveLength(1);
    // Real location: line 2 (0-based: 1), not line 0 — proves start:0,end:0 isn't trusted.
    expect(diags[0]!.range.start.line).toBe(1);
    expect(diags[0]!.range.start.character).toBeGreaterThan(0);
  });

  it('a semantic warning (W_FN_REDECLARED) uses its real span', () => {
    const src = 'def f():\n    return 1\ndef f():\n    return 2\n';
    const analyzed = analyzeDocument(src);
    expect(analyzed.diagnostics.find((d) => d.code === 'W_FN_REDECLARED')).toBeDefined();
    const diags = toLspDiagnostics(analyzed);
    const warn = diags.find((d) => Diagnostic.getMessageString(d).startsWith('W_FN_REDECLARED'));
    expect(warn).toBeDefined();
    // The redeclaration is the SECOND `def f()`, not the first.
    const secondDefLine = src.split('\n').findIndex((l, i) => l.startsWith('def f()') && i > 0);
    expect(warn!.range.start.line).toBe(secondDefLine);
  });
});

describe('@eml/lsp logic — findEnclosingStatement', () => {
  const NESTED_SRC =
    'def outer(n):\n' +
    '    if n > 0:\n' +
    '        while n > 0:\n' +
    '            n - 1 => n\n' +
    '    return n\n';

  it('an offset deep inside a nested statement returns exactly that inner statement', () => {
    const analyzed = analyzeDocument(NESTED_SRC);
    const offset = offsetOf(analyzed.normalized, 'n - 1 => n');
    const stmt = findEnclosingStatement(analyzed.ast.body, offset);
    // `n - 1 => n` is the reversed arrow form (value first) — always an
    // Assignment node, regardless of what the value expression computes.
    expect(stmt?.type).toBe('Assignment');
  });

  it("an offset on a compound statement's header returns the compound statement itself", () => {
    const analyzed = analyzeDocument(NESTED_SRC);
    const offset = offsetOf(analyzed.normalized, 'if n > 0:');
    const stmt = findEnclosingStatement(analyzed.ast.body, offset);
    expect(stmt?.type).toBe('If');
  });

  const TRY_SRC =
    'try:\n' +
    '    10 / 0 => x\n' +
    'except ZeroDivisionError as e:\n' +
    '    x^+99\n' +
    'x^0\n';

  it('an offset on an except header (ExceptHandler.span is always undefined) falls back to the enclosing Try', () => {
    const analyzed = analyzeDocument(TRY_SRC);
    const offset = offsetOf(analyzed.normalized, 'except ZeroDivisionError as e:');
    const stmt = findEnclosingStatement(analyzed.ast.body, offset);
    expect(stmt?.type).toBe('Try');
  });

  const CLASS_SRC =
    'class Counter:\n' +
    '    def __init__(self, start):\n' +
    '        start => self.value\n' +
    '    def get(self):\n' +
    '        return self.value\n';

  it('recurses into a ClassDef body to find a method, then into the method body for a leaf statement', () => {
    const analyzed = analyzeDocument(CLASS_SRC);
    const leafOffset = offsetOf(analyzed.normalized, 'return self.value');
    expect(findEnclosingStatement(analyzed.ast.body, leafOffset)?.type).toBe('Return');
    // Regression: `__init__`'s own span absorbs the zero-width DEDENT token
    // that closes ITS body, which sits at the exact offset `get` starts at
    // (`__init__.span.end === get.span.start`). A single-pass "inclusive end"
    // match would incorrectly return `__init__` here (first sibling wins the
    // boundary tie) instead of `get` (the genuinely half-open-matching one).
    const headerOffset = offsetOf(analyzed.normalized, 'def get(self):');
    const headerStmt = findEnclosingStatement(analyzed.ast.body, headerOffset);
    expect(headerStmt?.type).toBe('FunctionDef');
    expect((headerStmt as { name?: string }).name).toBe('get');
  });

  it('returns undefined for an offset with no span-covering top-level statement (empty program)', () => {
    const analyzed = analyzeDocument('');
    expect(findEnclosingStatement(analyzed.ast.body, 0)).toBeUndefined();
  });
});

describe('@eml/lsp logic — computeHover', () => {
  it("shows the hovered statement's Python expansion", () => {
    const src = 'def outer(n):\n    if n > 0:\n        return n\n    return 0 - n\n';
    const analyzed = analyzeDocument(src);
    const offset = offsetOf(analyzed.normalized, 'return n');
    const position = analyzed.scratch.positionAt(offset);
    const hover = computeHover(analyzed, position);
    expect(hover).not.toBeNull();
    expect((hover!.contents as { value: string }).value).toContain('return n');
  });

  it('surfaces an overlapping diagnostic in the hover popup', () => {
    const src = 'def f():\n    return 1\ndef f():\n    return 2\n';
    const analyzed = analyzeDocument(src);
    const offset = offsetOf(analyzed.normalized, 'def f():\n    return 2');
    const position = analyzed.scratch.positionAt(offset);
    const hover = computeHover(analyzed, position);
    expect(hover).not.toBeNull();
    expect((hover!.contents as { value: string }).value).toContain('W_FN_REDECLARED');
  });

  it('returns null when the cursor is on no statement (e.g. an empty document)', () => {
    const analyzed = analyzeDocument('');
    expect(computeHover(analyzed, { line: 0, character: 0 })).toBeNull();
  });
});

describe('@eml/lsp logic — buildCompletionItems', () => {
  const items = buildCompletionItems();
  const labels = items.map((i) => i.label);

  it('excludes ^+= (an internal symbol-table tag, not writable surface syntax)', () => {
    expect(labels).not.toContain('^+=');
  });

  it('includes every other EML_SYMBOLS key exactly once', () => {
    for (const symbol of Object.keys(EML_SYMBOLS)) {
      if (symbol === '^+=') continue;
      expect(labels.filter((l) => l === symbol), `symbol ${symbol}`).toHaveLength(1);
    }
  });

  it('includes every lexer keyword at least once', () => {
    const KEYWORDS = [
      'in', 'SUM', 'def', 'return', 'async', 'await', 'if', 'elif', 'else', 'while', 'for',
      'break', 'continue', 'import', 'try', 'except', 'finally', 'raise', 'as', 'class',
    ];
    for (const kw of KEYWORDS) {
      expect(labels, `keyword ${kw}`).toContain(kw);
    }
  });

  it('does NOT duplicate def/await (present in both EML_SYMBOLS and the keyword list)', () => {
    expect(labels.filter((l) => l === 'def')).toHaveLength(1);
    expect(labels.filter((l) => l === 'await')).toHaveLength(1);
  });
});

describe('@eml/lsp logic — spanToRange / spansOverlap', () => {
  it('converts a normal span using line/column for start and positionAt for end', () => {
    const analyzed = analyzeDocument('x^+1\ny^+2\n');
    const span = { start: 5, end: 9, line: 2, column: 1 };
    const range = spanToRange(span, analyzed.scratch);
    expect(range.start).toEqual({ line: 1, character: 0 });
    expect(range.end).toEqual(analyzed.scratch.positionAt(9));
  });

  it('falls back to a 1-char-wide range for a degenerate (start:0,end:0) span', () => {
    const analyzed = analyzeDocument('x^+1\n');
    const range = spanToRange({ start: 0, end: 0, line: 1, column: 1 }, analyzed.scratch);
    expect(range).toEqual({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } });
  });

  it('falls back to a zero-width range at document start when span itself is undefined', () => {
    const analyzed = analyzeDocument('x^+1\n');
    expect(spanToRange(undefined, analyzed.scratch)).toEqual({
      start: { line: 0, character: 0 },
      end: { line: 0, character: 0 },
    });
  });

  it('position accuracy survives CRLF line endings (EOL-collapse-only, not Unicode substitution)', () => {
    const src = 'x^+1\r\ny^+2\r\nz^0\r\n';
    const analyzed = analyzeDocument(src);
    const offset = offsetOf(analyzed.normalized, 'z^0');
    const position = analyzed.scratch.positionAt(offset);
    expect(position.line).toBe(2);
    expect(position.character).toBe(0);
  });

  it('spansOverlap is a half-open interval test', () => {
    expect(spansOverlap({ start: 0, end: 5, line: 1, column: 1 }, { start: 4, end: 10, line: 1, column: 5 })).toBe(true);
    expect(spansOverlap({ start: 0, end: 5, line: 1, column: 1 }, { start: 5, end: 10, line: 1, column: 6 })).toBe(false);
  });
});
