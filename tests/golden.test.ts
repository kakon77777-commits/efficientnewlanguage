import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transpileEmlToPython, formatPython } from '@eml/transpiler-python';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, 'fixtures');
const emlFiles = readdirSync(fixturesDir)
  .filter((f) => f.endsWith('.eml'))
  .sort();

describe('golden fixtures (EML -> Python full program)', () => {
  for (const f of emlFiles) {
    const base = f.replace(/\.eml$/, '');
    it(base, () => {
      const src = readFileSync(join(fixturesDir, f), 'utf8');
      const expected = formatPython(
        readFileSync(join(fixturesDir, `${base}.expected.py`), 'utf8'),
      );
      const result = transpileEmlToPython(src, { fileName: f });
      expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
      expect(result.python).toBe(expected);
    });
  }
});
