import { pathToFileURL } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server';

export * from './guards';
export * from './tools';
export * from './server';

// Auto-launch over real stdio ONLY when this module is the actual process
// entry point — so importing @eml/mcp from a test never opens a live
// connection as a side effect. Same guard pattern as @eml/lsp's index.ts.
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}
