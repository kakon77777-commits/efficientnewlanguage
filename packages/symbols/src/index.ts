import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { EmlSymbolTable, SymbolDefinition } from '@eml/types';

/** Canonical static symbol table lives at repo root: eml-symbols.json. */
const SYMBOLS_PATH = fileURLToPath(new URL('../../../eml-symbols.json', import.meta.url));

export const EML_SYMBOLS: EmlSymbolTable = JSON.parse(
  readFileSync(SYMBOLS_PATH, 'utf8'),
) as EmlSymbolTable;

export function lookupSymbol(symbol: string): SymbolDefinition | undefined {
  return EML_SYMBOLS[symbol];
}
