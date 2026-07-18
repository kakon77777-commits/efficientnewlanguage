/**
 * @eml/trace — a self-contained, zero-dependency EML trace emitter, using the
 * frozen wire-format protocol id `phosphor-jsonl-v1`.
 *
 * EML emits its compile/run/temporal/bug events under this protocol id so any
 * external tool that already speaks it can consume an EML trace — but EML has
 * no runtime dependency on any such tool; the id is a compatibility identifier
 * only, not an integration requirement.
 *
 * Wire format: one JSON object per line. Envelope fields are fixed; everything
 * else is arbitrary domain payload.
 *
 * This module is browser-safe (no node imports). The Node file sink lives in
 * `@eml/trace/node`.
 */

export const EML_TRACE_PROTOCOL = 'phosphor-jsonl-v1';

/** One event = one JSONL line. */
export interface TraceEvent {
  /** App / stream id, e.g. "eml". */
  stream: string;
  /** Always {@link EML_TRACE_PROTOCOL}. */
  proto: string;
  /** Per-writer monotonic counter (NOT globally unique). */
  seq: number;
  /** ISO-8601 timestamp. */
  ts: string;
  /** Namespaced "domain:action", e.g. "eml:bug". */
  type: string;
  /** Writer instance id — enables global ordering across writers. */
  writer?: string;
  /** Per-writer high-resolution tiebreaker for same-`ts` ordering. */
  mono?: number;
  /** Arbitrary domain payload. */
  [field: string]: unknown;
}

export type Sink = (event: TraceEvent) => void;

export interface EmitterOptions {
  /** Stream id stamped on every event. */
  stream: string;
  /** Optional writer instance id (omit for single-writer streams). */
  writer?: string;
  /** Where events go; defaults to an in-memory buffer exposed as `emitter.events`. */
  sink?: Sink;
  /** Injectable clock for deterministic tests; defaults to wall-clock ISO-8601. */
  now?: () => string;
}

export interface Emitter {
  /** Emit an event of `type` with optional domain `fields`; returns the event. */
  emit(type: string, fields?: Record<string, unknown>): TraceEvent;
  /**
   * Intent-vs-actual check — the bug-signal primitive. Emits `{actual, expected,
   * ok}` and returns `ok`. A later consumer's anomaly scan keys on `ok === false`.
   */
  check(type: string, actual: unknown, expected: unknown, fields?: Record<string, unknown>): boolean;
  /** The in-memory buffer (only meaningful when using the default memory sink). */
  readonly events: readonly TraceEvent[];
}

/** A sink that appends to a caller-owned array. */
export function memorySink(buffer: TraceEvent[]): Sink {
  return (e) => {
    buffer.push(e);
  };
}

/** A sink that writes one JSON line per event to the console. */
export function consoleSink(): Sink {
  return (e) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(e));
  };
}

/** Fan-out to several sinks; one failing sink never blocks the others. */
export function multiSink(...sinks: Sink[]): Sink {
  return (e) => {
    for (const s of sinks) {
      try {
        s(e);
      } catch {
        /* best-effort: a monitor must never break the host */
      }
    }
  };
}

export function createEmitter(opts: EmitterOptions): Emitter {
  const buffer: TraceEvent[] = [];
  const sink = opts.sink ?? memorySink(buffer);
  const now = opts.now ?? (() => new Date().toISOString());
  let seq = 0;
  let mono = 0;

  const write = (type: string, fields: Record<string, unknown>): TraceEvent => {
    const event: TraceEvent = {
      stream: opts.stream,
      proto: EML_TRACE_PROTOCOL,
      seq: ++seq,
      ts: now(),
      type,
      ...(opts.writer !== undefined ? { writer: opts.writer } : {}),
      mono: ++mono,
      ...fields,
    };
    try {
      sink(event);
    } catch {
      /* emit() never throws — a trace failure must not break the host */
    }
    return event;
  };

  return {
    emit: (type, fields = {}) => write(type, fields),
    check: (type, actual, expected, fields = {}) => {
      const ok = deepEqual(actual, expected);
      write(type, { ...fields, actual, expected, ok });
      return ok;
    },
    get events() {
      return buffer;
    },
  };
}

// ── Consumer helpers ────────────────────────────────────────────────────────

/** Serialize events to JSONL text (one object per line, trailing newline). */
export function toJsonl(events: readonly TraceEvent[]): string {
  return events.map((e) => JSON.stringify(e)).join('\n') + '\n';
}

/** Parse JSONL text back into events (blank lines skipped). */
export function parseStream(text: string): TraceEvent[] {
  return text
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((l) => JSON.parse(l) as TraceEvent);
}

/**
 * Bug signals: events that failed an intent check (`ok === false`), are an error
 * type (`:error` / `:fail`), or carry a non-zero exit `code`.
 */
export function findAnomalies(events: readonly TraceEvent[]): TraceEvent[] {
  return events.filter(
    (e) =>
      e.ok === false ||
      // a `:error` / `:fail` / `:failure` / `:errors` segment marks an error type
      /:(error|fail)/.test(e.type) ||
      (typeof e.code === 'number' && e.code !== 0),
  );
}

export interface StreamSummary {
  total: number;
  byType: Record<string, number>;
  anomalies: number;
}

export function summarize(events: readonly TraceEvent[]): StreamSummary {
  const byType: Record<string, number> = {};
  for (const e of events) byType[e.type] = (byType[e.type] ?? 0) + 1;
  return { total: events.length, byType, anomalies: findAnomalies(events).length };
}

/**
 * Structural equality for {@link Emitter.check} — the bug-signal primitive, so it
 * must NOT report unequal values as equal (a false positive would silently drop a
 * real mismatch). Handles primitives (incl. NaN), arrays, Date, RegExp, Map, Set,
 * and plain objects; distinct types and class instances compare unequal.
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'number') return Number.isNaN(a) && Number.isNaN(b as number);
  if (a === null || b === null || typeof a !== 'object') return false;

  // Arrays: an array is never equal to a non-array.
  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  if (aArr !== bArr) return false;
  if (aArr && bArr) {
    return a.length === (b as unknown[]).length && a.every((x, i) => deepEqual(x, (b as unknown[])[i]));
  }

  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (a instanceof RegExp || b instanceof RegExp) {
    return a instanceof RegExp && b instanceof RegExp && a.source === b.source && a.flags === b.flags;
  }
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k))) return false;
    return true;
  }
  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set && b instanceof Set) || a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }

  // Only compare plain objects structurally; class instances (state in private
  // slots) fall through to unequal rather than being declared equal on []==[].
  if (!isPlainObject(a) || !isPlainObject(b as object)) return false;
  const ak = Object.keys(a as object);
  const bk = Object.keys(b as object);
  return (
    ak.length === bk.length &&
    ak.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  );
}

function isPlainObject(v: object): boolean {
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}
