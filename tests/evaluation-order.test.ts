import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';

/**
 * EVALUATION ORDER WITHIN AN EXPRESSION - differential gate against real
 * CPython. The fourteenth measured axis.
 *
 * Axis 4 (statement-level interaction) is about order BETWEEN statements:
 * whether `finally` overrides a `return`, whether `break` runs `__exit__`.
 * It cannot see order INSIDE one expression, and it was checked before this
 * file was written - the try/finally unwinding this axis was originally going
 * to sweep is already covered there, and a fourteenth axis that duplicates the
 * fourth would report a green number for work already done.
 *
 * What no existing axis can see: given `a[f()] = g()`, which of `f` and `g`
 * runs first. Given `{k(): v()}`, whether the key precedes the value. Given
 * `x[i] += h()`, whether the subscript is evaluated once or twice. Given
 * `p() ** q() ** r()`, which association the operands are consumed in. Every
 * one of these produces the same VALUE under either order for pure operands,
 * so the value-shaped axes (1, 2, 3, 5, 7) are blind to all of it by
 * construction. The divergence only becomes observable when the operands have
 * side effects, which is exactly the program nobody writes on purpose and
 * every codebase eventually contains.
 *
 * THE OBSERVABLE is a sequence of tags, not a value. Each operand is wrapped
 * in `probe(tag, value)`, which prints its tag and returns its value. Two
 * implementations that compute the same answer in different orders produce
 * different transcripts.
 *
 * THE EXPECTED SIDE is real CPython's stdout, obtained by running the Python
 * the TRANSPILER emits - not a hand-written twin, which could agree with the
 * interpreter by construction. Nothing in this file types an expected order.
 *
 * Harness notes inherited from tests/statement-interaction.test.ts, both
 * load-bearing: one subprocess for all programs (per-case spawning blew
 * vitest's default timeout there), and `newline=""` on the results file
 * (without it Windows rewrites newlines and every multi-line case "diverges").
 */

const PYTHON = (() => {
  const candidates = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
})();

/** Every case is prefixed with this, so the transcript is the only output. */
const PROBE = 'def p(tag, val):\n    tag^0\n    return val\n';

const CASES: { label: string; eml: string }[] = [];
const add = (label: string, body: string) => CASES.push({ label, eml: PROBE + body });

// ------------------------------------------------------------------ operators
add('binary + evaluates left then right', '(p("L", 1) + p("R", 2))^0\n');
add('binary - operands', '(p("L", 5) - p("R", 2))^0\n');
add('mixed precedence consumes operands left to right', '(p("a", 1) + p("b", 2) * p("c", 3))^0\n');
add('parenthesised regrouping does not change operand order', '((p("a", 1) + p("b", 2)) * p("c", 3))^0\n');
// Power in EML-P is `base^exponent`, not `**` - `**` is what the transpiler
// EMITS, and writing it here is writing Python into an EML file. The exponent
// must also be a simple token rather than a call (pinned below), so the second
// operand is the term that follows.
add('power base before the operand that follows it', '(p("a", 2)^3 + p("b", 1))^0\n');
add('unary minus after its operand', '(0 - p("x", 4))^0\n');
add('modulo operands', '(p("L", 7) % p("R", 3))^0\n');
add('comparison operands', 'str(p("L", 1) < p("R", 2))^0\n');
add('chained arithmetic, four operands', '(p("a", 1) + p("b", 2) + p("c", 3) + p("d", 4))^0\n');
add('string concat operands', '(p("a", "x") + p("b", "y"))^0\n');

// -------------------------------------------------------------- short-circuit
add('and stops at a falsy left operand', 'str(p("L", 0) and p("R", 1))^0\n');
add('and evaluates the right when the left is truthy', 'str(p("L", 1) and p("R", 2))^0\n');
add('or stops at a truthy left operand', 'str(p("L", 1) or p("R", 2))^0\n');
add('or evaluates the right when the left is falsy', 'str(p("L", 0) or p("R", 2))^0\n');
add('not evaluates its operand', 'str(not p("x", 0))^0\n');
add('and/or mixed precedence', 'str(p("a", 0) or p("b", 1) and p("c", 2))^0\n');

