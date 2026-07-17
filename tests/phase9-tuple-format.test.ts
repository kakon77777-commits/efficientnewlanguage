import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { interpret } from '@eml/interp';
import { transpilePythonToEml, roundTripFromPython } from '@eml/transpiler-eml';
import type { Expression } from '@eml/types';

/**
 * Phase 9 — language extension, item 3a: tuple literals + the `%`
 * string-formatting operator (real B-6 corpus gap: `Calculate_age`'s
 * `"%s's age is %d years or " % (name, year)`). EML previously had no tuple
 * type at all; `%` on a string previously deferred as Unsupported. `.format()`
 * (item 3b) is a separate, later round — not yet reachable by any of the 5
 * real corpus files. See docs/roadmap.md Phase 9 item 3 / docs/agent-handoff.md.
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

describe('Phase 9 — forward parser: tuple literal vs. plain grouping', () => {
  it('`()` parses as an empty Tuple', () => {
    const ast = parse('()\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'Tuple', elements: [] });
  });

  it('`(x,)` parses as a real 1-element Tuple (trailing comma required)', () => {
    const ast = parse('(x,)\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({
      type: 'Tuple',
      elements: [{ type: 'Identifier', name: 'x' }],
    });
  });

  it('`(x, y)` parses as a 2-element Tuple', () => {
    const ast = parse('(x, y)\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({
      type: 'Tuple',
      elements: [
        { type: 'Identifier', name: 'x' },
        { type: 'Identifier', name: 'y' },
      ],
    });
  });

  it('`(x)` WITHOUT a comma stays plain grouping — NOT a 1-tuple (matches real Python)', () => {
    const ast = parse('(x)\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'Identifier', name: 'x' });
    expect((stmt.expression as Expression).type).not.toBe('Tuple');
  });
});

describe('Phase 9 — forward emit: Tuple round-trip', () => {
  it('emits an empty tuple as `()`', () => {
    const r = transpileEmlToPython('() => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = ()');
  });

  it('emits a single-element tuple with the required trailing comma', () => {
    const r = transpileEmlToPython('x^+5\n(x,) => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = (x,)');
  });

  it('emits a multi-element tuple without a trailing comma', () => {
    const r = transpileEmlToPython('x^+5\ny^+6\n(x, y) => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = (x, y)');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity: % string-formatting', () => {
  const cases: Array<[string, string, string]> = [
    [
      'name^+"Alice"\nyear^+30\n"%s\'s age is %d" % (name, year) => r\nr^0',
      "Alice's age is 30",
      'Calculate_age-shaped: %s + %d with a 2-element tuple',
    ],
    ['"%s" % 5 => r\nr^0', '5', '%s with a single non-tuple scalar (not wrapped in a tuple)'],
    ['"%s" % (5,) => r\nr^0', '5', '%s with a single-element tuple — identical to the bare-scalar case'],
    ['"%d" % 3.9 => r\nr^0', '3', '%d truncates a float toward zero (3.9 -> 3)'],
    ['0 - 3.9 => x\n"%d" % x => r\nr^0', '-3', '%d truncates toward zero for a negative float (-3.9 -> -3)'],
    ['"%f" % 3.14159265 => r\nr^0', '3.141593', '%f defaults to 6 decimal places'],
    ['"100%%" % () => r\nr^0', '100%', '%% is a literal percent, consuming no argument'],
  ];
  for (const [src, expected, label] of cases) {
    it(label, () => {
      const r = transpileEmlToPython(src);
      expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
      expect(pythonStdout(r.python)).toBe(expected);
      expect(interpret(src).output.trimEnd()).toBe(expected);
    });
  }
});

describe('Phase 9 — interpreter: real Python error messages for %-formatting', () => {
  it('too few arguments raises the exact real-Python message', () => {
    const r = interpret('"%d %d" % (1,) => r\nr^0');
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toBe('not enough arguments for format string');
  });

  it('too many arguments raises the exact real-Python message', () => {
    const r = interpret('"%d" % (1, 2) => r\nr^0');
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toBe('not all arguments converted during string formatting');
  });

  it('a non-string left operand with a string right operand raises the real cross-type TypeError', () => {
    const r = interpret('a^+5\nb^+"x"\na % b => r\nr^0');
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toBe("unsupported operand type(s) for %: 'int' and 'str'");
  });

  it('%d on a non-numeric value raises the real-Python message', () => {
    const r = interpret('"%d" % "x" => r\nr^0');
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toBe('%d format: a real number is required, not str');
  });
});

describe('Phase 9 — C++ prototype backend', () => {
  it('rejects a Tuple literal with E_CPP_UNSUPPORTED', () => {
    const r = transpileEmlToCpp('(1, 2) => r\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });

  it('self-recursion hidden inside a tuple literal is caught by the recursion pre-pass, not just the general tuple rejection', () => {
    // The recursion check (`statementCallsName`/`expressionCallsName`) runs as a
    // pre-pass over the WHOLE function body before any statement is emitted —
    // if it correctly recurses into a Tuple's elements, its "Recursive
    // function" message is what surfaces, not the separate, always-fires
    // "Tuple literals are not supported" message a bare tuple would get. This
    // distinguishes "the pre-pass genuinely found it" from "the tuple itself
    // was rejected anyway" (Tuple is unconditionally unsupported in C++, so
    // both paths produce E_CPP_UNSUPPORTED — the message text is what proves
    // which one fired).
    const r = transpileEmlToCpp('def fact(n):\n    (fact(n), 1) => r\n    return r\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
    expect(r.diagnostics[0]!.message).toContain('Recursive function');
  });
});

describe('Phase 9 — interpreter: tuple value semantics', () => {
  it('truthy: empty tuple is falsy, non-empty is truthy', () => {
    const src = (tuple: string) => `${tuple} => t\none^+1\nzero^+0\nif t:\n    one^0\nelse:\n    zero^0`;
    expect(interpret(src('()')).output.trimEnd()).toBe('0');
    expect(interpret(src('(1,)')).output.trimEnd()).toBe('1');
  });

  it('equality: a tuple never equals a list with the same elements (real Python semantics)', () => {
    expect(interpret('(1, 2) == [1, 2] => r\nr^0').output.trimEnd()).toBe('False');
    expect(interpret('(1, 2) == (1, 2) => r\nr^0').output.trimEnd()).toBe('True');
  });

  it('iteration: `for x in (a, b, c):` visits every element', () => {
    const src = 'total^+0\nfor x in (1, 2, 3):\n    total + x => total\ntotal^0';
    expect(interpret(src).output.trimEnd()).toBe('6');
  });

  it('membership: `in` works over a tuple', () => {
    expect(interpret('2 in (1, 2, 3) => r\nr^0').output.trimEnd()).toBe('True');
    expect(interpret('9 in (1, 2, 3) => r\nr^0').output.trimEnd()).toBe('False');
  });

  it('subscript read works on a tuple (including negative indices)', () => {
    expect(interpret('(10, 20, 30)[1] => r\nr^0').output.trimEnd()).toBe('20');
    expect(interpret('(10, 20, 30)[0-1] => r\nr^0').output.trimEnd()).toBe('30');
  });

  it('str()/repr(): single-element tuple keeps its trailing comma, others do not', () => {
    expect(interpret('(1,) => t\nt^0').output.trimEnd()).toBe('(1,)');
    expect(interpret('(1, 2) => t\nt^0').output.trimEnd()).toBe('(1, 2)');
    expect(interpret('() => t\nt^0').output.trimEnd()).toBe('()');
  });
});

describe('Phase 9 — reverse Python->EML: tuple + % round-trip', () => {
  it('a clean `%s`/`%d` + tuple print statement round-trips (isolated from the corpus line\'s separate end= gap)', () => {
    // `^0` output requires a bare identifier (a pre-existing, documented EML
    // limitation, unrelated to this round) — bind the formatted result first,
    // mirroring how every prior phase's round-trip tests handle this.
    const py = 'a = "x"\nb = 5\nr = "%s and %d" % (a, b)\nprint(r)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('emits a bare Python tuple literal verbatim (no Unicode/sigil substitution)', () => {
    const r = transpilePythonToEml('t = (1, 2)\nprint(t)\n');
    expect(r.ok, r.error).toBe(true);
    expect(r.eml).toContain('(1, 2)');
  });
});
