import { describe, it, expect } from 'vitest';
import { transpileEmlToPython, analyzeSemantics } from '@eml/transpiler-python';
import { parse } from '@eml/parser';
import { generateCts } from '@eml/cts-generator';
import { createEmitter } from '@eml/trace';
import {
  classifyBugs,
  classifyPythonError,
  emitBugReport,
  type BugReport,
} from '@eml/bug-classifier';

/** Build a BugReport from EML source, mirroring what `eml bugs` does. */
function reportFor(src: string): BugReport {
  const result = transpileEmlToPython(src, { fileName: 't.eml' });
  let cts;
  try {
    const semantic = analyzeSemantics(parse(src));
    cts = generateCts({
      fileName: 't.eml',
      normalized: result.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: result.metadata.functions,
    });
  } catch {
    cts = undefined;
  }
  return classifyBugs({
    diagnostics: result.diagnostics,
    program: result.ast,
    normalized: result.normalized,
    cts,
    fileName: 't.eml',
  });
}

describe('@eml/bug-classifier — compile-time classification', () => {
  it('classifies a blocking error as MAJOR with EML location + node + fix', () => {
    const r = reportFor('def list(n):\n    return n\n');
    const bug = r.bugs.find((b) => b.code === 'E_ALIAS_COLLISION')!;
    expect(bug.level).toBe('MAJOR');
    expect(bug.eml?.line).toBe(1);
    expect(bug.node).not.toBeNull();
    expect(bug.node?.python).toContain('def lst'); // the Python expansion is surfaced
    expect(bug.fix.length).toBeGreaterThan(0);
    expect(r.worst).toBe('MAJOR');
  });

  it('classifies a cold side-effect warning as MINOR mapped to the cold node', () => {
    const r = reportFor('@cold\ndef warm(x):\n    x^0\n    return x\n');
    const bug = r.bugs.find((b) => b.code === 'W_COLD_SIDE_EFFECT')!;
    expect(bug.level).toBe('MINOR');
    expect(bug.node?.semanticType).toBe('function.cold');
  });

  it('classifies hygiene warnings as TRIVIAL', () => {
    const r = reportFor('@frob\ndef f(x):\n    return x\n');
    expect(r.bugs.find((b) => b.code === 'W_UNKNOWN_DECORATOR')?.level).toBe('TRIVIAL');
  });

  it('classifies a parse failure as CRITICAL', () => {
    const r = reportFor('def f(x):\n'); // empty body -> E_PARSE
    expect(r.counts.CRITICAL).toBe(1);
    expect(r.worst).toBe('CRITICAL');
    expect(r.bugs[0]!.code).toBe('E_PARSE');
  });

  it('reports a clean program as no bugs', () => {
    const r = reportFor('x^+100\nx^0\n');
    expect(r.bugs).toHaveLength(0);
    expect(r.worst).toBeNull();
    expect(r.counts).toEqual({ CRITICAL: 0, MAJOR: 0, MINOR: 0, TRIVIAL: 0, COSMETIC: 0 });
  });

  it('computes the worst level across mixed bugs', () => {
    const r = reportFor('@frob\ndef list(n):\n    return n\n\n@cold\ndef warm(x):\n    x^0\n    return x\n');
    expect(r.worst).toBe('MAJOR'); // MAJOR(alias) beats MINOR(cold) and TRIVIAL(decorator)
    expect(r.counts.MAJOR).toBe(1);
    expect(r.counts.MINOR).toBe(1);
    expect(r.counts.TRIVIAL).toBe(1);
  });
});

describe('@eml/bug-classifier — runtime classification', () => {
  it('classifies a Python NameError as CRITICAL and maps it back to the node', () => {
    const src = 'x^-5\nx^0\n';
    const result = transpileEmlToPython(src, { fileName: 't.eml' });
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: result.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: result.metadata.functions,
    });
    const stderr = [
      'Traceback (most recent call last):',
      '  File "t.py", line 1, in <module>',
      '    x -= 5',
      "NameError: name 'x' is not defined",
      '',
    ].join('\n');
    const bug = classifyPythonError({ stderr, python: result.python, cts, fileName: 't.eml' })!;
    expect(bug).not.toBeNull();
    expect(bug.level).toBe('CRITICAL');
    expect(bug.code).toBe('RUNTIME_NameError');
    expect(bug.origin).toBe('runtime');
    expect(bug.node?.python).toBe('x -= 5');
  });

  it('returns null when stderr holds no recognizable exception', () => {
    expect(classifyPythonError({ stderr: 'just some output\n', python: '' })).toBeNull();
  });
});

