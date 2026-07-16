import { describe, it, expect } from 'vitest';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createServer } from '@eml/mcp';

/**
 * ONE real end-to-end integration test proving the actual `McpServer`
 * connection wiring works — not just the pure `tools.ts` functions (see
 * tests/mcp-logic.test.ts for those). Runs entirely in-process over the SDK's
 * own first-class in-memory transport pair (no child process, no stdio).
 */
describe('@eml/mcp — protocol-level integration (in-process)', () => {
  it('speaks real MCP: tool listing, a clean call, and a compile-error call', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    const client = new Client({ name: 'test-client', version: '0.0.0' });

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(
      ['health', 'interpret', 'parse', 'roundtrip', 'trace', 'transpile_eml', 'transpile_python'].sort(),
    );

    const goodResult = await client.callTool({
      name: 'transpile_python',
      arguments: { source: 'N^+100\nΣ(i^2, i in [1:N]) => r\nr^0\n' },
    });
    expect(goodResult.isError).toBeFalsy();
    const goodEnvelope = goodResult.structuredContent as any;
    expect(goodEnvelope.ok).toBe(true);
    expect(goodEnvelope.result.python).toContain('range(1, N+1)');

    const badResult = await client.callTool({
      name: 'transpile_python',
      arguments: { source: 'x^+1\nclass Foo(Bar):\n    def m(self):\n        return 1\n' },
    });
    // A compile diagnostic is a normal tool result, NOT an MCP-protocol error —
    // the agent must be able to read result.errors and self-correct.
    expect(badResult.isError).toBeFalsy();
    const badEnvelope = badResult.structuredContent as any;
    expect(badEnvelope.ok).toBe(false);
    expect(badEnvelope.errors[0].code).toBe('E_PARSE');

    const healthResult = await client.callTool({ name: 'health', arguments: {} });
    const healthEnvelope = healthResult.structuredContent as any;
    expect(healthEnvelope.result.status).toBe('healthy');

    await client.close();
    await server.close();
  });
});
