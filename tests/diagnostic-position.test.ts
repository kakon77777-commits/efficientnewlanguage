import { describe, it, expect } from 'vitest';
import { transpileEmlToPython } from '@eml/transpiler-python';

/**
 * DIAGNOSTIC POSITIONS — the twelfth measured axis, and it exists because the
 * eighth one has an obvious blind spot that took four days to name.
 *
 * Axis 8 (`diagnostic-reachability.test.ts`) proved every diagnostic code can
 * be triggered. It says nothing about WHERE the compiler says the problem is.
 * A diagnostic that fires correctly and points at line 1 of a 200-line file is
 * reachable, is counted, is green — and is useless, because the whole value of
 * a diagnostic is the position. An editor underlines it, an agent jumps to it,
 * a human reads the line above. All three follow the span.
 *
 * Nothing else in the repo can see this. The conformance suites compare
 * OUTPUT; the goldens compare traces; reachability compares codes. A span is
 * neither an output nor a code, so a wrong one is invisible everywhere.
 *
 * Three properties, and none of the expected values is typed:
 *
 *   1. SELF-CONSISTENCY. A span carries the same position twice — as a byte
 *      offset (`start`) and as `line`/`column`. Deriving line/column from the
 *      offset must reproduce the reported pair. Two independent encodings of
 *      one fact, so the check needs no reference answer at all: the source
 *      text IS the oracle.
 *
 *   2. VERTICAL SHIFT INVARIANCE. Prepend k blank lines to a program and every
 *      reported line must increase by exactly k, with the column unchanged and
 *      the offset up by exactly the bytes inserted. The expected side is
 *      computed from the transformation, so it cannot be satisfied by a
 *      hardcoded position — a span pinned to line 1 fails the moment k > 0.
 *
 *   3. TRAILING INVARIANCE. Appending blank lines AFTER the program must not
 *      move anything. This catches a position measured from the end of the
 *      file rather than the start, which shift invariance alone would let
 *      through.
 *
 * Triggers are held here rather than imported from the reachability gate on
 * purpose. That file's table is tuned to provoke each code minimally; this one
 * needs the mistake to sit somewhere a position can be wrong ABOUT, and
 * coupling them would let a change made for one gate's reasons silently
 * weaken the other.
 */

interface Span {
  start: number;
  end: number;
  line: number;
  column: number;
}

/**
 * Programs whose diagnostics carry spans. Each puts the offending construct
 * on a line that is not the first, so "reports line 1" is a distinguishable
 * wrong answer rather than an accidentally correct one.
 */
const PROGRAMS: Record<string, string> = {
  E_PARSE: '1 => a\n2 => b\nif True\n    3 => c\n',
  E_BREAK_OUTSIDE_LOOP: '1 => a\n2 => b\nbreak\n',
  E_CONTINUE_OUTSIDE_LOOP: '1 => a\n2 => b\ncontinue\n',
  E_RETURN_OUTSIDE_FN: '1 => a\n2 => b\nreturn 1\n',
  E_RANGE_NONINT: '1 => a\nfor i in [1.5:3]:\n    str(i)^0\n',
  E_ALIAS_COLLISION: '1 => a\ndef list(xs):\n    return 0\nstr(list([1]))^0\n',
  W_AUG_UNDECLARED: '1 => a\n2 => b\nundeclared^-1\n',
  W_FN_REDECLARED: 'def f():\n    return 1\ndef f():\n    return 2\nstr(f())^0\n',
  W_COLD_SIDE_EFFECT: '1 => a\n@cold\ndef f(n):\n    "x"^0\n    return n\nstr(f(1))^0\n',
  W_UNKNOWN_DECORATOR: '1 => a\n@mystery\ndef f():\n    return 1\nstr(f())^0\n',
  W_TEMP_CONFLICT: '1 => a\n@cold\n@hot\ndef f():\n    return 1\nstr(f())^0\n',
  E_CLASS_BODY_UNSUPPORTED: '1 => a\nclass C:\n    for i in [0:1]:\n        pass\n',
};

/** Every diagnostic that carries a span, with its code, for one source. */
function spansOf(src: string): { code: string; span: Span }[] {
  const r = transpileEmlToPython(src, { fileName: 't.eml' });
  return (r.diagnostics ?? [])
    .filter((d) => d.span !== undefined)
    .map((d) => ({ code: d.code, span: d.span as Span }));
}

/**
 * Line and column of a byte offset, derived from the source text alone. This
 * is the independent encoding property 1 compares against; it deliberately
 * shares no code with the compiler.
 */
function lineColOf(src: string, offset: number): { line: number; column: number } {
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < offset && i < src.length; i++) {
    if (src[i] === '\n') {
      line++;
      lastNewline = i;
    }
  }
  return { line, column: offset - lastNewline };
}

const ENTRIES = Object.entries(PROGRAMS);

