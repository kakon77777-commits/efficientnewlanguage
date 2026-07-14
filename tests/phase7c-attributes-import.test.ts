import { describe, it, expect } from 'vitest';
import { parse } from '@eml/parser';
import { transpileEmlToPython, analyzeSemantics, checkPurity } from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import { interpret } from '@eml/interp';
import type { AssignmentStatement, ImportStatement, FunctionDef, FunctionCall } from '@eml/types';

const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

describe('Phase 7c — parser: attribute access', () => {
  it('parses obj.attr as an Attribute expression', () => {
    const ast = parse('math^+1\nmath.pi => x\n');
    const stmt = ast.body[1] as AssignmentStatement;
    expect(stmt.value).toMatchObject({ type: 'Attribute', object: { type: 'Identifier', name: 'math' }, attr: 'pi' });
  });

  it('parses obj.method(args) as a Call over an Attribute callee', () => {
    const ast = parse('import math\nmath.sqrt(4) => x\n');
    const stmt = ast.body[1] as AssignmentStatement;
    const call = stmt.value as FunctionCall;
    expect(call.type).toBe('Call');
    expect(call.callee).toMatchObject({ type: 'Attribute', object: { type: 'Identifier', name: 'math' }, attr: 'sqrt' });
  });

  it('parses a chained attribute (obj.a.b)', () => {
    const ast = parse('x^+1\nobj.a.b => y\n');
    const stmt = ast.body[1] as AssignmentStatement;
    expect(stmt.value).toMatchObject({
      type: 'Attribute',
      attr: 'b',
      object: { type: 'Attribute', attr: 'a', object: { type: 'Identifier', name: 'obj' } },
    });
  });

  it('parses an Attribute target on the reversed arrow form (v => obj.attr)', () => {
    const ast = parse('obj^+1\n5 => obj.value\n');
    const stmt = ast.body[1] as AssignmentStatement;
    expect(stmt.target).toMatchObject({ type: 'Attribute', object: { type: 'Identifier', name: 'obj' }, attr: 'value' });
  });

  it('parses an Attribute target with the compound-assign form (obj.attr += v)', () => {
    const ast = parse('obj^+1\nobj.value += 5\n');
    const stmt = ast.body[1];
    expect(stmt).toMatchObject({
      type: 'AugmentedAssign',
      op: '+',
      target: { type: 'Attribute', object: { type: 'Identifier', name: 'obj' }, attr: 'value' },
    });
  });
});

describe('Phase 7c — parser: import', () => {
  it('parses import module', () => {
    const ast = parse('import math\n');
    expect(ast.body[0]).toMatchObject({ type: 'Import', module: 'math' });
  });

  it('rejects a dotted module path (import os.path)', () => {
    const r = transpileEmlToPython('import os.path\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });

  it('rejects `as` aliasing (import math as m)', () => {
    const r = transpileEmlToPython('import math as m\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });

  it('rejects `from x import y`', () => {
    const r = transpileEmlToPython('from math import sqrt\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });
});

describe('Phase 7c — semantic', () => {
  it('an Attribute-target Assignment always has declares:false', () => {
    const src = 'obj^+1\n5 => obj.value\n';
    const semantic = analyzeSemantics(parse(src));
    const stmt = semantic.program.body[1] as AssignmentStatement;
    expect(stmt.declares).toBe(false);
  });

  it('records imported module names in metadata.importedModules', () => {
    const r = transpileEmlToPython('import math\nimport random\n');
    expect(r.metadata.importedModules).toEqual(['math', 'random']);
  });

  it('an Import statement is emitted in-place, not hoisted', () => {
    const r = transpileEmlToPython('x^+1\nimport math\nx^0\n');
    const lines = r.python.trim().split('\n');
    expect(lines).toEqual(['x = 1', 'import math', 'print(x)']);
  });
});

describe('Phase 7c — emitter', () => {
  it('emits obj.attr 1:1', () => {
    const r = transpileEmlToPython('import math\nmath.pi => x\nx^0\n');
    expect(r.python).toContain('x = math.pi');
  });

  it('emits obj.method(args) 1:1, without aliasing the attribute name', () => {
    const r = transpileEmlToPython('import math\nmath.sqrt(4) => x\nx^0\n');
    expect(r.python).toContain('x = math.sqrt(4)');
  });

  it('aliases an Identifier object the same way whether read via Attribute or Subscript', () => {
    const r = transpileEmlToPython('list^+[1,2,3]\nlist.count(1) => n\n');
    expect(r.python).toContain('n = lst.count(1)');
  });

  it('parenthesizes an attribute object that binds looser than postfix', () => {
    const r = transpileEmlToPython('a^+1\nb^+2\n(a + b).bit_length() => n\n');
    expect(r.ok).toBe(true);
    expect(r.python).toContain('n = (a + b).bit_length()');
  });
});

describe('Phase 7c — purity / importance', () => {
  it('checkPurity treats ANY attribute call as a potential side effect (conservative default)', () => {
    const fn = parse('def f():\n    import math\n    math.sqrt(4) => x\n    return x\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('a @cold function calling an attribute method warns W_COLD_SIDE_EFFECT', () => {
    const r = transpileEmlToPython('import math\n@cold\ndef f(x):\n    math.sqrt(x) => r\n    return r\n');
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT')).toBeDefined();
  });

  it('importance counts an attribute call keyed by its dotted name (no bare-name collision)', () => {
    // A user function named `sqrt` must not be conflated with `math.sqrt`.
    const src =
      'import math\ndef sqrt(x):\n    return x\n\n@cold\ndef f(x):\n    math.sqrt(x) => a\n    sqrt(x) => b\n    return a\n';
    const r = transpileEmlToPython(src);
    const userSqrt = r.metadata.functions.find((f) => f.name === 'sqrt')!;
    // The user `sqrt` is called exactly once (by `f`) — the `math.sqrt` call
    // must NOT have inflated its count.
    expect(userSqrt.importance.callFrequency).toBe(1);
  });
});

describe('Phase 7c — CTS', () => {
  it('exposes control.import through generateCts', () => {
    const src = 'import math\n';
    const r = transpileEmlToPython(src);
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
    });
    expect(cts.nodes.some((n) => n.semanticType === 'control.import')).toBe(true);
  });
});

describe('Phase 7c — interpreter: real behavior (defer, not crash or fabricate)', () => {
  it('a program that imports a module but never uses it runs cleanly', () => {
    const r = interpret('import math\nx^+5\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('5\n');
  });

  it('calling an attribute-qualified function defers as Unsupported (not a crash, not a fabricated value)', () => {
    const r = interpret('import math\nmath.sqrt(4) => x\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.output).toBe('');
    expect(r.unsupported.length).toBeGreaterThan(0);
    expect(r.events.some((e) => e.type === 'eml:unsupported')).toBe(true);
  });

  it('reading a bare attribute (not a call) also defers as Unsupported', () => {
    const r = interpret('import math\nmath.pi => x\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.unsupported.length).toBeGreaterThan(0);
  });

  it('a call on a built-in container (list.append) also defers as Unsupported (not modeled this round)', () => {
    const r = interpret('list^+[1,2,3]\nlist.append(4)\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.unsupported.length).toBeGreaterThan(0);
  });
});
