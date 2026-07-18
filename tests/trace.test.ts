import { describe, it, expect } from 'vitest';
import {
  createEmitter,
  memorySink,
  multiSink,
  toJsonl,
  parseStream,
  findAnomalies,
  summarize,
  EML_TRACE_PROTOCOL,
  type TraceEvent,
} from '@eml/trace';

const fixedNow = () => '2026-01-01T00:00:00.000Z';

describe('@eml/trace — phosphor-jsonl-v1 emitter', () => {
  it('stamps a conformant envelope with monotonic seq/mono', () => {
    const em = createEmitter({ stream: 'eml', writer: 'w1', now: fixedNow });
    const a = em.emit('eml:compile', { file: 'x.eml' });
    const b = em.emit('eml:run');
    expect(a.proto).toBe(EML_TRACE_PROTOCOL);
    expect(a.stream).toBe('eml');
    expect(a.writer).toBe('w1');
    expect(a.ts).toBe('2026-01-01T00:00:00.000Z');
    expect(a.seq).toBe(1);
    expect(b.seq).toBe(2);
    expect((b.mono as number) > (a.mono as number)).toBe(true);
    expect(a.file).toBe('x.eml');
    expect(em.events).toHaveLength(2);
  });

  it('omits writer when not provided', () => {
    const em = createEmitter({ stream: 'eml', now: fixedNow });
    expect('writer' in em.emit('eml:x')).toBe(false);
  });

  it('check() emits {actual,expected,ok} and returns ok', () => {
    const em = createEmitter({ stream: 'eml', now: fixedNow });
    expect(em.check('eml:check', 55, 55)).toBe(true);
    expect(em.check('eml:check', 54, 55)).toBe(false);
    expect(em.events[0]!.ok).toBe(true);
    expect(em.events[1]!.ok).toBe(false);
    // structural equality, not reference
    expect(em.check('eml:check', { a: [1, 2] }, { a: [1, 2] })).toBe(true);
  });

  it('never throws when a sink throws', () => {
    const em = createEmitter({ stream: 'eml', now: fixedNow, sink: () => { throw new Error('boom'); } });
    expect(() => em.emit('eml:x')).not.toThrow();
  });

  it('multiSink fans out and isolates a failing sink', () => {
    const buf: TraceEvent[] = [];
    const em = createEmitter({
      stream: 'eml',
      now: fixedNow,
      sink: multiSink(() => { throw new Error('bad'); }, memorySink(buf)),
    });
    em.emit('eml:x');
    expect(buf).toHaveLength(1);
  });

  it('round-trips through toJsonl/parseStream', () => {
    const em = createEmitter({ stream: 'eml', now: fixedNow });
    em.emit('eml:a', { n: 1 });
    em.emit('eml:b', { n: 2 });
    const parsed = parseStream(toJsonl(em.events));
    expect(parsed).toHaveLength(2);
    expect(parsed[1]!.n).toBe(2);
  });

  it('findAnomalies flags ok:false, :error types, and non-zero code', () => {
    const em = createEmitter({ stream: 'eml', now: fixedNow });
    em.emit('eml:ok', { ok: true });
    em.check('eml:check', 1, 2); // ok:false
    em.emit('eml:compile:error', { message: 'x' });
    em.emit('eml:run', { code: 1 });
    em.emit('eml:run', { code: 0 });
    const anomalies = findAnomalies(em.events);
    expect(anomalies).toHaveLength(3);
  });

  // Review regressions: check()'s equality must not declare unequal values equal.
  it('check() distinguishes Date / Map / Set / RegExp by value (no false positives)', () => {
    const em = createEmitter({ stream: 'eml', now: fixedNow });
    expect(em.check('t', new Date(0), new Date(1000))).toBe(false);
    expect(em.check('t', new Date(5), new Date(5))).toBe(true);
    expect(em.check('t', new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
    expect(em.check('t', new Set([1]), new Set([2]))).toBe(false);
    expect(em.check('t', /a/, /b/)).toBe(false);
  });

  it('check() treats an array and a same-keyed object as unequal, and NaN as equal', () => {
    const em = createEmitter({ stream: 'eml', now: fixedNow });
    expect(em.check('t', [1, 2], { 0: 1, 1: 2 })).toBe(false);
    expect(em.check('t', [], {})).toBe(false);
    expect(em.check('t', NaN, NaN)).toBe(true);
    expect(em.check('t', 1, 2)).toBe(false);
  });

  it('findAnomalies flags :failure / :errors segments (not just :error)', () => {
    const mk = (type: string): TraceEvent => ({ stream: 'eml', proto: 'phosphor-jsonl-v1', seq: 0, ts: 't', type });
    expect(findAnomalies([mk('eml:failure')]).length).toBe(1);
    expect(findAnomalies([mk('eml:errors')]).length).toBe(1);
    expect(findAnomalies([mk('eml:ok')]).length).toBe(0);
  });

  it('summarize counts totals, types, and anomalies', () => {
    const em = createEmitter({ stream: 'eml', now: fixedNow });
    em.emit('eml:a');
    em.emit('eml:a');
    em.check('eml:check', 1, 2);
    const s = summarize(em.events);
    expect(s.total).toBe(3);
    expect(s.byType['eml:a']).toBe(2);
    expect(s.anomalies).toBe(1);
  });
});
