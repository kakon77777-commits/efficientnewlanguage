/**
 * Node-only sinks for @eml/trace (file output). Kept out of the core so the main
 * entry stays browser-safe. Import from `@eml/trace/node`.
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Sink, TraceEvent } from './index';

/**
 * Append events as JSONL to `path`, creating parent dirs on first write. Writes
 * are best-effort: an I/O failure is swallowed so tracing never breaks the host.
 */
export function fileSink(path: string): Sink {
  let dirReady = false;
  return (e: TraceEvent): void => {
    try {
      if (!dirReady) {
        mkdirSync(dirname(path) || '.', { recursive: true });
        dirReady = true;
      }
      appendFileSync(path, JSON.stringify(e) + '\n');
    } catch {
      /* best-effort */
    }
  };
}
