import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import {
  parse,
  transpilePython,
  transpileEml,
  interpretTool,
  traceTool,
  roundtrip,
  health,
  TOOL_NAMES,
  MAX_SOURCE_LENGTH,
  MAX_NESTING,
  rawNestingDepth,
  complexityError,
  sanitizeError,
} from '@eml/mcp';

const SUM_SRC = 'N^+100\nΣ(i^2, i in [1:N]) => r\nr^0\n';
const BAD_CLASS_SRC = 'x^+1\nclass Foo(Bar):\n    def m(self):\n        return 1\n';
const ZERO_DIV_SRC = 'a^+1\nb^+0\na^/b\na^0';
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
  'c.get() => r\n' +
  'r^0\n';
// `@hot` (Phase 2) is the one PERMANENTLY unrecoverable construct: the
// forward emitter renders it as a comment, never a real decorator, so the
// reverse Python->EML lexer (which never tokenizes comments) can't recover
// it — unlike `class` (Phase E2), which now round-trips.
const HOT_SRC = '@hot\ndef greet(name):\n    name^0\n    return name\n\ngreet(5)\n';

function expectRealHash(env: { input_hash: string }, source: string): void {
  expect(env.input_hash).toBe(`sha256:${createHash('sha256').update(source).digest('hex')}`);
}

describe('@eml/mcp tools — envelope shape', () => {
  it('parse: a clean program returns ok:true with AST + tokenCount', () => {
    const env = parse(SUM_SRC);
    expect(env.ok).toBe(true);
    expect(env.tool).toBe('eml.parse');
    expect(env.errors).toEqual([]);
    expect((env.result as any).tokenCount).toBeGreaterThan(0);
    expect(env.trace_id).toMatch(/^eml-trace-/);
    expectRealHash(env, SUM_SRC);
  });

  it('parse: a compile error returns ok:false with an E_PARSE error, not a thrown exception', () => {
    const env = parse(BAD_CLASS_SRC);
    expect(env.ok).toBe(false);
    expect(env.result).not.toBeNull(); // parse still returns the (empty) AST + normalized text
    expect(env.errors[0]?.code).toBe('E_PARSE');
  });

  it('transpile_python: a clean program returns Python source', () => {
    const env = transpilePython(SUM_SRC);
    expect(env.ok).toBe(true);
    expect(env.tool).toBe('eml.transpile_python');
    expect((env.result as any).python).toContain('range(1, N+1)');
  });

  it('transpile_python: a compile error surfaces as an envelope error, not a throw', () => {
    const env = transpilePython(BAD_CLASS_SRC);
    expect(env.ok).toBe(false);
    expect(env.errors[0]?.code).toBe('E_PARSE');
  });

  it('transpile_eml: a clean Python program returns EML/Py+', () => {
    const env = transpileEml('x = 100');
    expect(env.ok).toBe(true);
    expect(env.tool).toBe('eml.transpile_eml');
    expect((env.result as any).eml.trim()).toBe('x^+100');
    expect(env.errors).toEqual([]);
  });

  it('transpile_eml: invalid Python returns a single recoverable E_PARSE error', () => {
    const env = transpileEml('???not valid python???');
    expect(env.ok).toBe(false);
    expect(env.errors).toHaveLength(1);
    expect(env.errors[0]?.code).toBe('E_PARSE');
    expect(env.errors[0]?.recoverable).toBe(true);
  });

  it('interpret: a clean program returns its real stdout', () => {
    const env = interpretTool(SUM_SRC);
    expect(env.ok).toBe(true);
    expect(env.tool).toBe('eml.interpret');
    expect((env.result as any).output.trim()).toBe(String((100 * 101 * 201) / 6));
    expect(env.errors).toEqual([]); // a normal program trips no guard
  });

  it('interpret: a runtime fault (ZeroDivisionError) is a normal ok:false result', () => {
    const env = interpretTool(ZERO_DIV_SRC);
    expect(env.ok).toBe(false);
    expect(env.errors[0]?.code).toBe('ZeroDivisionError');
  });

  it('trace: a clean program returns a phosphor-jsonl-v1 stream with no anomalies', () => {
    const env = traceTool(SUM_SRC);
    expect(env.ok).toBe(true);
    expect(env.tool).toBe('eml.trace');
    const result = env.result as any;
    expect(result.jsonl.split('\n').filter(Boolean).length).toBe(result.eventCount);
    expect(result.anomalies).toEqual([]);
  });

  it('trace: a runtime fault is flagged as an anomaly', () => {
    const env = traceTool(ZERO_DIV_SRC);
    expect(env.ok).toBe(false);
    expect((env.result as any).anomalies.length).toBeGreaterThan(0);
  });

  it('roundtrip: a fixpoint-reaching program returns ok:true with errors/warnings always []', () => {
    const env = roundtrip(SUM_SRC);
    expect(env.tool).toBe('eml.roundtrip');
    expect((env.result as any).ok).toBe(true);
    expect(env.ok).toBe(true);
    expect(env.errors).toEqual([]);
    expect(env.warnings).toEqual([]);
  });

  it('roundtrip: class definitions round-trip too (Phase E2) — COUNTER_SRC reaches a fixpoint', () => {
    const env = roundtrip(COUNTER_SRC);
    expect(env.tool).toBe('eml.roundtrip');
    expect((env.result as any).ok).toBe(true);
    expect(env.ok).toBe(true);
    expect(env.errors).toEqual([]);
    expect(env.warnings).toEqual([]);
  });

  it('roundtrip: a permanently-unrecoverable construct (@hot) fails via result.ok/message, NOT via errors[]', () => {
    // `@hot` does NOT throw a reverse-parse error — the forward emitter renders
    // it as a bare comment, so the reverse lexer (which never tokenizes
    // comments) happily parses the decorator-stripped Python as a neutral
    // function. The information loss only surfaces as a silent round-trip
    // MISMATCH (python1, which still has the `@hot` comment, != python2,
    // which doesn't) — not a hard parse failure. Verified directly rather
    // than assumed: this is a more precise failure mode than "reverse
    // Python->EML failed" would suggest.
    const env = roundtrip(HOT_SRC);
    expect(env.ok).toBe(false);
    expect((env.result as any).ok).toBe(false);
    expect((env.result as any).message).toContain('round-trip MISMATCH');
    // The invariant this test locks in: roundtrip never populates errors/warnings,
    // even on failure — failure is only visible via result.ok/result.message.
    expect(env.errors).toEqual([]);
    expect(env.warnings).toEqual([]);
  });

  it('health: reports status, version, the 6 tool names, and enforced limits', () => {
    const env = health();
    expect(env.ok).toBe(true);
    expect(env.tool).toBe('eml.tools/health');
    const result = env.result as any;
    expect(result.status).toBe('healthy');
    expect(result.trace_proto).toBe('phosphor-jsonl-v1');
    expect(result.tools).toEqual(TOOL_NAMES);
    expect(result.limits.max_source_length).toBe(MAX_SOURCE_LENGTH);
  });
});

