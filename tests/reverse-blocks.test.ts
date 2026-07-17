import { describe, it, expect } from 'vitest';
import { transpilePythonToEml, roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Reverse Python->EML block-statement extension: Phase A (`if`/`elif`/`else`,
 * `while`, `for...in`, plus the shared INDENT/DEDENT lexer/parser
 * infrastructure they all ride on), Phase B1 (`break`/`continue`), Phase B2
 * (dict/set literals + subscript, incl. the `AssignTarget` widening for
 * `d[k] = v` / `d[k] += v`), Phase C (attribute access + bare `import`, incl.
 * the same `AssignTarget` widening extended to `obj.attr = v`), and Phase D
 * (`try`/`except`/`finally` + `raise`, incl. the conservative per-part
 * `bound`-scope handling and the `pass` regression fix), and Phase E1
 * (function definitions + `return`, incl. the `@cold`->`@functools.cache`
 * decorator recognition, the auto-synthesized `import functools` skip, and
 * the fresh function-local `bound` scope — the first construct isolated in
 * BOTH directions, not just going out).
 * `tests/bidirectional.test.ts`'s fixture loop already exercises this via the
 * committed fixture set (16-27); this file adds direct coverage for shapes
 * those fixtures don't specifically pin down, most importantly the
 * branch-aware `bound`-scope merge rule (see eml-emitter.ts's `emitIfChain`)
 * and a regression guard proving scope hasn't silently widened beyond what's
 * actually implemented.
 */

const reverse = (py: string): string => {
  const r = transpilePythonToEml(py);
  expect(r.ok, r.error).toBe(true);
  return r.eml.trim();
};

describe('reverse Python->EML — if/elif/else', () => {
  it('a three-way branch round-trips to a fixpoint', () => {
    const py = 'x = 15\nif x > 20:\n    y = 1\nelif x > 10:\n    y = 2\nelse:\n    y = 3\nprint(y)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('emits elif via the "el" + nested-if-render trick', () => {
    const py = 'x = 15\nif x > 20:\n    y = 1\nelif x > 10:\n    y = 2\nelse:\n    y = 3\nprint(y)\n';
    const eml = reverse(py);
    expect(eml).toContain('elif x > 10:');
    expect(eml).not.toContain('elelif'); // guards against a double-prefix bug
  });
});

describe('reverse Python->EML — while / for...in', () => {
  it('a bare while loop with a reassigned accumulator round-trips', () => {
    const py = 'n = 5\ntotal = 0\nwhile n > 0:\n    total = total + n\n    n = n - 1\nprint(total)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a for...in loop over range() round-trips', () => {
    const py = 'total = 0\nfor i in range(1, 11):\n    total = total + i\nprint(total)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('an if nested inside a while round-trips', () => {
    const py = 'n = 0\ntotal = 0\nwhile n < 10:\n    n = n + 1\n    if n > 5:\n        total = total + n\nprint(total)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});

describe('reverse Python->EML — branch-aware `bound` scope (the flagged risk)', () => {
  it('a name declared in EVERY branch of an exhaustive if/else is usable afterward (augmented add)', () => {
    const py = 'x = 5\nif x > 0:\n    y = 1\nelse:\n    y = 2\ny += 10\nprint(y)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a name declared in only ONE branch (no else) is NOT treated as bound afterward', () => {
    const py = 'x = 5\nif x > 0:\n    y = 1\ny += 10\nprint(y)\n';
    const r = transpilePythonToEml(py);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/undeclared 'y'/);
  });

  it('an elif chain only merges when the chain ends in a plain else (no partial merge)', () => {
    // No final `else:` — even though x/y/z look exhaustive to a human reader,
    // the language doesn't reason about value coverage, only branch shape.
    const py = 'x = 5\nif x > 0:\n    y = 1\nelif x < 0:\n    y = 2\ny += 10\nprint(y)\n';
    const r = transpilePythonToEml(py);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/undeclared 'y'/);
  });
});

describe('reverse Python->EML — break / continue (Phase B1)', () => {
  it('a while loop with a conditional break round-trips', () => {
    const py = 'n = 0\ntotal = 0\nwhile n < 100:\n    n = n + 1\n    if n > 5:\n        break\n    total = total + n\nprint(total)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a for loop with a conditional continue round-trips', () => {
    const py = 'total = 0\nfor i in range(1, 11):\n    if i > 5:\n        continue\n    total = total + i\nprint(total)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('emits the bare keyword, not a mistranslated identifier reference', () => {
    const eml = reverse('n = 0\nwhile n < 10:\n    n = n + 1\n    break\n');
    expect(eml).toContain('\n    break');
  });
});

describe('reverse Python->EML — dict/set literals + subscript (Phase B2)', () => {
  it('a dict literal + subscript read round-trips', () => {
    const py = 'd = {"a": 1, "b": 2}\nx = d["a"]\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a set literal + membership round-trips', () => {
    const py = 's = {1, 2, 3}\nhas_two = 2 in s\nprint(has_two)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a fresh subscript assignment (`lst[k] = v`) round-trips', () => {
    const py = 'lst = [10, 20, 30]\nlst[1] = 99\nx = lst[1]\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a compound subscript assignment (`d[k] += v`) round-trips using the real operator, not the `^` sigil', () => {
    const py = 'scores = {"alice": 10}\nscores["alice"] += 5\nx = scores["alice"]\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
    const eml = reverse(py);
    expect(eml).toContain('scores["alice"] += 5');
    expect(eml).not.toContain('^+5'); // must not use the bare-identifier sigil form
  });

  it('a word-tally loop combining dict subscript targets with if/else round-trips', () => {
    const py =
      'counts = {}\n' +
      'words = ["a", "b", "a", "c", "a", "b"]\n' +
      'for w in words:\n' +
      '    if w in counts:\n' +
      '        counts[w] += 1\n' +
      '    else:\n' +
      '        counts[w] = 1\n' +
      'print(counts)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});

describe('reverse Python->EML — attribute access + import (Phase C)', () => {
  it('an attribute-callee call round-trips (mirrors fixture 26)', () => {
    const py = 'import math\nx = 16\ny = math.sqrt(x)\nprint(y)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a bare `import module` round-trips as a real statement, not a silent drop', () => {
    const eml = reverse('import math\nx = 16\nprint(x)\n');
    expect(eml).toContain('import math');
  });

  it('a fresh attribute assignment (`obj.attr = v`) round-trips', () => {
    // `^0` output requires a bare identifier (EML's own grammar constraint,
    // pre-existing) — bind the attribute read to a variable first, same idiom
    // already used for the dict/subscript tests above.
    const py = 'obj = get_thing()\nobj.value = 10\nx = obj.value\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a compound attribute assignment (`obj.attr += v`) round-trips using the real operator', () => {
    const py = 'obj = get_thing()\nobj.value += 5\nx = obj.value\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
    const eml = reverse(py);
    expect(eml).toContain('obj.value += 5');
    expect(eml).not.toContain('^+5');
  });

  it('an aliased import (`import numpy as np`) still silently drops, not a regression', () => {
    // Preserves the pre-existing behavior (also covered in bidirectional.test.ts's
    // inline case list) — 'np' stays a permanently-recognized magic prefix for
    // the matrix system regardless of any import statement introducing it.
    expect(reverse('import numpy as np\nnp.array(data)')).toBe('<M>(data)');
  });
});

describe('reverse Python->EML — try/except/finally + raise (Phase D)', () => {
  it('a basic try/except/finally round-trips (mirrors fixture 27)', () => {
    const py = 'result = 0\ntry:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    result = -1\nfinally:\n    result = result + 100\nprint(result)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('except with an `as` binding round-trips', () => {
    const py = 'result = 0\ntry:\n    x = 10 / 0\nexcept ZeroDivisionError as e:\n    result = 1\nprint(result)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('try + finally only (no except) round-trips', () => {
    const py = 'result = 0\ntry:\n    result = 1\nfinally:\n    result = result + 10\nprint(result)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a bare `raise` (re-raise) round-trips', () => {
    const py = 'try:\n    x = 1\nexcept ValueError:\n    raise\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('raise with an exception expression round-trips', () => {
    const py = 'x = 5\nif x < 0:\n    raise ValueError("x must be non-negative")\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a name assigned only inside the try body is NOT treated as bound afterward (conservative scope)', () => {
    const py = 'try:\n    y = 1\nexcept ValueError:\n    z = 2\ny += 10\n';
    const r = transpilePythonToEml(py);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/undeclared 'y'/);
  });

  it('a name assigned in `finally` IS treated as bound afterward (unconditional)', () => {
    const py = 'try:\n    x = 1\nfinally:\n    y = 2\ny += 10\nprint(y)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('`pass` fails loudly instead of silently mistranslating (regression guard)', () => {
    const r = transpilePythonToEml('try:\n    x = 1\nexcept ValueError:\n    pass\n');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/'pass'/);
  });
});

describe('reverse Python->EML — function definitions (Phase E1)', () => {
  it('a @cold function round-trips, incl. the auto-synthesized import functools (mirrors fixture 15)', () => {
    const py =
      'import functools\n\n@functools.cache\ndef square(n):\n    return n * n\n\nx = square(5)\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a @cold function does not duplicate `import functools` when re-forward-transpiled', () => {
    const eml = reverse('import functools\n\n@functools.cache\ndef square(n):\n    return n * n\n');
    expect(eml).not.toContain('import functools');
    expect(eml).toContain('@cold');
  });

  it('a neutral (no-decorator) function round-trips', () => {
    const py = 'def add(a, b):\n    return a + b\n\nx = add(2, 3)\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a bare `return` (no value) round-trips', () => {
    const py = 'def noop():\n    return\n\nnoop()\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a function definition combined with if/raise/try round-trips (mirrors fixture 28)', () => {
    const py =
      'def validate(n):\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    return n\n\n' +
      'try:\n    r = validate(0 - 5)\n    print(r)\nexcept ValueError as e:\n    print(e)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a name assigned inside a function does NOT leak to the caller afterward (scope isolated going out)', () => {
    const py = 'def f():\n    y = 1\n    return y\n\nf()\ny += 10\n';
    const r = transpilePythonToEml(py);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/undeclared 'y'/);
  });

  it('a module-level bound name does not false-positive "already bound" for a same-named fresh local inside a function (scope isolated going in)', () => {
    // If the function body wrongly shared/cloned the caller's `bound` set
    // instead of getting a fresh one, this inner `x = 5` would see the outer
    // `x` as already-bound and emit the reversed-arrow form instead of the
    // declare-sigil form.
    const py = 'x = 100\ndef f():\n    x = 5\n    return x\n\ny = f()\nprint(x)\nprint(y)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
    const eml = reverse(py);
    expect(eml).toContain('x^+5');
  });

  it('`async def` is rejected with a clear, specific error (not a generic parse failure)', () => {
    const r = transpilePythonToEml('async def f():\n    return 1\n');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/async/);
  });

  it('an unsupported decorator (`@staticmethod`) is rejected, not silently partial-matched', () => {
    const r = transpilePythonToEml('@staticmethod\ndef f():\n    return 1\n');
    expect(r.ok).toBe(false);
  });
});

describe('reverse Python->EML — still out of scope this round (regression guard)', () => {
  it('a class definition still fails', () => {
    const r = transpilePythonToEml('class Foo:\n    x = 1\n');
    expect(r.ok).toBe(false);
  });
});
