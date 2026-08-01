import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';

/**
 * STATEMENT-LEVEL INTERACTION - differential gate against real CPython.
 *
 * The fourth measured axis, and the first that is about ORDER rather than
 * value. The three before it (syntax constructs, builtin argument shapes,
 * operator x operand-type) are all expression-shaped: they can report that
 * every construct is used and every operator pairing agrees, and still not
 * notice that `finally` must override a `return`, that `break` has to run
 * `__exit__` on its way out of a `with`, or that a closure captures a
 * variable rather than the value it held at capture time.
 *
 * Sweeping 32 such interactions found four defects:
 *
 *   pass had no statement form   the forward parser read it as an Identifier;
 *                                the Python emitter printed that identifier
 *                                and it happened to be correct Python, so only
 *                                the interpreter - which resolves names for
 *                                real - objected. The REVERSE parser had
 *                                refused `pass` for exactly this reason since
 *                                Phase D and said so in a comment; the forward
 *                                side never got the matching guard.
 *   class attributes vanished    a class body's non-method statements never
 *                                ran, so `class C: tag = "x"` bound the class
 *                                and lost `tag` entirely.
 *   IndexError message           CPython words reads and writes differently
 *                                ("list index" vs "list assignment index");
 *                                one message served both.
 *   builtin-set boundary         `type(e).__name__` transpiles to Python that
 *                                runs and an interpreter NameError, because
 *                                EML-P defines ten builtins and `type` is not
 *                                one. Asserted below as an explicit boundary
 *                                rather than quietly skipped.
 *
 * A NOTE ON THE HARNESS. The first run of this sweep reported 23 of 32 cases
 * diverging. All 23 were the harness: `io.open(..., "w")` on Windows rewrites
 * newlines, so any program printing more than one line "disagreed". The
 * `newline=""` below is load-bearing - without it this file fails loudly for a
 * reason that has nothing to do with the language.
 */

const PYTHON = (() => {
  const candidates = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
})();

const CASES: {label:string; eml:string}[] = [];
const add = (label: string, eml: string) => CASES.push({ label, eml });

// ---------------------------------------------------------------- try/finally
add('finally runs after return', `
def f():
    try:
        return "from-try"
    finally:
        "finally ran"^0
f()^0
`);

add('finally overrides return', `
def f():
    try:
        return "from-try"
    finally:
        return "from-finally"
f()^0
`);

add('finally runs when except returns', `
def f():
    try:
        raise ValueError("x")
    except ValueError:
        return "from-except"
    finally:
        "finally ran"^0
f()^0
`);

add('finally runs on uncaught raise, then propagates', `
def f():
    try:
        raise ValueError("boom")
    finally:
        "finally ran"^0
try:
    f()
except ValueError as e:
    ("caught " + str(e))^0
`);

add('finally swallows exception by returning', `
def f():
    try:
        raise ValueError("boom")
    finally:
        return "swallowed"
f()^0
`);

add('nested finally ordering', `
def f():
    try:
        try:
            return "inner"
        finally:
            "inner finally"^0
    finally:
        "outer finally"^0
f()^0
`);

// ------------------------------------------------------- break/continue + try
add('break inside try runs finally', `
for i in [0:3]:
    try:
        if i == 1:
            break
        str(i)^0
    finally:
        ("finally " + str(i))^0
"done"^0
`);

add('continue inside try runs finally', `
for i in [0:3]:
    try:
        if i == 1:
            continue
        str(i)^0
    finally:
        ("finally " + str(i))^0
`);

add('break inside try/except/finally in a while', `
0 => i
while True:
    try:
        i + 1 => i
        if i > 2:
            break
    finally:
        ("f" + str(i))^0
str(i)^0
`);

add('return inside a loop inside try/finally', `
def f():
    for i in [0:5]:
        try:
            if i == 2:
                return i
        finally:
            ("f" + str(i))^0
    return -1
str(f())^0
`);

// -------------------------------------------------------------- with + control
add('with __exit__ runs on break', `
class Guard:
    def __init__(self, name):
        name => self.name
    def __enter__(self):
        ("enter " + self.name)^0
        return self
    def __exit__(self, a, b, c):
        ("exit " + self.name)^0
        return False

for i in [0:3]:
    with Guard("g") as g:
        if i == 1:
            break
        str(i)^0
"done"^0
`);

add('with __exit__ runs on return', `
class Guard:
    def __enter__(self):
        "enter"^0
        return self
    def __exit__(self, a, b, c):
        "exit"^0
        return False

def f():
    with Guard() as g:
        return "returned"
f()^0
`);

