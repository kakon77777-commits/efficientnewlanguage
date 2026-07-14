import { pathToFileURL } from 'node:url';
import { createServer } from './server';

export * from './logic';
export * from './server';

/**
 * Auto-launch over real stdio ONLY when this file is the actual process
 * entry point (`tsx packages/lsp/src/index.ts`) — not when `@eml/lsp` is
 * merely imported (e.g. by `tests/lsp-protocol.test.ts`, which calls
 * `createServer()` itself with injected in-memory streams). Comparing
 * `import.meta.url` to the resolved entry-script path is the standard ESM
 * "is this the main module" check.
 */
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createServer(process.stdin, process.stdout);
}
