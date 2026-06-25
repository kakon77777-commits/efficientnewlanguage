import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';
import { createEmitter } from '@eml/trace';

/**
 * Phase 5 completion criterion 「所有示範都有測試與截圖/trace」: every shipped
 * example must (1) be loaded from disk and transpile cleanly — the demo FILE
 * itself, not just an inline copy — and (2) carry a committed phosphor-jsonl-v1
 * trace artifact that this test regenerates and byte-compares (a golden). The
 * trace is the `eml trace <file> --deterministic` output, so the artifact is
 * reproducible anywhere without a Python runtime.
 */

const here = dirname(fileURLToPath(import.meta.url));
const examplesDir = join(here, '..', 'examples');
const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

function allExamples(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...allExamples(p));
    else if (ent.name.endsWith('.eml')) out.push(p);
  }
  return out.sort();
}

/** Replicates `cmdTrace(... --deterministic)` exactly so the golden is the CLI's. */
function deterministicTrace(file: string, src: string): string {
  const em = createEmitter({ stream: 'eml', now: FIXED_CLOCK });
  interpret(src, { emitter: em, file: basename(file), now: FIXED_CLOCK });
  return em.events.map((e) => JSON.stringify(e)).join('\n') + '\n';
}

const examples = allExamples(examplesDir);

describe('examples are real, tested demo files', () => {
  it('there are example files to test', () => {
    expect(examples.length).toBeGreaterThanOrEqual(6);
  });

  for (const file of examples) {
    const rel = file.slice(examplesDir.length + 1).replace(/\\/g, '/');
    const src = readFileSync(file, 'utf8');

    it(`${rel} transpiles with no error diagnostics`, () => {
      const r = transpileEmlToPython(src, { fileName: basename(file) });
      const errors = r.diagnostics.filter((d) => d.severity === 'error');
      expect(errors, errors.map((d) => `${d.code}: ${d.message}`).join('\n')).toHaveLength(0);
      expect(r.ok).toBe(true);
      expect(r.python.trim().length).toBeGreaterThan(0);
    });

    it(`${rel} has a matching committed trace artifact`, () => {
      const tracePath = file.replace(/\.eml$/, '.trace.jsonl');
      let committed: string;
      try {
        committed = readFileSync(tracePath, 'utf8');
      } catch {
        throw new Error(
          `missing trace artifact ${basename(tracePath)} — regenerate with: eml trace ${rel} --deterministic --out <path>`,
        );
      }
      // Normalize line endings (git may check out CRLF) before comparing.
      expect(deterministicTrace(file, src).replace(/\r\n/g, '\n')).toBe(committed.replace(/\r\n/g, '\n'));
    });
  }
});