add('with __exit__ runs on exception and can suppress', `
class Swallow:
    def __enter__(self):
        return self
    def __exit__(self, a, b, c):
        "exit saw the error"^0
        return True

with Swallow() as s:
    raise ValueError("boom")
"still running"^0
`);

add('nested with exits in reverse order', `
class G:
    def __init__(self, n):
        n => self.n
    def __enter__(self):
        ("enter " + self.n)^0
        return self
    def __exit__(self, a, b, c):
        ("exit " + self.n)^0
        return False

with G("a") as a:
    with G("b") as b:
        "body"^0
`);

// ------------------------------------------------------------------- closures
add('closure captures the variable, not the value', `
[] => fns
for i in [0:3]:
    def make(n):
        def inner():
            return n
        return inner
    fns + [make(i)] => fns
for f in fns:
    str(f())^0
`);

add('nested function reads enclosing scope at call time', `
def outer():
    1 => x
    def inner():
        return x
    2 => x
    return inner()
str(outer())^0
`);

add('assignment in a function shadows the global', `
5 => x
def f():
    99 => x
    return x
str(f())^0
str(x)^0
`);

add('a function reads a global it does not assign', `
5 => x
def f():
    return x + 1
str(f())^0
`);

// ------------------------------------------------------- loop variable leakage
add('loop variable survives the loop', `
for i in [0:3]:
    pass
str(i)^0
`);

add('loop variable after an empty range', `
0 => i
for i in [0:0]:
    pass
str(i)^0
`);

add('comprehension variable does NOT leak', `
7 => i
[i for i in [0:3]] => squares
str(i)^0
`);

// ----------------------------------------------------------- exception nesting
add('raise inside except propagates the new error', `
try:
    try:
        raise ValueError("first")
    except ValueError:
        raise TypeError("second")
except TypeError as e:
    ("caught " + str(e))^0
`);

add('except order: first matching clause wins', `
try:
    raise ValueError("x")
except TypeError:
    "wrong"^0
except ValueError:
    "right"^0
except Exception:
    "too broad"^0
`);

// `except Exception:` catching a ValueError is the interaction under test.
// Naming the class would be the natural way to show which one was caught, but
// that needs `type()`, which EML-P does not define — see the builtin-set
// boundary block at the bottom of this file, where that difference is asserted
// outright instead of hidden here.
add('bare Exception catches a subclass', `
try:
    raise ValueError("x")
except Exception as e:
    ("caught: " + str(e))^0
`);

add('finally after a re-raise still runs', `
try:
    try:
        raise ValueError("a")
    except ValueError:
        raise
    finally:
        "inner finally"^0
except ValueError as e:
    ("outer " + str(e))^0
`);

// ------------------------------------------------------------ class + methods
add('method resolution: instance attribute shadows class attribute', `
class C:
    "class-level" => tag
    def show(self):
        return self.tag

C() => a
str(a.show())^0
"instance-level" => a.tag
str(a.show())^0
`);

add('writing a class attribute reaches every un-shadowed instance', `
class C:
    "default" => tag
    def show(self):
        return self.tag

C() => a
C() => b
"mine" => a.tag
"changed" => C.tag
str(a.show())^0
str(b.show())^0
str(C.tag)^0
`);

add('__init__ runs once, attributes persist', `
class Counter:
    def __init__(self):
        0 => self.n
    def bump(self):
        self.n + 1 => self.n
        return self.n

Counter() => c
str(c.bump())^0
str(c.bump())^0
str(c.n)^0
`);

// ------------------------------------------------------------ misc statements
add('augmented assignment on a list element', `
[1, 2, 3] => xs
xs[1] + 10 => xs[1]
str(xs)^0
`);

add('augmented assignment on a dict value', `
{"a": 1} => d
d["a"] + 5 => d["a"]
str(d)^0
`);

add('chained assignment through a subscript in a loop', `
[0, 0, 0] => xs
for i in [0:3]:
    i * i => xs[i]
str(xs)^0
`);

add('while/else does not exist here - while with a flag', `
0 => i
False => found
while i < 5:
    if i == 3:
        True => found
        break
    i + 1 => i
str(found)^0
str(i)^0
`);

add('pass as the only statement in each block', `
if True:
    pass
else:
    pass
for i in [0:2]:
    pass
"ok"^0
`);

