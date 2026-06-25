import type { FunctionDef } from '@eml/types';

/**
 * Rule-based "logic crystallization" (whitepaper §7.3), MVP form.
 *
 * Full Logic Crystallization is an AI-driven later phase. The MVP de-scaling is
 * purely deterministic: hash a function's structure (params + body, ignoring
 * name, decorators, and source spans) and remember which hashes have been seen.
 * A repeated hash means "this exact cold logic was already crystallized" — a
 * real engine would reuse cached bytecode; here we surface it as `cached: true`
 * metadata. The emitted Python is never altered, so output stays deterministic
 * and correct regardless of cache state.
 */

/** Stable structural serialization: sorted keys, `span` dropped. */
function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => k !== 'span')
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`).join(',')}}`;
}

/** FNV-1a 32-bit hash, rendered as 8 hex chars. Deterministic and dependency-free. */
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Structural hash of a function's *logic*: its parameters and body only. The
 * name, decorators (cold/hot), and spans are intentionally excluded so two
 * identically-bodied functions crystallize to the same key.
 */
export function hashFunction(fn: FunctionDef): string {
  return fnv1a(canonical({ params: fn.params, body: fn.body }));
}

/** Serialized form of a {@link CrystalCache} — plain JSON, safe to persist. */
export interface CrystalCacheData {
  version: 1;
  /** logic hash -> number of times it has been crystallized (across runs). */
  entries: Record<string, number>;
}

/**
 * Crystallization cache keyed by {@link hashFunction}.
 *
 * Pure and dependency-free so it runs in the browser too; persistence is the
 * caller's job ({@link toJSON}/{@link fromJSON} + fs in the CLI, localStorage in
 * the editor). Tracks a hit count per logic hash for reporting.
 */
export class CrystalCache {
  private readonly counts: Map<string, number>;

  constructor(counts?: Map<string, number>) {
    this.counts = counts ?? new Map();
  }

  /** True if this logic hash has been stored before. */
  has(hash: string): boolean {
    return this.counts.has(hash);
  }

  /** Record a logic hash; returns true if it was already present (a cache hit). */
  store(hash: string): boolean {
    const hit = this.counts.has(hash);
    this.counts.set(hash, (this.counts.get(hash) ?? 0) + 1);
    return hit;
  }

  /** Times this logic hash has been crystallized (0 if never). */
  count(hash: string): number {
    return this.counts.get(hash) ?? 0;
  }

  get size(): number {
    return this.counts.size;
  }

  /** A non-mutating copy — used for read-only checks during live editing. */
  clone(): CrystalCache {
    return new CrystalCache(new Map(this.counts));
  }

  /** Plain-JSON snapshot for persistence. */
  toJSON(): CrystalCacheData {
    return { version: 1, entries: Object.fromEntries(this.counts) };
  }

  /** Rebuild a cache from a snapshot; tolerates null/malformed input (-> empty). */
  static fromJSON(data: unknown): CrystalCache {
    const cache = new CrystalCache();
    if (
      data &&
      typeof data === 'object' &&
      'entries' in data &&
      data.entries &&
      typeof data.entries === 'object'
    ) {
      for (const [hash, count] of Object.entries(data.entries as Record<string, unknown>)) {
        if (typeof hash === 'string' && typeof count === 'number' && count > 0) {
          cache.counts.set(hash, count);
        }
      }
    }
    return cache;
  }
}