// --------------------------------------------------------------------- calls
add('call arguments left to right', `
def f(a, b, c):
    return a + b + c
f(p("a", 1), p("b", 2), p("c", 3))^0
`.trimStart());
add('nested calls: inner arguments before the outer call', `
def g(x):
    "g"^0
    return x
def f(a, b):
    "f"^0
    return a + b
f(g(p("a", 1)), g(p("b", 2)))^0
`.trimStart());
add('builtin call argument', 'str(len(p("arg", [1, 2, 3])))^0\n');
add('two builtin calls as operands', '(len(p("L", [1])) + len(p("R", [1, 2])))^0\n');

// ------------------------------------------------------------------ literals
add('list literal elements left to right', 'str(len([p("a", 1), p("b", 2), p("c", 3)]))^0\n');
add('dict literal: key before value, pair by pair', 'str(len({p("k1", "a"): p("v1", 1), p("k2", "b"): p("v2", 2)}))^0\n');
add('set literal elements left to right', 'str(len({p("a", 1), p("b", 2)}))^0\n');
add('tuple literal elements left to right', 'str(len((p("a", 1), p("b", 2))))^0\n');
add('nested list literal', 'str(len([[p("a", 1)], [p("b", 2)]]))^0\n');

// ---------------------------------------------------------------- subscripts
add('subscript index is evaluated', `
[10, 20, 30] => xs
xs[p("i", 1)]^0
`.trimStart());
add('subscript assignment: value or target first', `
[10, 20, 30] => xs
p("v", 99) => xs[p("i", 1)]
str(xs[1])^0
`.trimStart());
// `xs[...]^+expr` is not expressible (pinned below), so the same question -
// index before or after the added value - is asked in the form EML-P has.
add('subscript read and added value, in order', `
[10, 20, 30] => xs
xs[p("i", 1)] + p("v", 5) => xs[1]
str(xs[1])^0
`.trimStart());
add('subscript of a call result', `
def f():
    "f"^0
    return [1, 2, 3]
f()[p("i", 0)]^0
`.trimStart());
add('dict subscript with a computed key', `
{"a": 1, "b": 2} => d
d[p("k", "b")]^0
`.trimStart());

// --------------------------------------------------------------------- slices
add('slice bounds left to right', `
[0, 1, 2, 3, 4] => xs
str(len(xs[p("lo", 1):p("hi", 4)]))^0
`.trimStart());
add('slice of a probed sequence', 'str(len(p("seq", [0, 1, 2, 3])[1:3]))^0\n');

// ------------------------------------------------------------- comprehensions
add('comprehension: iterable once, then element by element', `
[p("out", x) for x in p("iter", [1, 2, 3])] => ys
str(len(ys))^0
`.trimStart());
add('comprehension with a condition', `
[p("out", x) for x in [1, 2, 3] if p("cond", x) > 1] => ys
str(len(ys))^0
`.trimStart());

// ------------------------------------------------------------------ statements
add('assignment evaluates its right side', 'p("rhs", 7) => v\nstr(v)^0\n');
// `v^+<call>` is not expressible (pinned below); the plain form is.
add('accumulate-into-self operand', '1 => v\nv + p("rhs", 4) => v\nstr(v)^0\n');
add('if condition before either branch', `
if p("cond", 1) == 1:
    "then"^0
else:
    "else"^0
`.trimStart());
add('while condition is re-evaluated each iteration', `
0 => i
while p("cond", i) < 2:
    i + 1 => i
str(i)^0
`.trimStart());
add('for iterable evaluated once, before the body', `
for x in p("iter", [1, 2]):
    p("body", x)
"done"^0
`.trimStart());
add('return expression', `
def f():
    return p("ret", 1) + p("ret2", 2)
f()^0
`.trimStart());
add('print operand', '(p("out", 1) + 1)^0\n');
add('sigma body per element', 'Σ(p("term", i), i in [1:3])^0\n');
add('raise argument is evaluated before the raise', `
try:
    raise ValueError(p("msg", "boom"))
except ValueError as e:
    str(e)^0
`.trimStart());
add('operand evaluated before the operation that fails', `
try:
    (p("L", 1) + p("R", "s"))^0
except TypeError as e:
    "caught"^0
`.trimStart());