/**
 * Run EVERY case through ONE CPython process and return its stdout per case.
 *
 * One subprocess per case took 8.6s and blew vitest's 5s default — the gate
 * passed when run alone and timed out inside the full suite, which is the
 * worst way for a check to fail. `tests/operator-matrix.test.ts` had already
 * learned this and says so in its own header; this follows it.
 *
 * Each program gets a FRESH globals dict, so nothing one case defines can leak
 * into the next and make a later case pass for the wrong reason.
 */
function cpythonAll(pythonPrograms: string[], dir: string): string[] {
  const srcFile = join(dir, 'programs.json');
  const outFile = join(dir, 'results.json');
  const esc = (p: string) => p.replace(/\\/g, '\\\\');
  writeFileSync(srcFile, JSON.stringify(pythonPrograms), 'utf8');
  const runner = [
    'import io, json, sys',
    `programs = json.loads(io.open(r"${esc(srcFile)}", encoding="utf-8").read())`,
    'results = []',
    'real_stdout = sys.stdout',
    'for src in programs:',
    '    buf = io.StringIO()',
    '    sys.stdout = buf',
    '    try:',
    '        exec(compile(src, "case.py", "exec"), {"__name__": "__main__"})',
    '    except BaseException as e:',
    '        results.append(buf.getvalue() + "!! " + type(e).__name__ + ": " + str(e))',
    '    else:',
    '        results.append(buf.getvalue())',
    '    finally:',
    '        sys.stdout = real_stdout',
    // newline="" is load-bearing on Windows — see the header.
    `io.open(r"${esc(outFile)}", "w", encoding="utf-8", newline="").write(json.dumps(results))`,
  ].join('\n');
  const runFile = join(dir, 'run.py');
  writeFileSync(runFile, runner, 'utf8');
  const r = spawnSync(PYTHON!, [runFile], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`python harness failed: ${r.stderr}`);
  return JSON.parse(readFileSync(outFile, 'utf8'));
}

/** What this interpreter produces for a program: stdout, or a marked error/defer. */
function emlResult(src: string): string {
  const ir = interpret(src);
  if (ir.error) return `${ir.output ?? ''}!! ${ir.error.type}: ${ir.error.message}`.trim();
  if (!ir.ok) return `~~ DEFER ${(ir.unsupported ?? []).join(',')}`;
  return (ir.output ?? '').trim();
}

