import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';

/**
 * ALIASING AND MUTATION VISIBILITY - differential gate against real CPython.
 * The fifteenth measured axis.
 *
 * `=>` binds a NAME to a VALUE, and for a mutable value that means two names
 * denote the same object. Mutate through one and the other sees it. That is
 * Python's model, EML-P inherits it, and none of the fourteen axes before this
 * one can see it - every one of them compares the value a single expression
 * produces, and object identity is precisely the thing that does not show up in
 * a single expression's value.
 *
 * Axis 14 (evaluation order) is the closest, and it is about the order operands
 * are consumed in, not about whether two names denote one object. A reordering
 * changes a transcript; an aliasing mistake changes a VALUE read through a
 * different name later.
 *
 * The surface is larger than it looks, because "does this copy or alias" has a
 * different answer for each construct: plain binding aliases, a slice copies,
 * `+` builds a new list, a comprehension copies the outer list and aliases the
 * inner ones, a function parameter aliases the argument, a loop variable
 * aliases the element, and REBINDING a name is not mutation at all. Each of
 * those is a separate decision an implementation makes, and they can be wrong
 * independently.
 *
 * THE EXPECTED SIDE is real CPython running the Python the TRANSPILER emits.
 * Nothing here types an expected value.
 *
 * Harness notes inherited from tests/statement-interaction.test.ts, both
 * load-bearing: one subprocess for all programs, and `newline=""` on the
 * results file so Windows does not rewrite the line endings and make every
 * multi-line case "diverge".
 */

const PYTHON = (() => {
  const candidates = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
})();

const CASES: { label: string; eml: string }[] = [];
const add = (label: string, eml: string) => CASES.push({ label, eml });

// ------------------------------------------------------- plain binding aliases
add('plain binding aliases a list', `
[1, 2, 3] => a
a => b
99 => a[0]
str(b[0])^0
`.trimStart());

add('mutation is visible in both directions', `
[1, 2, 3] => a
a => b
99 => b[2]
str(a[2])^0
`.trimStart());

add('REBINDING a name is not mutation', `
[1, 2] => a
a => b
[9, 9] => a
str(b[0])^0
`.trimStart());

add('rebinding the second name leaves the first alone', `
[1, 2] => a
a => b
[7, 7] => b
str(a[0])^0
`.trimStart());

// --------------------------------------------------------------- what copies
add('a full slice copies', `
[1, 2, 3] => a
a[0:3] => b
99 => a[0]
str(b[0])^0
`.trimStart());

add('a partial slice copies', `
[1, 2, 3] => a
a[1:3] => b
99 => a[1]
str(b[0])^0
`.trimStart());

add('list + list builds a new object', `
[1, 2] => a
a + [] => b
99 => a[0]
str(b[0])^0
`.trimStart());

add('list + list does not alias the right operand either', `
[1, 2] => a
[0] + a => b
99 => a[0]
str(b[1])^0
`.trimStart());

// ------------------------------------------------------------------- nesting
add('nested list: the inner object is shared', `
[[1], [2]] => a
a => b
99 => a[0][0]
str(b[0][0])^0
`.trimStart());

add('a slice copies the outer list and shares the inner ones', `
[[1], [2]] => a
a[0:2] => b
99 => a[0][0]
str(b[0][0])^0
`.trimStart());

add('replacing an element in the copy does not touch the original', `
[[1], [2]] => a
a[0:2] => b
[8] => b[0]
str(a[0][0])^0
`.trimStart());

add('a dict value aliases the list put into it', `
[1, 2] => xs
{"k": xs} => d
99 => xs[0]
str(d["k"][0])^0
`.trimStart());

add('mutating through the dict is visible on the original name', `
[1, 2] => xs
{"k": xs} => d
99 => d["k"][1]
str(xs[1])^0
`.trimStart());

add('the same list placed twice is one object', `
[1] => xs
[xs, xs] => pair
99 => pair[0][0]
str(pair[1][0])^0
`.trimStart());

// -------------------------------------------------------- function arguments
add('a function parameter aliases the argument', `
def touch(xs):
    99 => xs[0]
[1, 2] => a
touch(a)
str(a[0])^0
`.trimStart());

add('rebinding a parameter does not affect the caller', `
def rebind(xs):
    [7, 7] => xs
    return 0
[1, 2] => a
rebind(a)
str(a[0])^0
`.trimStart());

add('a returned parameter is the same object', `
def give(xs):
    return xs
[1, 2] => a
give(a) => b
99 => b[0]
str(a[0])^0
`.trimStart());

add('a function building a new list returns a separate object', `
def copy_of(xs):
    return xs + []
[1, 2] => a
copy_of(a) => b
99 => b[0]
str(a[0])^0
`.trimStart());

add('a default-shaped accumulator passed in is mutated in place', `
def fill(out):
    5 => out[0]
    return out
[0, 0] => acc
fill(acc)
str(acc[0])^0
`.trimStart());

// ----------------------------------------------------------- loop and comp
add('a for-loop variable aliases the element', `
[[1], [2]] => rows
for r in rows:
    99 => r[0]
str(rows[0][0]) + "," + str(rows[1][0])^0
`.trimStart());

