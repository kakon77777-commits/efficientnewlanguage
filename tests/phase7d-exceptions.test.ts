import { describe, it, expect } from 'vitest';
import { parse } from '@eml/parser';
import { transpileEmlToPython, analyzeSemantics, checkPurity, classifyLoops } from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import { interpret } from '@eml/interp';
import type { TryStatement, FunctionDef } from '@eml/types';

const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

describe('Phase 7d — parser: try / except / finally / raise', () => {
  it('parses a bare except: (catch-all, no type)', () => {
    const ast = parse('try:\n    x^+1\nexcept:\n    y^+1\n');
    const stmt = ast.body[0] as TryStatement;
    expect(stmt.handlers[0]).toMatchObject({ type: 'ExceptHandler', exceptionType: undefined, name: undefined });
  });

  it('parses except ExceptionType:', () => {
    const ast = parse('try:\n    x^+1\nexcept ValueError:\n    y^+1\n');
    const stmt = ast.body[0] as TryStatement;
    expect(stmt.handlers[0]).toMatchObject({ exceptionType: 'ValueError', name: undefined });
  });

  it('parses except ExceptionType as name:', () => {
    const ast = parse('try:\n    x^+1\nexcept ValueError as e:\n    y^+1\n');
    const stmt = ast.body[0] as TryStatement;
    expect(stmt.handlers[0]).toMatchObject({ exceptionType: 'ValueError', name: 'e' });
  });

  it('parses multiple handlers and a finally clause, in order', () => {
    const ast = parse('try:\n    x^+1\nexcept ValueError:\n    y^+1\nexcept TypeError:\n    y^+2\nfinally:\n    z^+1\n');
    const stmt = ast.body[0] as TryStatement;
    expect(stmt.handlers).toHaveLength(2);
    expect(stmt.handlers[0]!.exceptionType).toBe('ValueError');
    expect(stmt.handlers[1]!.exceptionType).toBe('TypeError');
    expect(stmt.finallyBody).toHaveLength(1);
  });

  it('parses try/finally with no except clause', () => {
    const r = transpileEmlToPython('try:\n    x^+1\nfinally:\n    x^+2\n');
    expect(r.ok).toBe(true);
  });

  it("rejects a bare 'try:' with neither except nor finally", () => {
    const r = transpileEmlToPython('try:\n    x^+1\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });

  it('parses bare raise and raise <expression>', () => {
    const ast1 = parse('raise\n');
    expect(ast1.body[0]!.type).toBe('Raise');
    expect((ast1.body[0] as { exception?: unknown }).exception).toBeUndefined();
    const ast2 = parse('raise ValueError("bad")\n');
    expect(ast2.body[0]).toMatchObject({ type: 'Raise', exception: { type: 'Call' } });
  });
});

describe('Phase 7d — semantic: branch-scoped declares (the critical regression, generalized from if/else)', () => {
  it('the try body and an except handler each independently resolve a shared new name to Assignment, not AugmentedAssign', () => {
    const src = 'try:\n    y^+1\nexcept ValueError:\n    y^+2\ny^0\n';
    const ast = analyzeSemantics(parse(src)).program;
    const tryStmt = ast.body[0] as TryStatement;
    expect(tryStmt.body[0]).toMatchObject({ type: 'Assignment', declares: true });
    expect(tryStmt.handlers[0]!.body[0]).toMatchObject({ type: 'Assignment', declares: true });
  });

  it('a name declared in both try and except is visible as declared after the whole try statement', () => {
    const r = transpileEmlToPython('try:\n    y^+1\nexcept ValueError:\n    y^+2\ny^0\n');
    expect(r.ok).toBe(true);
    expect(r.metadata.declaredNames).toContain('y');
  });

  it("a handler's `as name` binding does NOT escape into the outer scope (matches Python's implicit `del` on except exit)", () => {
    const r = transpileEmlToPython('try:\n    10 / 0 => x\nexcept ZeroDivisionError as e:\n    0 => x\nx^0\n');
    expect(r.ok).toBe(true);
    expect(r.metadata.declaredNames).not.toContain('e');
  });

  it('break/continue inside a try body/handler are recognized as legal when the try is inside a loop', () => {
    const r = transpileEmlToPython('while 1 > 0:\n    try:\n        break\n    except ValueError:\n        continue\n');
    expect(r.diagnostics.filter((d) => d.code === 'E_BREAK_OUTSIDE_LOOP')).toHaveLength(0);
    expect(r.diagnostics.filter((d) => d.code === 'E_CONTINUE_OUTSIDE_LOOP')).toHaveLength(0);
  });

  it('break/continue inside a try NOT inside a loop still fire the outside-loop diagnostics', () => {
    const r1 = transpileEmlToPython('try:\n    break\nexcept ValueError:\n    x^+1\n');
    expect(r1.diagnostics.find((d) => d.code === 'E_BREAK_OUTSIDE_LOOP')).toBeDefined();
    const r2 = transpileEmlToPython('try:\n    x^+1\nexcept ValueError:\n    continue\n');
    expect(r2.diagnostics.find((d) => d.code === 'E_CONTINUE_OUTSIDE_LOOP')).toBeDefined();
  });
});

describe('Phase 7d — emitter', () => {
  it('emits try/except-as/finally 1:1', () => {
    const r = transpileEmlToPython('try:\n    x^+1\nexcept ValueError as e:\n    y^+1\nfinally:\n    z^+1\n');
    expect(r.python).toContain('try:');
    expect(r.python).toContain('except ValueError as e:');
    expect(r.python).toContain('finally:');
  });

  it('emits a bare except: without a type', () => {
    const r = transpileEmlToPython('try:\n    x^+1\nexcept:\n    y^+1\n');
    expect(r.python).toContain('except:');
  });

  it('emits raise / bare raise 1:1', () => {
    const r = transpileEmlToPython(
      'def f():\n    raise ValueError("bad")\n\ndef g():\n    try:\n        f() => r\n        return r\n    except ValueError:\n        raise\n',
    );
    expect(r.python).toContain('raise ValueError("bad")');
    expect(r.python).toContain('        raise');
  });
});

describe('Phase 7d — purity: side effects hidden in try / except / finally', () => {
  it('checkPurity flags a print() hidden inside a try body', () => {
    const fn = parse('def f(x):\n    try:\n        x^0\n        return x\n    except ValueError:\n        return x\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('checkPurity flags a print() hidden inside an except handler', () => {
    const fn = parse('def f(x):\n    try:\n        return x\n    except ValueError:\n        x^0\n        return x\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('checkPurity flags a print() hidden inside a finally block', () => {
    const fn = parse('def f(x):\n    try:\n        return x\n    finally:\n        x^0\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('checkPurity is NOT fooled by a try/except/finally with no hidden side effect', () => {
    const fn = parse('def f(x):\n    try:\n        return x\n    except ValueError:\n        return 0 - 1\n    finally:\n        x^-1\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(true);
  });
});

describe('Phase 7d — loop-classifier / CTS', () => {
  it('classifies a Σ nested inside a try body', () => {
    const program = parse('try:\n    Σ(i^2, i in [1:N]) => r\nfinally:\n    x^+1\n');
    expect(classifyLoops(program, []).some((l) => l.loopKind === 'algebraic_sum')).toBe(true);
  });

  it('classifies a Σ nested inside an except handler', () => {
    const program = parse('try:\n    x^+1\nexcept ValueError:\n    Σ(i^2, i in [1:N]) => r\n');
    expect(classifyLoops(program, []).some((l) => l.loopKind === 'algebraic_sum')).toBe(true);
  });

  it('exposes control.try/control.raise through generateCts', () => {
    const src = 'try:\n    x^+1\nfinally:\n    y^+1\n';
    const r = transpileEmlToPython(src);
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
    });
    expect(cts.nodes.some((n) => n.semanticType === 'control.try')).toBe(true);
  });
});

describe('Phase 7d — interpreter: real try/except/finally/raise execution', () => {
  it('catches a matching exception type', () => {
    const r = interpret('result^+0\ntry:\n    10 / 0 => ignored\nexcept ZeroDivisionError:\n    result^-1\nfinally:\n    result + 100 => result\nresult^0\n', {
      now: FIXED_CLOCK,
    });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('99\n');
  });

  it('the first matching handler wins when multiple are present', () => {
    const r = interpret(
      'try:\n    10 / 0 => x\nexcept ValueError:\n    x^+1\nexcept ZeroDivisionError:\n    x^+2\nexcept Exception:\n    x^+3\nx^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('2\n');
  });

  it('a bare except: catches any PyError', () => {
    const r = interpret('try:\n    10 / 0 => x\nexcept:\n    x^+99\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('99\n');
  });

  it('except Exception: also acts as a catch-all', () => {
    const r = interpret('try:\n    10 / 0 => x\nexcept Exception:\n    x^+99\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('99\n');
  });

  it('does NOT do hierarchical exception matching (documented fidelity gap): ArithmeticError does not catch ZeroDivisionError', () => {
    const r = interpret('try:\n    10 / 0 => x\nexcept ArithmeticError:\n    x^+99\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('ZeroDivisionError');
  });

  it('finally runs on the success path too', () => {
    const r = interpret('log^+0\ntry:\n    1 + 1 => x\nexcept ValueError:\n    log^+1\nfinally:\n    log^+2\nx^0\nlog^0\n', {
      now: FIXED_CLOCK,
    });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('2\n2\n');
  });

  it('finally runs even when the exception is unmatched and propagates', () => {
    const r = interpret('log^+0\ntry:\n    10 / 0 => x\nexcept ValueError:\n    log^+1\nfinally:\n    log^+2\n', {
      now: FIXED_CLOCK,
    });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('ZeroDivisionError');
    // The finally block still ran despite the unhandled exception.
    expect(r.events.some((e) => e.type === 'eml:assign' && (e as { name?: string }).name === 'log')).toBe(true);
  });

  it('raise ValueError("msg") + except-as binds the message (matches str(e) in real Python)', () => {
    const r = interpret(
      'def validate(n):\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    return n\n\ntry:\n    validate(0 - 5) => r\n    r^0\nexcept ValueError as e:\n    e^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('n must be non-negative\n');
  });

  it('raise ExceptionClass (no call, no args) raises with an empty message', () => {
    const r = interpret('try:\n    raise ValueError\nexcept ValueError as e:\n    e^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('\n');
  });

  it('bare raise re-raises the currently-handled exception to an outer handler', () => {
    const r = interpret(
      'try:\n    try:\n        10 / 0 => x\n    except ZeroDivisionError:\n        raise\nexcept ZeroDivisionError:\n    x^+42\nx^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('42\n');
  });

  it('a bare raise with nothing active is a runtime RuntimeError, not a static diagnostic', () => {
    const compiled = transpileEmlToPython('raise\n');
    expect(compiled.ok).toBe(true); // no compile-time complaint — this is a runtime-only concern
    const r = interpret('raise\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('RuntimeError');
  });

  /**
   * This used to assert the OPPOSITE — that `raise e` DEFERRED as Unsupported,
   * because there was no exception object to re-raise: `except ... as e` bound
   * the message STRING, not the exception. Exceptions are real values now, so
   * re-raising works and the deferral is gone.
   */
  it('re-raising a caught exception propagates it, keeping type and message', () => {
    const src =
      'try:\n    try:\n        raise ValueError("original")\n' +
      '    except ValueError as e:\n        raise e\n' +
      'except ValueError as again:\n    str(again)^0\n';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.error, r.error ? `${r.error.type}: ${r.error.message}` : '').toBeUndefined();
    expect(r.unsupported).toEqual([]);
    expect(r.output).toBe('original\n');
  });

  it('an uncaught re-raise faults with the ORIGINAL type, and no longer defers', () => {
    const r = interpret('try:\n    10 / 0 => x\nexcept ZeroDivisionError as e:\n    raise e\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('ZeroDivisionError');
    expect(r.unsupported).toEqual([]);
  });

  it('exception classes are values: comparable, and constructible without raising', () => {
    const src =
      'ValueError("built") => err\nrepr(err)^0\n' +
      'try:\n    raise err\nexcept ValueError as caught:\n' +
      '    str(caught)^0\n    str(ValueError == ValueError)^0\n    str(ValueError == TypeError)^0\n';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.error, r.error ? `${r.error.type}: ${r.error.message}` : '').toBeUndefined();
    expect(r.output).toBe("ValueError('built')\nbuilt\nTrue\nFalse\n");
  });

  it('two separately built exceptions are NOT equal (identity, as in Python)', () => {
    const src = 'ValueError("x") => a\nValueError("x") => b\nstr(a == b)^0\nstr(a == a)^0\n';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.output).toBe('False\nTrue\n');
  });

  /**
   * `except E as NAME` binds NAME in the CURRENT scope; it does not open a new
   * one. The interpreter used to run the handler body in a throwaway child
   * scope purely so it had somewhere to put NAME, which meant every assignment
   * the handler made was discarded on exit — a counter incremented in a handler
   * silently stayed at its old value. Handlers WITHOUT an `as` clause ran in
   * the enclosing scope and were unaffected, which is why this went unnoticed:
   * it needed the two shapes side by side to be visible at all.
   *
   * examples/retry-until-success is what caught it (its "gave up" tally read 0
   * instead of 1). These pin it directly.
   */
  it('an assignment inside an `except ... as e` handler survives the handler', () => {
    const src = '0 => b\ntry:\n    raise ValueError("x")\nexcept ValueError as e:\n    b + 1 => b\n("b=" + str(b))^0\n';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.error, r.error ? `${r.error.type}: ${r.error.message}` : '').toBeUndefined();
    expect(r.output).toBe('b=1\n'); // the child-scope bug produced 'b=0'
  });

  it('the `as` form and the bare form agree on what the handler changed', () => {
    const withAs = '0 => n\ntry:\n    raise ValueError("x")\nexcept ValueError as e:\n    n + 1 => n\n("n=" + str(n))^0\n';
    const bare = '0 => n\ntry:\n    raise ValueError("x")\nexcept ValueError:\n    n + 1 => n\n("n=" + str(n))^0\n';
    expect(interpret(withAs, { now: FIXED_CLOCK }).output).toBe(interpret(bare, { now: FIXED_CLOCK }).output);
  });

  it('Python deletes the `as` name when the handler ends', () => {
    // Not an accident of the fix — CPython unbinds it unconditionally, so
    // reading it afterwards is a NameError even though it was assigned above.
    const src = 'try:\n    raise ValueError("x")\nexcept ValueError as e:\n    ("inside: " + str(e))^0\nstr(e)^0\n';
    const r = interpret(src, { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('NameError');
  });
});
