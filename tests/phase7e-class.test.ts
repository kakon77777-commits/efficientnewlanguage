import { describe, it, expect } from 'vitest';
import { parse } from '@eml/parser';
import { transpileEmlToPython, analyzeSemantics, classifyLoops } from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import { interpret } from '@eml/interp';
import type { ClassDef, FunctionDef } from '@eml/types';

const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

const COUNTER_SRC =
  'class Counter:\n' +
  '    def __init__(self, start):\n' +
  '        start => self.value\n' +
  '    def increment(self):\n' +
  '        self.value + 1 => self.value\n' +
  '    def get(self):\n' +
  '        return self.value\n' +
  '\n' +
  'Counter(0) => c\n' +
  'c.increment()\n' +
  'c.increment()\n' +
  'c.get() => r\n' +
  'r^0\n';

describe('Phase 7e — parser: class', () => {
  it('parses class Name: with method bodies', () => {
    const ast = parse(COUNTER_SRC);
    const cls = ast.body[0] as ClassDef;
    expect(cls.type).toBe('ClassDef');
    expect(cls.name).toBe('Counter');
    expect(cls.body.map((s) => (s as FunctionDef).name)).toEqual(['__init__', 'increment', 'get']);
  });

  it('a mistaken base-class clause fails loud with a plain E_PARSE (no base-class support)', () => {
    const r = transpileEmlToPython('class Foo(Bar):\n    def m(self):\n        return 1\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });

  it('an empty class body is rejected (mirrors function/if/while/for body enforcement)', () => {
    expect(() => parse('class Foo:\n')).toThrow();
  });
});

describe('Phase 7e — semantic: class + method scoping', () => {
  it('the class name is declared in the enclosing scope (so Counter(...) resolves)', () => {
    const r = transpileEmlToPython(COUNTER_SRC);
    expect(r.ok).toBe(true);
    expect(r.metadata.declaredNames).toContain('Counter');
  });

  it('method names never leak into module-scope declaredNames', () => {
    const r = transpileEmlToPython(COUNTER_SRC);
    expect(r.ok).toBe(true);
    expect(r.metadata.declaredNames).not.toContain('__init__');
    expect(r.metadata.declaredNames).not.toContain('increment');
    expect(r.metadata.declaredNames).not.toContain('get');
  });

  it('W_CLASS_REDECLARED fires when a class name is redeclared in the same scope', () => {
    const r = transpileEmlToPython('class A:\n    def m(self):\n        return 1\nclass A:\n    def n(self):\n        return 2\n');
    expect(r.diagnostics.find((d) => d.code === 'W_CLASS_REDECLARED')).toBeDefined();
  });

  it('E_CLASS_BODY_UNSUPPORTED fires for a class-body statement that is neither a method nor a simple assignment', () => {
    const r = transpileEmlToPython('class Foo:\n    if 1 > 0:\n        x^+1\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.find((d) => d.code === 'E_CLASS_BODY_UNSUPPORTED')).toBeDefined();
  });

  it('a plain class-level assignment is accepted without diagnostics', () => {
    const r = transpileEmlToPython('class Foo:\n    x^+1\n    def m(self):\n        return 1\n');
    expect(r.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  });

  it("a 'return' inside a method does NOT fire E_RETURN_OUTSIDE_FN (methods count as inFunction)", () => {
    const r = transpileEmlToPython(COUNTER_SRC);
    expect(r.diagnostics.filter((d) => d.code === 'E_RETURN_OUTSIDE_FN')).toEqual([]);
  });

  it('E_ALIAS_COLLISION fires for a method literally named a builtin-shadow alias (list)', () => {
    const r = transpileEmlToPython('class Foo:\n    def list(self):\n        return 1\n');
    expect(r.diagnostics.find((d) => d.code === 'E_ALIAS_COLLISION')).toBeDefined();
  });

  it('E_ALIAS_COLLISION fires for a class literally named a builtin-shadow alias (list)', () => {
    const r = transpileEmlToPython('class list:\n    def m(self):\n        return 1\n');
    expect(r.diagnostics.find((d) => d.code === 'E_ALIAS_COLLISION')).toBeDefined();
  });

  it('W_METHOD_DECORATOR_UNSUPPORTED fires for @cold/@hot/@temporal_loop on a method', () => {
    const r = transpileEmlToPython('class Foo:\n    @cold\n    def m(self):\n        return 1\n');
    expect(r.diagnostics.find((d) => d.code === 'W_METHOD_DECORATOR_UNSUPPORTED')).toBeDefined();
  });

  it('two unrelated classes may each declare __init__ with no W_FN_REDECLARED cross-talk', () => {
    const src = 'class Dog:\n    def __init__(self):\n        1 => self.x\nclass Cat:\n    def __init__(self):\n        2 => self.x\n';
    const r = transpileEmlToPython(src);
    expect(r.diagnostics.filter((d) => d.code === 'W_FN_REDECLARED')).toEqual([]);
  });

  it("THE regression: methods are excluded from fnRecords entirely — metadata.functions stays empty for a program with only classes (the mechanism that would let two classes' same-named methods collide never runs)", () => {
    const src =
      'class Dog:\n    def __init__(self):\n        "woof" => self.sound\n    def speak(self):\n        return self.sound\n' +
      'class Cat:\n    def __init__(self):\n        "meow" => self.sound\n    def speak(self):\n        return self.sound\n';
    const r = transpileEmlToPython(src);
    expect(r.ok).toBe(true);
    expect(r.metadata.functions).toEqual([]);
  });
});

describe('Phase 7e — emitter', () => {
  it('emits class Name: with indented methods 1:1', () => {
    const r = transpileEmlToPython(COUNTER_SRC);
    expect(r.python).toContain('class Counter:');
    expect(r.python).toContain('    def __init__(self, start):');
    expect(r.python).toContain('        self.value = start');
    expect(r.python).toContain('    def increment(self):');
    expect(r.python).toContain('    def get(self):');
  });

  it('instantiation (Foo(args)) emits as an ordinary call — no special-casing needed', () => {
    const r = transpileEmlToPython(COUNTER_SRC);
    expect(r.python).toContain('c = Counter(0)');
  });

  it('a @cold method emits WITHOUT @functools.cache (stripped — methods are not analyzed for caching this round)', () => {
    const r = transpileEmlToPython('class Foo:\n    @cold\n    def m(self):\n        return 1\n');
    expect(r.python).not.toContain('@functools.cache');
    expect(r.python).toContain('def m(self):');
  });

  it('a @hot method emits WITHOUT the hot marker comment', () => {
    const r = transpileEmlToPython('class Foo:\n    @hot\n    def m(self):\n        return 1\n');
    expect(r.python).not.toContain('@hot');
    expect(r.python).not.toContain('dynamic state');
  });
});

describe('Phase 7e — loop-classifier / CTS: methods are opaque to loop metadata', () => {
  it('a Σ nested inside a method body produces NO loop-classifier entry (methods are excluded this round)', () => {
    const program = parse('class Foo:\n    def m(self):\n        Σ(i^2, i in [1:5]) => r\n        return r\n');
    expect(classifyLoops(program, [])).toEqual([]);
  });

  it('exposes class.def through generateCts as one flat top-level node', () => {
    const semantic = analyzeSemantics(parse(COUNTER_SRC));
    const r = transpileEmlToPython(COUNTER_SRC);
    const cts = generateCts({
      fileName: 't.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
    });
    const classNode = cts.nodes.find((n) => n.semanticType === 'class.def');
    expect(classNode).toBeDefined();
    expect(classNode!.python).toContain('class Counter:');
  });
});

describe('Phase 7e — interpreter: construction, method dispatch, instance attrs', () => {
  it('constructs an instance, mutates self.value via methods, and reads it back', () => {
    const r = interpret(COUNTER_SRC, { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('2\n');
  });

  it('two instances of the same class carry independent state', () => {
    const src =
      'class Counter:\n    def __init__(self, start):\n        start => self.value\n    def increment(self):\n        self.value + 1 => self.value\n\n' +
      'Counter(0) => a\nCounter(100) => b\na.increment()\nb.increment()\nb.increment()\na.value => x\nb.value => y\nx^0\ny^0\n';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('1\n102\n');
  });

  it('a class with no __init__ constructs a valid empty instance with zero args', () => {
    const r = interpret('class Empty:\n    def noop(self):\n        return 1\n\nEmpty() => e\ne.noop() => r\nr^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('1\n');
  });

  it('a class with no __init__ raises TypeError when constructed with extra args', () => {
    const r = interpret('class Empty:\n    def noop(self):\n        return 1\n\nEmpty(1, 2) => e\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('TypeError');
  });

  it('calling an undefined method on an instance raises AttributeError', () => {
    const r = interpret('class C:\n    def __init__(self):\n        1 => self.x\n\nC() => c\nc.nope()\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('AttributeError');
  });

  it('reading a missing instance attribute raises AttributeError', () => {
    const r = interpret('class C:\n    def __init__(self):\n        1 => self.x\n\nC() => c\nc.y => r\nr^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('AttributeError');
  });

  it('two classes with an identically-named method dispatch independently at runtime (no collision)', () => {
    const src =
      'class Dog:\n    def __init__(self):\n        "woof" => self.sound\n    def speak(self):\n        return self.sound\n' +
      'class Cat:\n    def __init__(self):\n        "meow" => self.sound\n    def speak(self):\n        return self.sound\n\n' +
      'Dog() => d\nCat() => cat\nd.speak() => a\ncat.speak() => b\na^0\nb^0\n';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('woof\nmeow\n');
  });

  it('printing a bare instance uses a stable placeholder repr (no fabricated memory address)', () => {
    const r = interpret('class Foo:\n    def __init__(self):\n        1 => self.x\n\nFoo() => f\nf^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('<Foo object>\n');
  });
});
