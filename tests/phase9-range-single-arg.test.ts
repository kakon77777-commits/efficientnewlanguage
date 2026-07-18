import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parsePython, roundTripFromPython } from '@eml/transpiler-eml';
import { interpret } from '@eml/interp';

/**
 * Phase 9 — language extension: Python's `range(n)` single-argument shorthand
 * (real B-6 corpus gap: `text_to_morse_code`'s `for i in range(length):`,
 * line 38, its blocker after the multi-line-bracket round). Reverse-only,
 * matching `range(a, b)`'s own existing treatment — forward EML has no
 * `range(...)` call syntax at all (it uses `[a:b]` directly). No new AST
 * node: `range(n)` produces the SAME `RangeExpression` shape as `range(0,
 * n)`, just with an implicit literal `0` start — confirmed the smallest of
 * the three candidates left after Phase 9's originally-numbered items closed
 * out (vs. Python slice syntax and list comprehensions, both of which need a
 * new Expression node threaded through the full 7-walker/interpreter/
 * 3-emitter vertical slice). No 3-arg step form — EML's own `[a:b]` Range has
 * no step concept, and no real corpus file uses one. See docs/agent-
 * handoff.md "Phase 9" section.
 */

function resolvePython(): string | null {
  const cands = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of cands) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return c;
  }
  return null;
}
const PYTHON = resolvePython();
function pythonStdout(py: string): string {
  const r = spawnSync(PYTHON!, ['-c', py], { encoding: 'utf8' });
  if (r.error) throw r.error;
  expect(r.status, `python exited non-zero:\n${r.stderr}`).toBe(0);
  return r.stdout.replace(/\r\n/g, '\n').trimEnd();
}

describe('Phase 9 — reverse parser: range(n) single-argument shorthand', () => {
  it('`range(n)` parses to the same Range shape as `range(0, n)`', () => {
    const single = parsePython('for i in range(5):\n    x = i\n');
    const double = parsePython('for i in range(0, 5):\n    x = i\n');
    const singleStmt = single.body[0] as { iterable: unknown };
    const doubleStmt = double.body[0] as { iterable: unknown };
    expect(singleStmt.iterable).toEqual(doubleStmt.iterable);
  });

  it('the existing 2-argument form `range(a, b)` still works unchanged', () => {
    const ast = parsePython('for i in range(2, 5):\n    x = i\n');
    const stmt = ast.body[0] as { iterable: { type: string; start: unknown; end: unknown } };
    expect(stmt.iterable).toMatchObject({
      type: 'Range',
      start: { type: 'NumberLiteral', value: 2 },
      end: { type: 'NumberLiteral', value: 4 }, // toInclusiveEnd(5) -> 4
    });
  });

  it('`range(n)` has an implicit start of literal 0', () => {
    const ast = parsePython('for i in range(5):\n    x = i\n');
    const stmt = ast.body[0] as { iterable: { type: string; start: unknown; end: unknown } };
    expect(stmt.iterable).toMatchObject({
      type: 'Range',
      start: { type: 'NumberLiteral', value: 0 },
      end: { type: 'NumberLiteral', value: 4 }, // toInclusiveEnd(5) -> 4
    });
  });
});

describe('Phase 9 — interpreter: range(0) is a genuinely empty iteration', () => {
  it('`for i in range(0):` runs zero times, matching real Python', () => {
    const src = 'total^+0\nfor i in [0:0-1]:\n    total + 1 => total\ntotal^0';
    // [0:0-1] is EML's own way to write an empty inclusive range (0 to -1) —
    // exactly what range(0) reverse-transpiles into.
    expect(interpret(src).output.trimEnd()).toBe('0');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity: range(n)', () => {
  it('summing range(5) matches real Python', () => {
    const py = 'total = 0\nfor i in range(5):\n    total = total + i\nprint(total)\n';
    expect(pythonStdout(py)).toBe('10'); // 0+1+2+3+4
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});

describe('Phase 9 — reverse Python->EML: range(n) round-trip', () => {
  it('a text_to_morse_code-shaped `for i in range(length):` snippet round-trips', () => {
    const py = 'length = 5\nfor i in range(length):\n    x = i\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});