describe('@eml/bug-classifier — review regressions', () => {
  it('maps E_RANGE_NONINT back to EML source + node (was null)', () => {
    const r = reportFor('SUM(i^2, i in [1:3.5]) => r\n');
    const bug = r.bugs.find((b) => b.code === 'E_RANGE_NONINT')!;
    expect(bug.level).toBe('MAJOR');
    expect(bug.eml).not.toBeNull();
    expect(bug.eml?.line).toBe(1);
    expect(bug.node).not.toBeNull(); // resolves to the containing statement's node
  });

  const tb = (frames: string[], exc: string) =>
    ['Traceback (most recent call last):', ...frames, exc, ''].join('\n');

  it('classifies exceptions WITHOUT a magic suffix (StopIteration, user types)', () => {
    const a = classifyPythonError({ stderr: tb(['  File "t.py", line 1, in <module>', '    next(it)'], 'StopIteration'), python: '', pyFile: 't.py' });
    expect(a?.code).toBe('RUNTIME_StopIteration');
    const b = classifyPythonError({ stderr: tb(['  File "t.py", line 1, in <module>', '    boom()'], 'MyFailure: nope'), python: '', pyFile: 't.py' });
    expect(b?.code).toBe('RUNTIME_MyFailure');
    expect(b?.message).toBe('nope');
  });

  it('does NOT treat a bare stderr log line as a crash (no traceback context)', () => {
    expect(classifyPythonError({ stderr: 'ERROR:root:Connection failed\nCustomError: aborted\n', python: '' })).toBeNull();
  });

  it('reads the real exception type from a multi-line message (not the trailing token)', () => {
    const stderr = tb(['  File "t.py", line 1, in <module>', '    f()'], 'ValueError: expected one of:\nConnectionError');
    const bug = classifyPythonError({ stderr, python: '', pyFile: 't.py' });
    expect(bug?.code).toBe('RUNTIME_ValueError');
  });

  it('maps a duplicated emitted line to the correct node by line position', () => {
    const src = 'x^+1\nx^0\nx^0\n'; // -> x = 1 / print(x) / print(x)
    const result = transpileEmlToPython(src, { fileName: 't.eml' });
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: result.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: result.metadata.functions,
    });
    const stderr = tb(['  File "t.py", line 3, in <module>', '    print(x)'], "NameError: name 'x' is not defined");
    const bug = classifyPythonError({ stderr, python: result.python, cts, pyFile: 't.py' });
    expect(bug?.node?.id).toBe('node_003'); // the SECOND print, not the first
  });

  it('picks the user frame, not a deeper stdlib frame', () => {
    const src = 'x^+1\nx^0\n'; // x = 1 / print(x)
    const result = transpileEmlToPython(src, { fileName: 't.eml' });
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: result.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: result.metadata.functions,
    });
    const stderr = tb(
      ['  File "t.py", line 2, in <module>', '    print(x)', '  File "/usr/lib/python3.11/json/decoder.py", line 337, in decode'],
      'TypeError: bad',
    );
    const bug = classifyPythonError({ stderr, python: result.python, cts, pyFile: 't.py' });
    // maps to the print(x) node via the user frame (line 2), not the stdlib line 337
    expect(bug?.node?.id).toBe('node_002');
  });
});

describe('@eml/bug-classifier — PHOSPHOR trace emission', () => {
  it('emits one eml:bug per bug (ok:false for failures) plus a summary', () => {
    const r = reportFor('def list(n):\n    return n\n'); // one MAJOR
    const em = createEmitter({ stream: 'eml', now: () => '2026-01-01T00:00:00.000Z' });
    emitBugReport(r, em);
    const bugEvents = em.events.filter((e) => e.type === 'eml:bug');
    const summary = em.events.find((e) => e.type === 'eml:bug:summary')!;
    expect(bugEvents).toHaveLength(1);
    expect(bugEvents[0]!.ok).toBe(false); // MAJOR is a failure signal
    expect(bugEvents[0]!.level).toBe('MAJOR');
    expect(summary.worst).toBe('MAJOR');
    expect((summary.counts as Record<string, number>).MAJOR).toBe(1);
  });

  it('does not mark MINOR/TRIVIAL bugs as anomalies (no ok:false)', () => {
    const r = reportFor('@frob\ndef f(x):\n    return x\n'); // TRIVIAL only
    const em = createEmitter({ stream: 'eml', now: () => '2026-01-01T00:00:00.000Z' });
    emitBugReport(r, em);
    const bug = em.events.find((e) => e.type === 'eml:bug')!;
    expect('ok' in bug).toBe(false);
  });
});