describe('diagnostic spans point at a real place in the source', () => {
  it('every program produces at least one diagnostic with a span', () => {
    const empty: string[] = [];
    for (const [code, src] of ENTRIES) {
      if (spansOf(src).length === 0) empty.push(code);
    }
    expect(
      empty,
      `${empty.length} program(s) produced no spanned diagnostic at all, so nothing about\n` +
        `their positions can be measured:\n  ${empty.join('\n  ')}`,
    ).toEqual([]);
  });

  it('every span lies inside the file it describes', () => {
    const bad: string[] = [];
    for (const [name, src] of ENTRIES) {
      const lineCount = src.split('\n').length;
      for (const { code, span } of spansOf(src)) {
        if (span.start < 0 || span.start > src.length)
          bad.push(`${name}/${code}: start ${span.start} outside 0..${src.length}`);
        if (span.end < span.start || span.end > src.length)
          bad.push(`${name}/${code}: end ${span.end} not in ${span.start}..${src.length}`);
        if (span.line < 1 || span.line > lineCount)
          bad.push(`${name}/${code}: line ${span.line} outside 1..${lineCount}`);
        if (span.column < 1) bad.push(`${name}/${code}: column ${span.column} below 1`);
      }
    }
    expect(bad, `${bad.length} span(s) point outside their own file:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('the offset and the line/column in a span agree with each other', () => {
    // The strongest property here and the cheapest: a span states its position
    // twice, so the two statements can be diffed with no reference answer.
    const bad: string[] = [];
    for (const [name, src] of ENTRIES) {
      for (const { code, span } of spansOf(src)) {
        const derived = lineColOf(src, span.start);
        if (derived.line !== span.line || derived.column !== span.column) {
          bad.push(
            `${name}/${code}: span says line ${span.line} col ${span.column}, ` +
              `but offset ${span.start} is line ${derived.line} col ${derived.column}`,
          );
        }
      }
    }
    expect(
      bad,
      `${bad.length} span(s) disagree with themselves — the byte offset and the\n` +
        `line/column describe different places:\n  ${bad.join('\n  ')}`,
    ).toEqual([]);
  });

  it('prepending blank lines moves every reported line by exactly that many', () => {
    const bad: string[] = [];
    for (const [name, src] of ENTRIES) {
      const base = spansOf(src);
      for (const k of [1, 3, 10]) {
        const pad = '\n'.repeat(k);
        const shifted = spansOf(pad + src);
        if (shifted.length !== base.length) {
          bad.push(`${name}: ${base.length} spanned diagnostic(s) became ${shifted.length} after ${k} blank line(s)`);
          continue;
        }
        for (let i = 0; i < base.length; i++) {
          const b = base[i];
          const s = shifted[i];
          if (s.code !== b.code) {
            bad.push(`${name}: diagnostic ${i} changed from ${b.code} to ${s.code} under a ${k}-line shift`);
            continue;
          }
          if (s.span.line !== b.span.line + k)
            bad.push(`${name}/${b.code}: +${k} lines moved line ${b.span.line} to ${s.span.line}, expected ${b.span.line + k}`);
          if (s.span.column !== b.span.column)
            bad.push(`${name}/${b.code}: +${k} lines changed column ${b.span.column} to ${s.span.column}`);
          if (s.span.start !== b.span.start + k)
            bad.push(`${name}/${b.code}: +${k} bytes moved offset ${b.span.start} to ${s.span.start}, expected ${b.span.start + k}`);
        }
      }
    }
    expect(
      bad,
      `${bad.length} position(s) did not track a vertical shift. A span that does not\n` +
        `move with the code it describes is not a position:\n  ${bad.join('\n  ')}`,
    ).toEqual([]);
  });

  it('appending blank lines moves nothing', () => {
    const bad: string[] = [];
    for (const [name, src] of ENTRIES) {
      const base = spansOf(src);
      const tail = spansOf(src + '\n\n\n\n\n');
      if (tail.length !== base.length) {
        bad.push(`${name}: ${base.length} spanned diagnostic(s) became ${tail.length} after trailing blank lines`);
        continue;
      }
      for (let i = 0; i < base.length; i++) {
        const b = base[i].span;
        const t = tail[i].span;
        if (b.line !== t.line || b.column !== t.column || b.start !== t.start) {
          bad.push(
            `${name}/${base[i].code}: trailing blank lines moved ${b.line}:${b.column}@${b.start} ` +
              `to ${t.line}:${t.column}@${t.start}`,
          );
        }
      }
    }
    expect(
      bad,
      `${bad.length} position(s) depend on what comes AFTER them, which means they are\n` +
        `measured from the wrong end:\n  ${bad.join('\n  ')}`,
    ).toEqual([]);
  });

  it('two identical mistakes on different lines are reported at different lines', () => {
    // Catches a position that is real but always the first occurrence — shift
    // invariance cannot see that, because both would move together.
    const src = '1 => a\nbreak\n2 => b\nbreak\n';
    const spans = spansOf(src).filter((s) => s.code === 'E_BREAK_OUTSIDE_LOOP');
    expect(spans.length, 'expected one diagnostic per misplaced break').toBeGreaterThanOrEqual(2);
    const lines = spans.map((s) => s.span.line);
    expect(
      new Set(lines).size,
      `both breaks were reported at line(s) ${lines.join(', ')} — the position is being\n` +
        'reused rather than computed per occurrence',
    ).toBe(lines.length);
  });
});
