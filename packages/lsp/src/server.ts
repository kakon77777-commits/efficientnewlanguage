/**
 * Thin protocol adapter: wires the pure functions in `logic.ts` to a real
 * `vscode-languageserver` `Connection`. Takes explicit input/output streams
 * (rather than the zero-arg auto-detect overload) so tests can inject
 * in-memory streams instead of real stdio — see `tests/lsp-protocol.test.ts`.
 */
import { createConnection } from 'vscode-languageserver/node';
import { TextDocuments, TextDocumentSyncKind, type Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { analyzeDocument, toLspDiagnostics, computeHover, buildCompletionItems } from './logic';

export function createServer(input: NodeJS.ReadableStream, output: NodeJS.WritableStream): Connection {
  const connection = createConnection(input, output);
  const documents = new TextDocuments(TextDocument);

  const publish = (doc: TextDocument): void => {
    const analyzed = analyzeDocument(doc.getText());
    connection.sendDiagnostics({ uri: doc.uri, diagnostics: toLspDiagnostics(analyzed) });
  };

  documents.onDidOpen((e) => publish(e.document));
  documents.onDidChangeContent((e) => publish(e.document));

  connection.onHover((params) => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return null;
    return computeHover(analyzeDocument(doc.getText()), params.position);
  });

  connection.onCompletion(() => buildCompletionItems());

  connection.onInitialize(() => ({
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      hoverProvider: true,
      completionProvider: { triggerCharacters: ['^', '@'] },
    },
  }));

  documents.listen(connection);
  connection.listen();
  return connection;
}