add('rebinding the loop variable does not touch the list', `
[[1], [2]] => rows
for r in rows:
    [8] => r
str(rows[0][0])^0
`.trimStart());

add('a comprehension over rows produces a new outer list', `
[[1], [2]] => rows
[r for r in rows] => copy
[8] => copy[0]
str(rows[0][0])^0
`.trimStart());

add('a comprehension shares the inner objects', `
[[1], [2]] => rows
[r for r in rows] => copy
99 => rows[0][0]
str(copy[0][0])^0
`.trimStart());

add('a comprehension building new inner lists shares nothing', `
[[1], [2]] => rows
[r + [] for r in rows] => copy
99 => rows[0][0]
str(copy[0][0])^0
`.trimStart());

// ------------------------------------------------------------------- dicts
add('a dict binding aliases', `
{"a": 1} => d
d => e
9 => d["a"]
str(e["a"])^0
`.trimStart());

add('a dict inside a list is shared', `
{"a": 1} => d
[d] => box
9 => box[0]["a"]
str(d["a"])^0
`.trimStart());

add('adding a key through one name is visible through the other', `
{"a": 1} => d
d => e
2 => d["b"]
str(e["b"])^0
`.trimStart());

// ------------------------------------------------- immutables and boundaries
add('an int binding cannot alias', `
5 => a
a => b
7 => a
str(b)^0
`.trimStart());

add('a string binding cannot alias', `
"xy" => a
a => b
"zz" => a
str(b)^0
`.trimStart());

add('strings are immutable - assigning to an index raises', `
"xy" => s
"z" => s[0]
str(s)^0
`.trimStart());

add('a tuple is immutable - assigning to an index raises', `
(1, 2) => t
9 => t[0]
str(t[0])^0
`.trimStart());

/** One subprocess for all programs, each with a fresh globals dict. */
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

describe.skipIf(!PYTHON)('aliasing and mutation visibility equals CPython', () => {
  it('every construct copies or aliases exactly as CPython does', () => {
    const dir = mkdtempSync(join(tmpdir(), 'eml-alias-'));
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
        `${mismatches.length} of ${CASES.length} aliasing behaviours diverge:\n  ${mismatches.join('\n  ')}`,
      ).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  /**
   * The anti-vacuity guard, and for this axis it has to be sharper than "did
   * anything print".
   *
   * A sweep in which every case answers the same way is passed by an
   * implementation that always aliases AND by one that never does - it would
   * agree with CPython everywhere and still be wrong about the one distinction
   * the axis exists to measure. So the suite has to contain cases where the
   * mutation propagates and cases where it does not.
   *
   * Which side a case is on is COMPUTED, not labelled: delete the in-place
   * mutations from the case and run it again. If the answer changes, the case
   * observes the mutation; if it does not, the case is measuring a copy, a
   * rebinding, or an immutable. Real CPython decides, twice.
   *
   * Deleting a line can empty a block, and an unparseable twin classifies
   * nothing - those are excluded by their measured result rather than assumed
   * away, and the surviving count is asserted so the exclusion cannot quietly
   * eat the suite.
   */
  it('the mutation is observable in some cases and not in others - measured, not labelled', () => {
    const dir = mkdtempSync(join(tmpdir(), 'eml-alias-spread-'));
    const BROKEN = /!! (IndentationError|SyntaxError)/;
    try {
      const sources = CASES.map((c) => c.eml.trim() + '\n');
      // An in-place mutation in EML-P is an assignment whose target is subscripted.
      const stripped = sources.map((s) => s.split('\n').filter((l) => !/=>\s*\w+\[/.test(l)).join('\n'));

      const programs = sources.map((s) => transpileEmlToPython(s).python);
      const twinPrograms = stripped.map((s) => {
        const t = transpileEmlToPython(s);
        return t.ok ? t.python : 'raise SyntaxError("twin does not parse")';
      });
      const all = cpythonAll([...programs, ...twinPrograms], dir).map((s) => s.trim());
      const expected = all.slice(0, CASES.length);
      const twins = all.slice(CASES.length);

      const empty = expected.filter((s) => s.length === 0);
      expect(empty, `${empty.length} case(s) produce no output at all`).toEqual([]);

      const classified = CASES.map((c, i) => ({ label: c.label, same: expected[i] === twins[i], twin: twins[i]! }));
      const usable = classified.filter((r) => !BROKEN.test(r.twin));
      expect(
        usable.length,
        `only ${usable.length} of ${CASES.length} cases could be classified - the rest lost a whole block when their mutation was deleted`,
      ).toBeGreaterThan(19);

      const observes = usable.filter((r) => !r.same);
      const doesNot = usable.filter((r) => r.same);
      expect(
        observes.length,
        'no case observes the mutation - the axis would pass an implementation that never aliases',
      ).toBeGreaterThan(4);
      expect(
        doesNot.length,
        'every case observes the mutation - the axis would pass an implementation that always aliases',
      ).toBeGreaterThan(4);

      const distinct = new Set(expected);
      expect(distinct.size, 'the expected answers collapse to too few distinct values').toBeGreaterThan(3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
