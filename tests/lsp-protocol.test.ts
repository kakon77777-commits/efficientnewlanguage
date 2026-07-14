import { describe, it, expect } from 'vitest';
import { PassThrough } from 'node:stream';
import { createServer } from '@eml/lsp';
import { createMessageConnection } from 'vscode-jsonrpc/node';
import {
  InitializeRequest,
  InitializedNotification,
  DidOpenTextDocumentNotification,
  HoverRequest,
  CompletionRequest,
  PublishDiagnosticsNotification,
} from 'vscode-languageserver-protocol/node';

/**
 * ONE real end-to-end integration test proving the actual `vscode-
 * languageserver` connection wiring works — not just the pure `logic.ts`
 * functions (see tests/lsp-logic.test.ts for those). Runs entirely
 * in-process over in-memory duplex streams (no child process, no
 * filesystem, no network): initialize handshake, didOpen ->
 * publishDiagnostics, hover, and completion.
 */
describe('@eml/lsp — protocol-level integration (in-process)', () => {
  it('speaks real LSP: initialize, diagnostics, hover, completion', async () => {
    const up = new PassThrough(); // client -> server
    const down = new PassThrough(); // server -> client
    createServer(up, down); // server reads "up", writes "down"

    const client = createMessageConnection(down, up);
    client.listen();

    const initResult = await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
    expect(initResult.capabilities.hoverProvider).toBe(true);
    expect(initResult.capabilities.completionProvider?.triggerCharacters).toContain('^');
    client.sendNotification(InitializedNotification.type, {});

    const uri = 'file:///t.eml';
    const text = 'x^+1\ndef f():\n    return 1\ndef f():\n    return 2\n';

    const diagnosticsPromise = new Promise<{ uri: string; diagnostics: unknown[] }>((resolve) => {
      client.onNotification(PublishDiagnosticsNotification.type, (params) => resolve(params));
    });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'eml', version: 1, text },
    });
    const published = await diagnosticsPromise;
    expect(published.uri).toBe(uri);
    expect(published.diagnostics).toHaveLength(1); // the W_FN_REDECLARED warning

    const hover = await client.sendRequest(HoverRequest.type, {
      textDocument: { uri },
      position: { line: 0, character: 0 }, // on "x^+1"
    });
    expect((hover?.contents as { value: string }).value).toContain('x = 1');

    const completions = await client.sendRequest(CompletionRequest.type, {
      textDocument: { uri },
      position: { line: 1, character: 0 },
    });
    const items = Array.isArray(completions) ? completions : (completions?.items ?? []);
    const outputCompletion = items.find((i: { label: string }) => i.label === '^0');
    expect(outputCompletion).toBeDefined();
    expect((outputCompletion!.documentation as { value: string }).value).toContain('print');
  });
});
