import { describe, it, expect } from 'vitest';
import { transpilePythonToEml } from '@eml/transpiler-eml';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';

/**
 * REBINDING ACROSS SCOPES — the thirteenth measured axis, and it exists
 * because two components each keep a model of the same fact and nothing has
 * ever compared the two models to each other.
 *
 * The fact is "which names are already declared here". The forward analyzer
 * keeps one because `x^+v` is ambiguous: it DECLARES when `x` is new and
 * AUGMENTS when `x` is bound. The reverse emitter keeps one because it has to
 * decide whether emitting `x^+v` for a Python `x = v` is safe. Those two
 * models must agree, and they are maintained in different packages, by
 * different code, with no shared source.
 *
 * They did not agree. The reverse emitter branch-CLONES its set — a name
 * assigned in one arm of a non-exhaustive `if` is not treated as bound
 * afterwards — while the forward analyzer keeps such a name bound. So this:
 *
 *     def f(k):
 *         if k == "a":
 *             {} => t
 *             return len(t)
 *         {} => t
 *         return len(t)
 *
 * became `t += {}` on the way back, which is a TypeError on a dict, from a
 * program that round-tripped without a single diagnostic.
 *
 * Nothing else could see it. The corpus round-trips every program, but no
 * corpus program happened to assign one name in two sibling scopes. The
 * construct-PAIR axis (axis 6) nests constructs and compares what they print;
 * it never rebinds a name across the nesting. Both were exhausted along their
 * own dimension and blind along this one.
 *
 * The expected side here is never typed. Each generated program is transpiled
 * forward, reversed, and transpiled forward AGAIN, and the two Python
 * renderings must be identical — a FIXPOINT, derived from the program itself.
 * A test that stated the expected Python would have to be rewritten every time
 * the emitter's formatting changed, and would not have caught this at all.
 *
 * The cross product is scope-position x scope-position x value-shape. Value
 * shape matters because the ambiguous `^+` form is only ever emitted for an
 * inline literal; a non-literal value already took the unambiguous path, which
 * is exactly why the defect hid for so long.
 */

/** Wraps a statement so that it sits in a given scope position and always runs. */
interface Position {
  name: string;
  wrap: (body: string) => string;
}

const indent = (text: string): string =>
  text
    .split('\n')
    .map((l) => (l === '' ? l : '    ' + l))
    .join('\n');

const POSITIONS: Position[] = [
  { name: 'plain', wrap: (b) => b },
  { name: 'if-body', wrap: (b) => `if 1 == 1:\n${indent(b)}` },
  { name: 'else-body', wrap: (b) => `if 1 == 2:\n    pass\nelse:\n${indent(b)}` },
  { name: 'elif-body', wrap: (b) => `if 1 == 2:\n    pass\nelif 1 == 1:\n${indent(b)}` },
  { name: 'for-body', wrap: (b) => `for _i in [1:1]:\n${indent(b)}` },
  { name: 'while-body', wrap: (b) => `1 => _g\nwhile _g == 1:\n    0 => _g\n${indent(b)}` },
  { name: 'try-body', wrap: (b) => `try:\n${indent(b)}\nexcept ValueError:\n    pass` },
  {
    name: 'except-body',
    wrap: (b) => `try:\n    raise ValueError("x")\nexcept ValueError:\n${indent(b)}`,
  },
];

/**
 * Value shapes. Only the inline literals can take the `^+` path in the reverse
 * emitter, so a suite built from expressions alone cannot reach the defect.
 */
const VALUES = [
  { name: 'dict-literal', expr: '{}', probe: 'len(t)' },
  { name: 'int-literal', expr: '7', probe: 't' },
  { name: 'list-literal', expr: '[]', probe: 'len(t)' },
  { name: 'expression', expr: '3 + 4', probe: 't' },
];

/** Two assignments to one name, in two scope positions, inside a function. */
function program(a: Position, b: Position, value: { expr: string; probe: string }): string {
  const assign = `${value.expr} => t`;
  return (
    `def f():\n` +
    indent(a.wrap(assign)) +
    '\n' +
    indent(b.wrap(assign)) +
    '\n' +
    indent(`return ${value.probe}`) +
    '\n' +
    `str(f())^0\n`
  );
}

interface Roundtrip {
  py1: string;
  py2: string;
  eml2: string;
  errors: string[];
}