/**
 * One subprocess for all programs, each with a fresh globals dict so nothing
 * one case defines leaks into the next.
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
    `io.open(r"${esc(outFile)}", "w", encoding="utf-8", newline="").write(json.dumps(results))`,
  ].join('\n');
  const runFile = join(dir, 'run.py');
  writeFileSync(runFile, runner, 'utf8');
  const r = spawnSync(PYTHON!, [runFile], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`python harness failed: ${r.stderr}`);
  return JSON.parse(readFileSync(outFile, 'utf8'));
}

function emlResult(src: string): string {
  const ir = interpret(src);
  if (ir.error) return `${ir.output ?? ''}!! ${ir.error.type}: ${ir.error.message}`.trim();
  if (!ir.ok) return `~~ DEFER ${(ir.unsupported ?? []).join(',')}`;
  return (ir.output ?? '').trim();
}

describe.skipIf(!PYTHON)('evaluation order within an expression equals CPython', () => {
  it('every operand transcript agrees', () => {
    const dir = mkdtempSync(join(tmpdir(), 'eml-evalorder-'));
    try {
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
        `${mismatches.length} of ${CASES.length} evaluation orders diverge:\n  ${mismatches.join('\n  ')}`,
      ).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  /**
   * The sweep above can only find a divergence if the probes actually fire.
   * A case whose transcript is empty agrees with anything, so it would pass
   * while measuring nothing - the failure mode this project keeps meeting from
   * the other side. Every case must emit at least two tags, because an order
   * needs two things to be in an order.
   */
  it('every case emits a transcript with at least two operands', () => {
    const thin: string[] = [];
    CASES.forEach((c) => {
      const ir = interpret(c.eml.trim() + '\n');
      const lines = (ir.output ?? '').trim().split('\n').filter((l) => l.length > 0);
      if (lines.length < 2) thin.push(`${c.label} -> ${JSON.stringify(ir.output ?? '')}`);
    });
    expect(thin, `${thin.length} case(s) cannot express an order:\n  ${thin.join('\n  ')}`).toEqual([]);
  });
});

/**
 * GRAMMAR BOUNDARIES FOUND WHILE BUILDING THIS AXIS, pinned rather than
 * skipped - the same treatment tests/statement-interaction.test.ts gives the
 * missing `type()` builtin.
 *
 * The vacuity guard above is what surfaced all three. Three cases produced an
 * EMPTY transcript, which under the differential sweep alone would have
 * compared "" against "" and passed: an unparseable program transpiles to
 * nothing, runs as nothing, and agrees with itself perfectly. A gate that
 * cannot distinguish "the orders match" from "there was no order" is the
 * failure mode this project keeps meeting from the other side, and here it
 * was caught by asking the cases to prove they say something.
 *
 * One of the three was my error rather than the grammar's: `**` is what the
 * transpiler EMITS, not what EML-P accepts. Power is `base^exponent`. Writing
 * `**` in an EML file is writing Python into the wrong language, and the
 * parser said so.
 */
describe('EML-P expression-grammar boundaries', () => {
  const P = PROBE;

  it('`**` is not EML-P syntax - power is `base^exponent`', () => {
    expect(transpileEmlToPython(`${P}(2 ** 3)^0\n`).ok).toBe(false);
    const ok = transpileEmlToPython(`${P}2 => a\n(a^3)^0\n`);
    expect(ok.ok).toBe(true);
    expect(ok.python).toContain('a**3');
  });

  it('a power exponent may not be a call', () => {
    expect(transpileEmlToPython(`${P}(p("a", 2)^3)^0\n`).ok).toBe(true);
    expect(transpileEmlToPython(`${P}(p("a", 2)^p("b", 3))^0\n`).ok).toBe(false);
  });

  it('`name^+value` accepts a literal, a name and a binary expression, but not a call', () => {
    expect(transpileEmlToPython(`${P}1 => v\nv^+4\n`).ok).toBe(true);
    expect(transpileEmlToPython(`${P}1 => v\n4 => w\nv^+w\n`).ok).toBe(true);
    expect(transpileEmlToPython(`${P}1 => v\nv^+(2 + 3)\n`).ok).toBe(true);
    expect(transpileEmlToPython(`${P}1 => v\nv^+p("r", 4)\n`).ok).toBe(false);
    // The plain form has no such restriction, which is why the axis above can
    // still measure the order of an accumulate-into-self.
    expect(transpileEmlToPython(`${P}1 => v\nv + p("r", 4) => v\n`).ok).toBe(true);
  });

  it('there is no `^+` form for a subscript target', () => {
    expect(transpileEmlToPython(`${P}[1, 2] => xs\nxs[0]^+5\n`).ok).toBe(false);
    expect(transpileEmlToPython(`${P}[1, 2] => xs\nxs[0] + 5 => xs[0]\n`).ok).toBe(true);
  });
});
