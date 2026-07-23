import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { EmlSymbolTable, SymbolDefinition } from '@eml/types';

/**
 * Canonical static symbol table lives at repo root: `eml-symbols.json`. Resolved
 * by walking UP from this module's own location rather than a single hardcoded
 * relative offset, so this keeps working both in dev (this file sits 3 levels
 * under the repo root) and once bundled into `@eml/cli`'s single-file output
 * (whose build copies `eml-symbols.json` next to the bundle — see
 * `packages/cli/package.json`'s `build` script — so it's found one level up
 * instead). A fixed `../../../` offset breaks silently once bundled: the
 * bundle's own on-disk location no longer matches the source tree shape, so
 * `import.meta.url` resolves somewhere else entirely (this was a real bug,
 * caught via a genuine external-install verification, not a hypothetical).
 */
function findSymbolsFile(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, 'eml-symbols.json');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`eml-symbols.json not found by walking up from ${startDir}`);
}

const SYMBOLS_PATH = findSymbolsFile(dirname(fileURLToPath(import.meta.url)));

// eml-symbols.json is EML-P's current symbol table (21 entries, flat
// symbol -> {name, category, python, description, namespace}) — see
// docs/EML-P-PROFILE.md. It is host-bound (each entry's `python` field is
// the only emission target) and has no version/schema marker of its own.
// Consumers (this module, the LSP completion provider) iterate its keys
// directly via Object.entries(), so do not add a top-level sibling key
// (e.g. "version") to the JSON itself — it would be silently treated as a
// 22nd symbol. EML-P Phase P2's candidate symbols and EML-U's eventual
// host-neutral semantic registry (docs/EML-U-PROFILE.md) will both live in
// new files/versions rather than mutating these 21 existing keys.
export const EML_SYMBOLS: EmlSymbolTable = JSON.parse(
  readFileSync(SYMBOLS_PATH, 'utf8'),
) as EmlSymbolTable;

export function lookupSymbol(symbol: string): SymbolDefinition | undefined {
  return EML_SYMBOLS[symbol];
}