describe.skipIf(!PYTHON)('statement-level interaction equals CPython', () => {
  it('every interaction agrees, output and error message alike', () => {
    const dir = mkdtempSync(join(tmpdir(), 'eml-stmt-'));
    try {
      // The Python side is what the TRANSPILER emits, not a hand-written twin
      // that could agree with the interpreter by construction.
      const sources = CASES.map((c) => c.eml.trim() + '\n');
      const programs = sources.map((src, i) => {
        const fwd = transpileEmlToPython(src);
        if (!fwd.ok) throw new Error(`EML could not express case "${CASES[i]!.label}":\n${src}`);
        return fwd.python;
      });
      const expected = cpythonAll(programs, dir);

      const mismatches: string[] = [];
      sources.forEach((src, i) => {
        const actual = emlResult(src);
        if (actual !== expected[i]!.trim()) {
          mismatches.push(
            `${CASES[i]!.label}:\n    cpython=${JSON.stringify(expected[i]!.trim())}\n    eml=    ${JSON.stringify(actual)}`,
          );
        }
      });
      expect(
        mismatches,
        `${mismatches.length} of ${CASES.length} interactions diverge:\n  ${mismatches.join('\n  ')}`,
      ).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

/**
 * The rules this sweep pinned down, stated outright.
 *
 * The differential test above catches a regression in any of them but reports
 * a case label. These say what the RULE is, so a failure explains itself.
 */
describe('rules the statement sweep pinned down', () => {
  const out = (src: string) => interpret(src).output?.trim();

  it('`pass` is a statement, and it is the only way to leave a block empty', () => {
    expect(out('if True:\n    pass\nelse:\n    pass\n"ok"^0')).toBe('ok');
    expect(out('for i in [0:2]:\n    pass\nstr(i)^0')).toBe('2');
  });

  it('a class body runs once; what it binds becomes the class attributes', () => {
    const src = [
      'class C:',
      '    "class-level" => tag',
      '    def show(self):',
      '        return self.tag',
      '',
      'C() => a',
      'C() => b',
      'str(a.show())^0',
      '"instance-level" => a.tag',
      'str(a.show())^0',
      // b never got an instance attribute, so it still sees the class one -
      // assigning through `a` must not reach into every other instance.
      'str(b.show())^0',
    ].join('\n');
    expect(out(src)).toBe('class-level\ninstance-level\nclass-level');
  });

  it('writing a class attribute is a live rebind, not a copy', () => {
    const src = [
      'class C:',
      '    "default" => tag',
      '    def show(self):',
      '        return self.tag',
      '',
      'C() => a',
      'C() => b',
      '"mine" => a.tag', // shadows on `a` only
      '"changed" => C.tag', // must reach `b`, must not reach `a`
      'str(a.show())^0',
      'str(b.show())^0',
    ].join('\n');
    expect(out(src)).toBe('mine\nchanged');
  });

  it('a class attribute can be read off the class itself, and misses say so', () => {
    const cls = 'class C:\n    7 => n\n    def m(self):\n        return 1\n';
    expect(out(cls + 'str(C.n)^0')).toBe('7');
    const r = interpret(cls + 'str(C.missing)^0');
    expect(r.error?.type).toBe('AttributeError');
    expect(r.error?.message).toBe("type object 'C' has no attribute 'missing'");
  });

  it('IndexError words reads and writes differently, exactly as CPython does', () => {
    expect(interpret('[1, 2] => xs\nstr(xs[9])^0').error?.message).toBe('list index out of range');
    expect(interpret('[1, 2] => xs\n0 => xs[9]').error?.message).toBe('list assignment index out of range');
  });

  it('`finally` runs after `return`, and a `return` inside it wins', () => {
    expect(out('def f():\n    try:\n        return "try"\n    finally:\n        "fin"^0\nf()^0')).toBe('fin\ntry');
    expect(out('def f():\n    try:\n        return "try"\n    finally:\n        return "fin"\nf()^0')).toBe('fin');
    // It still runs when the body raises, before the error propagates.
    const src =
      'def f():\n    try:\n        raise ValueError("boom")\n    finally:\n        "fin"^0\n' +
      'try:\n    f()\nexcept ValueError as e:\n    ("caught " + str(e))^0';
    expect(out(src)).toBe('fin\ncaught boom');
  });

  it('`break` runs `finally` on its way out of the loop', () => {
    const src =
      'for i in [0:2]:\n    try:\n        if i == 1:\n            break\n        str(i)^0\n' +
      '    finally:\n        ("f" + str(i))^0';
    expect(out(src)).toBe('0\nf0\nf1');
  });

  it('a `with` block runs `__exit__` on break and on return, not just on fallthrough', () => {
    const guard =
      'class G:\n    def __enter__(self):\n        "enter"^0\n        return self\n' +
      '    def __exit__(self, a, b, c):\n        "exit"^0\n        return False\n';
    expect(out(guard + 'def f():\n    with G() as g:\n        return "done"\nf()^0')).toBe('enter\nexit\ndone');
    expect(out(guard + 'for i in [0:2]:\n    with G() as g:\n        break\n"after"^0')).toBe('enter\nexit\nafter');
  });

  it('the loop variable outlives the loop', () => {
    expect(out('for i in [0:3]:\n    pass\nstr(i)^0')).toBe('3');
  });

  it('a comprehension variable does NOT leak', () => {
    expect(out('7 => i\n[i for i in [0:3]] => sq\nstr(i)^0')).toBe('7');
  });
});

/**
 * KNOWN PROFILE BOUNDARY, asserted rather than skipped.
 *
 * EML-P defines ten builtins. `type` is not among them, so `type(e).__name__`
 * - the ordinary Python way to name an exception class - transpiles to Python
 * that runs and an interpreter NameError. The asymmetry is real, and the
 * `eml:equiv` check inside `eml trace --run` is what catches it in the field.
 *
 * Pinned here so that the day `type()` is added, this test fails and says
 * where to look, instead of the boundary quietly moving.
 */
describe('EML-P builtin-set boundary', () => {
  it('calling a Python builtin EML-P does not define is a NameError', () => {
    const r = interpret('try:\n    raise ValueError("x")\nexcept Exception as e:\n    (type(e).__name__)^0');
    expect(r.error?.type).toBe('NameError');
    expect(r.error?.message).toBe("name 'type' is not defined");
  });

  it('the supported way to report a caught exception is the message itself', () => {
    const src = 'try:\n    raise ValueError("x")\nexcept Exception as e:\n    str(e)^0';
    expect(interpret(src).output?.trim()).toBe('x');
  });
});
