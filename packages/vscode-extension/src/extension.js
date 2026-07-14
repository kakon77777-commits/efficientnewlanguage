// Plain CommonJS, not TypeScript — deliberate. VS Code's extension host
// `require()`-loads `main` synchronously with no bundler/tsx registration
// active in that process. Every other package in this monorepo skips a
// build step because WE control how it's invoked (tsx/vitest); the
// extension host is VS Code's own runtime, which we don't control.
// Introducing the repo's first build step just for this prototype would
// contradict the "no build step" convention, so this stays small,
// dependency-light, plain JS. The LSP SERVER (`@eml/lsp`), by contrast, is a
// child process we fully control, so it keeps running straight off `.ts`
// via tsx — no compromise needed there.
//
// Prototype scope (matches the C++ back end's "PROTOTYPE not backend"
// framing, see docs/cpp-feasibility.md): this only works when launched via
// VS Code's Extension Development Host (F5) with THIS monorepo checkout
// open as the workspace root, since it spawns the server by a
// workspace-relative path rather than a bundled, published artifact.

const path = require('node:path');
const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient/node');

/** @type {import('vscode-languageclient/node').LanguageClient | undefined} */
let client;

function activate(context) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage(
      'EML Language Support: no workspace folder open — this dev prototype needs the EML monorepo checkout open as the workspace root.',
    );
    return;
  }

  // The real JS entry file (`tsx@4.23.1`'s own "bin": "./dist/cli.mjs"), NOT
  // `node_modules/.bin/tsx` — sidesteps Windows shell-shim (`tsx.CMD`)
  // quoting/`shell:true` headaches in child_process.spawn.
  const tsxCli = path.join(workspaceRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const serverEntry = path.join(workspaceRoot, 'packages', 'lsp', 'src', 'index.ts');

  /** @type {import('vscode-languageclient/node').ServerOptions} */
  const serverOptions = {
    command: process.execPath,
    args: [tsxCli, serverEntry],
    transport: TransportKind.stdio,
  };

  /** @type {import('vscode-languageclient/node').LanguageClientOptions} */
  const clientOptions = {
    documentSelector: [{ scheme: 'file', language: 'eml' }],
  };

  client = new LanguageClient('emlLanguageServer', 'EML Language Server', serverOptions, clientOptions);
  context.subscriptions.push(client);
  client.start();
}

function deactivate() {
  return client?.stop();
}

module.exports = { activate, deactivate };