function roundtrip(src: string): Roundtrip {
  const errors: string[] = [];
  const r1 = transpileEmlToPython(src, { fileName: 'a.eml' });
  for (const d of r1.diagnostics ?? []) if (d.severity === 'error') errors.push(`fwd1 ${d.code}: ${d.message}`);
  const rev = transpilePythonToEml(r1.python);
  const r2 = transpileEmlToPython(rev.eml, { fileName: 'b.eml' });
  for (const d of r2.diagnostics ?? []) if (d.severity === 'error') errors.push(`fwd2 ${d.code}: ${d.message}`);
  return { py1: r1.python, py2: r2.python, eml2: rev.eml, errors };
}

const CASES: { label: string; src: string }[] = [];
for (const a of POSITIONS) {
  for (const b of POSITIONS) {
    for (const v of VALUES) {
      CASES.push({ label: `${a.name} -> ${b.name} / ${v.name}`, src: program(a, b, v) });
    }
  }
}

describe('a name rebound across two scopes survives a round trip', () => {
  it('the cross product is the size it claims to be', () => {
    expect(CASES.length).toBe(POSITIONS.length * POSITIONS.length * VALUES.length);
    expect(CASES.length).toBeGreaterThanOrEqual(256);
  });

  it('every generated program transpiles cleanly in the first place', () => {
    const bad: string[] = [];
    for (const c of CASES) {
      const r = transpileEmlToPython(c.src, { fileName: 'a.eml' });
      const errs = (r.diagnostics ?? []).filter((d) => d.severity === 'error');
      if (errs.length > 0) bad.push(`${c.label}: ${errs.map((d) => d.code).join(',')}`);
    }
    expect(
      bad,
      `${bad.length} generated program(s) do not compile, so any round-trip result\n` +
        `about them would be measuring the generator:\n  ${bad.slice(0, 10).join('\n  ')}`,
    ).toEqual([]);
  });

  it('EML -> Python -> EML -> Python reaches a fixpoint for every pairing', () => {
    const bad: string[] = [];
    for (const c of CASES) {
      const r = roundtrip(c.src);
      if (r.errors.length > 0) {
        bad.push(`${c.label}: ${r.errors.join('; ')}`);
        continue;
      }
      if (r.py1 !== r.py2) {
        const l1 = r.py1.split('\n');
        const l2 = r.py2.split('\n');
        const at = l1.findIndex((l, i) => l !== l2[i]);
        bad.push(`${c.label}: line ${at + 1} "${l1[at] ?? ''}" became "${l2[at] ?? ''}"`);
      }
    }
    expect(
      bad,
      `${bad.length} pairing(s) did not round-trip to a fixpoint. A name assigned in\n` +
        `two scopes came back as a different program:\n  ${bad.slice(0, 12).join('\n  ')}`,
    ).toEqual([]);
  });

  it('the round-tripped EML computes what the original computed', () => {
    // The fixpoint check compares TEXT. This one compares behaviour, so a
    // change that is stable under round-tripping but wrong is still caught.
    const bad: string[] = [];
    for (const c of CASES) {
      const r = roundtrip(c.src);
      if (r.errors.length > 0) continue;
      let before = '';
      let after = '';
      try {
        before = interpret(c.src, { file: 'a.eml' }).output;
      } catch (e) {
        before = `THREW ${e instanceof Error ? e.message : String(e)}`;
      }
      try {
        after = interpret(r.eml2, { file: 'b.eml' }).output;
      } catch (e) {
        after = `THREW ${e instanceof Error ? e.message : String(e)}`;
      }
      if (before !== after) bad.push(`${c.label}: printed ${JSON.stringify(before)} then ${JSON.stringify(after)}`);
    }
    expect(
      bad,
      `${bad.length} pairing(s) changed what they compute across a round trip:\n  ${bad.slice(0, 12).join('\n  ')}`,
    ).toEqual([]);
  });

  it('no round-tripped program contains an augmented assign that was a plain one', () => {
    // The specific corruption, named: `x = {}` must never come back as
    // `x += {}`. Stated separately from the fixpoint check because it says
    // WHAT went wrong rather than only that something did.
    const bad: string[] = [];
    for (const c of CASES) {
      const r = roundtrip(c.src);
      if (r.errors.length > 0) continue;
      const plain = (r.py1.match(/^\s*t = /gm) ?? []).length;
      const aug = (r.py2.match(/^\s*t \+= /gm) ?? []).length;
      if (aug > 0 && plain > 0) bad.push(`${c.label}: ${aug} plain assignment(s) became augmented`);
    }
    expect(
      bad,
      `${bad.length} pairing(s) turned a plain assignment into an augmented one:\n  ${bad.slice(0, 12).join('\n  ')}`,
    ).toEqual([]);
  });
});