describe('@eml/mcp guards — resource limits', () => {
  it('rawNestingDepth counts bracket/paren nesting and ignores unmatched closers', () => {
    expect(rawNestingDepth('()')).toBe(1);
    expect(rawNestingDepth('([{}])')).toBe(3);
    expect(rawNestingDepth(')))')).toBe(0);
    expect(rawNestingDepth('plain text')).toBe(0);
  });

  it('complexityError rejects a literal exponent over the limit', () => {
    const bigPow = { type: 'Power', base: { type: 'Identifier', name: 'x' }, exponent: { type: 'NumberLiteral', value: 5000 } };
    expect(complexityError(bigPow)).toMatch(/exponent/);
  });

  it('complexityError accepts a normal small program AST', () => {
    expect(complexityError({ type: 'Program', body: [] })).toBeNull();
  });

  it('sanitizeError maps stack/BigInt overflow messages to E_RESOURCE_LIMIT, else E_INTERNAL', () => {
    expect(sanitizeError(new RangeError('Maximum call stack size exceeded')).code).toBe('E_RESOURCE_LIMIT');
    expect(sanitizeError(new Error('something unrelated broke')).code).toBe('E_INTERNAL');
  });

  it('a source over MAX_SOURCE_LENGTH is rejected before any parsing', () => {
    const huge = 'x'.repeat(MAX_SOURCE_LENGTH + 1);
    const env = parse(huge);
    expect(env.ok).toBe(false);
    expect(env.result).toBeNull();
    expect(env.errors[0]?.code).toBe('E_PAYLOAD_TOO_LARGE');
  });

  it('a source over MAX_NESTING raw bracket depth is rejected before any parsing', () => {
    const deep = '('.repeat(MAX_NESTING + 1) + 'x' + ')'.repeat(MAX_NESTING + 1);
    const env = parse(deep);
    expect(env.ok).toBe(false);
    expect(env.errors[0]?.code).toBe('E_RESOURCE_LIMIT');
  });

  it('interpret rejects a literal power exponent over MAX_EXPONENT before evaluating', () => {
    const env = interpretTool('2^5000 => r\nr^0\n');
    expect(env.ok).toBe(false);
    expect(env.result).toBeNull();
    expect(env.errors[0]?.code).toBe('E_RESOURCE_LIMIT');
    expect(env.errors[0]?.message).toMatch(/exponent/);
  });
});
