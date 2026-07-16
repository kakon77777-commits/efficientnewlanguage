/**
 * Thin adapter: registers tools.ts's pure functions on a McpServer. This is the
 * only file that imports @modelcontextprotocol/sdk — logic itself lives in
 * tools.ts so it stays testable without a protocol connection (mirrors
 * @eml/lsp's logic.ts / server.ts split).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as tools from './tools';
import type { Envelope } from './tools';

const SOURCE_SCHEMA = { source: z.string() };

function toResult(envelope: Envelope): {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent: Record<string, unknown>;
  isError: boolean;
} {
  return {
    content: [{ type: 'text', text: JSON.stringify(envelope, null, 2) }],
    // Envelope is a plain JSON-serializable object; the SDK's structuredContent
    // slot is typed as an index-signature record rather than our named interface.
    structuredContent: envelope as unknown as Record<string, unknown>,
    // isError is reserved for genuinely unexpected failures (E_INTERNAL-class) —
    // a normal compile/runtime diagnostic (ok:false with populated `errors`) is
    // NOT an MCP-level error, mirroring the REST worker's own choice to return
    // HTTP 200 for ok:false. This matches MCP's documented philosophy
    // (CallToolResultSchema's own doc comment): tool-domain errors belong in the
    // result object so the agent can see and self-correct, not as a protocol-
    // level error the agent can't introspect.
    isError: envelope.errors.some((e) => e.code === 'E_INTERNAL'),
  };
}

function register(server: McpServer, name: string, description: string, fn: (source: string) => Envelope): void {
  server.registerTool(name, { description, inputSchema: SOURCE_SCHEMA }, async ({ source }) => toResult(fn(source)));
}

export function createServer(): McpServer {
  const server = new McpServer({ name: 'eml', version: '0.1.0' });

  register(server, 'parse', 'Parse EML source and return its AST plus compile diagnostics.', tools.parse);
  register(server, 'transpile_python', 'Transpile EML source to Python.', tools.transpilePython);
  register(server, 'transpile_eml', 'Transpile Python source (supported subset) to EML/Py+.', tools.transpileEml);
  register(server, 'interpret', 'Interpret EML source and return its program output.', tools.interpretTool);
  register(
    server,
    'trace',
    'Interpret EML source and return its phosphor-jsonl-v1 execution trace.',
    tools.traceTool,
  );
  register(
    server,
    'roundtrip',
    'Verify EML -> Python -> EML -> Python reaches a fixpoint (transpiler self-check).',
    tools.roundtrip,
  );

  server.registerTool(
    'health',
    { description: 'Report EML MCP server health, version, and enforced resource limits.', inputSchema: {} },
    async () => toResult(tools.health()),
  );

  return server;
}
