import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { interpret } from '@eml/interp';
import { roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Phase 9 — language extension, item 6: `with` / context managers (real B-6
 * corpus gap: `Duplicate_files_remover`'s `with open(filename, 'rb') as
 * file:`). Single context-manager, single optional `as` target only (Python's
 * multi-context `with a() as x, b() as y:` form is out of scope — not
 * corpus-driven). No built-in context manager (like a real `open()` file
 * handle) is modeled; the interpreter dispatches REAL `__enter__`/`__exit__`
 * methods on a user-defined class instance (Phase 7e), matching real Python's
 * protocol and its exact TypeError wording — verified directly against the
 * installed Python before implementing, not assumed. See docs/agent-
 * handoff.md "Phase 9" section, item 6.
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

describe('Phase 9 — forward parser: with statement', () => {
  it('parses `with EXPR:` (no target) into a With node', () => {
    const ast = parse('with x:\n    y^0\n');
    const stmt = ast.body[0] as { type: string; contextExpr?: unknown; target?: unknown };
    expect(stmt.type).toBe('With');
    expect(stmt.contextExpr).toMatchObject({ type: 'Identifier', name: 'x' });
    expect(stmt.target).toBeUndefined();
  });

  it('parses `with EXPR as NAME:` with a target', () => {
    const ast = parse('with x as y:\n    y^0\n');
    const stmt = ast.body[0] as { type: string; target?: { name: string } };
    expect(stmt.type).toBe('With');
    expect(stmt.target).toMatchObject({ type: 'Identifier', name: 'y' });
  });
});

describe('Phase 9 — forward emit: with round-trips as plain Python-identical syntax', () => {
  it('emits `with x as y:` verbatim', () => {
    const r = transpileEmlToPython('cm^+0\nwith cm as y:\n    y^0\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('with cm as y:');
  });

  it('emits `with x:` (no target) verbatim', () => {
    const r = transpileEmlToPython('cm^+0\nwith cm:\n    cm^0\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('with cm:');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity: __enter__/__exit__ protocol', () => {
  it('normal completion: enter/exit both run, target bound to __enter__\'s return value', () => {
    const src =
      'class Ctx:\n' +
      '    def __enter__(self):\n' +
      '        42 => self.v\n' +
      '        return self.v\n' +
      '    def __exit__(self, exc_type, exc_val, exc_tb):\n' +
      '        return 0\n\n' +
      'Ctx() => c\n' +
      'with c as x:\n' +
      '    x^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('42');
    expect(interpret(src).output.trimEnd()).toBe('42');
  });

  it('an exception raised in the body is passed to __exit__ and still propagates when not suppressed', () => {
    const src =
      'class Ctx:\n' +
      '    def __enter__(self):\n' +
      '        return 0\n' +
      '    def __exit__(self, exc_type, exc_val, exc_tb):\n' +
      '        exc_type => self.seen\n' +
      '        return 0\n\n' +
      'Ctx() => c\n' +
      'try:\n' +
      '    with c as x:\n' +
      '        raise ValueError("boom")\n' +
      'except ValueError as e:\n' +
      '    e^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('boom');
    expect(interpret(src).output.trimEnd()).toBe('boom');
  });

  it('__exit__ returning truthy suppresses the propagating exception', () => {
    const src =
      'class Suppress:\n' +
      '    def __enter__(self):\n' +
      '        return 0\n' +
      '    def __exit__(self, exc_type, exc_val, exc_tb):\n' +
      '        return 1\n\n' +
      'Suppress() => s\n' +
      'with s:\n' +
      '    raise ValueError("should be suppressed")\n' +
      '"after suppression, no exception" => msg\n' +
      'msg^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('after suppression, no exception');
    expect(interpret(src).output.trimEnd()).toBe('after suppression, no exception');
  });
});

describe('Phase 9 — interpreter: real-Python TypeError messages for the context-manager protocol', () => {
  it('a plain non-instance value (missing both methods) reports "missed __exit__ method" first', () => {
    const r = interpret('5 => v\nwith v as x:\n    x^0\n');
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toBe("'int' object does not support the context manager protocol (missed __exit__ method)");
  });

  it('an instance with __enter__ but no __exit__ reports "missed __exit__ method"', () => {
    const src = 'class HasEnterOnly:\n    def __enter__(self):\n        return self\n\nHasEnterOnly() => h\nwith h as x:\n    x^0\n';
    const r = interpret(src);
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toBe("'HasEnterOnly' object does not support the context manager protocol (missed __exit__ method)");
  });

  it('an instance with __exit__ but no __enter__ reports "missed __enter__ method"', () => {
    const src = 'class HasExitOnly:\n    def __exit__(self, a, b, c):\n        return 0\n\nHasExitOnly() => h\nwith h as x:\n    x^0\n';
    const r = interpret(src);
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toBe("'HasExitOnly' object does not support the context manager protocol (missed __enter__ method)");
  });
});

describe('Phase 9 — C++ prototype backend', () => {
  it('rejects a with statement with E_CPP_UNSUPPORTED', () => {
    const r = transpileEmlToCpp('cm^+0\nwith cm as y:\n    y^0\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });

  it('self-recursion hidden inside a with body is still rejected (statementCallsName must not miss it)', () => {
    const r = transpileEmlToCpp('def fact(n):\n    with n:\n        fact(n) => r\n    return r\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });
});

describe('Phase 9 — reverse Python->EML: with round-trip', () => {
  it('a Duplicate_files_remover-shaped `with open(...) as file:` snippet round-trips', () => {
    const py =
      'def hashFile(filename):\n' +
      '    hasher = 0\n' +
      '    with open(filename, "rb") as file:\n' +
      '        buf = file.read(65536)\n' +
      '        hasher = buf\n' +
      '    return hasher\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a bare `with` (no `as` target) round-trips', () => {
    const py = 'lock = 1\nwith lock:\n    x = 1\n    print(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('the `as` target stays bound after the with-block (matches for-loop target semantics)', () => {
    const py = 'lock = 1\nwith lock as file:\n    x = 1\nprint(file)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});
