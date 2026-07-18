#!/usr/bin/env node
/**
 * EML Studio launcher — the single "可以啟動的執行檔" entry point.
 *
 * Usage:
 *   node scripts/launch.mjs               # start Cogni-Editor + open the browser
 *   node scripts/launch.mjs studio        #   (same as default)
 *   node scripts/launch.mjs demo          # run the canonical sum-of-squares demo
 *   node scripts/launch.mjs run f.eml     # forward any other args to the `eml` CLI
 *
 * The project runs from TypeScript source (no build step), so this just wires up
 * pnpm scripts and opens a browser — no compiled binary to maintain.
 *
 * Env:
 *   EML_STUDIO_PORT   override the editor port (default 5179)
 *   EML_NO_OPEN=1     start the server but do not auto-open a browser
 */
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.EML_STUDIO_PORT || '5179';
const URL = `http://localhost:${PORT}/`;
const IS_WIN = process.platform === 'win32';

/** CLI subcommands forwarded to the `eml` tool (packages/cli). */
const CLI_COMMANDS = new Set([
  'parse', 'ast', 'transpile', 'run', 'cts', 'check', 'explain',
  'compress', 'suggest', 'roundtrip', 'crystallize', 'bugs', 'trace', 'test',
]);

function openBrowser(url) {
  try {
    if (IS_WIN) spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true }).unref();
    else if (process.platform === 'darwin') spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
    else spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref();
  } catch {
    console.log(`（無法自動開啟瀏覽器，請手動前往 ${url}）`);
  }
}

/** Poll the dev server until it answers, then run cb(true); cb(false) on timeout. */
function waitForServer(url, triesLeft, cb) {
  const req = http.get(url, (res) => {
    res.resume();
    cb(true);
  });
  req.on('error', () => {
    if (triesLeft <= 0) return cb(false);
    setTimeout(() => waitForServer(url, triesLeft - 1, cb), 300);
  });
}

/** Quote an arg for a shell invocation when it contains whitespace/specials. */
function shellQuote(a) {
  return /[\s"&|<>^()]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a;
}

/**
 * Resolve how to invoke pnpm. Prefer a directly-runnable `pnpm`; otherwise fall
 * back to `corepack pnpm` — corepack ships with Node, so it is reachable wherever
 * `node` is. That makes the launcher robust to a stale or pnpm-less PATH, which
 * is the common Windows "double-click the .cmd" case.
 */
let RUNNER = null;
function resolveRunner() {
  if (RUNNER) return RUNNER;
  const probe = spawnSync('pnpm', ['--version'], { shell: IS_WIN, stdio: 'ignore' });
  RUNNER =
    !probe.error && probe.status === 0
      ? { cmd: 'pnpm', pre: [] }
      : { cmd: 'corepack', pre: ['pnpm'] };
  if (RUNNER.cmd === 'corepack') console.log('（pnpm 不在 PATH，改用 corepack pnpm）');
  return RUNNER;
}

function spawnPnpm(args) {
  const runner = resolveRunner();
  const full = [...runner.pre, ...args];
  // Node refuses to spawn `.cmd` shims (pnpm/corepack on Windows) without a
  // shell, so use one there and quote args defensively; POSIX spawns directly.
  const finalArgs = IS_WIN ? full.map(shellQuote) : full;
  const child = spawn(runner.cmd, finalArgs, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: IS_WIN,
    env: { ...process.env, COREPACK_ENABLE_DOWNLOAD_PROMPT: '0' },
  });
  child.on('error', (e) => {
    console.error(`\n啟動失敗：無法執行 ${runner.cmd}（${e.message}）。請確認已安裝 Node.js（node -v）與 pnpm。`);
    process.exit(1);
  });
  return child;
}

function startStudio() {
  console.log('🧊🔥 EML Workbench 啟動中…');
  // Port comes from vite.config (which reads EML_STUDIO_PORT too), so the child
  // and this launcher agree on the URL without fragile `--` arg forwarding.
  const child = spawnPnpm(['--filter', '@eml/workbench', 'dev']);
  child.on('exit', (code) => process.exit(code ?? 0));
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      child.kill();
      process.exit(0);
    });
  }
  if (process.env.EML_NO_OPEN === '1') {
    console.log(`伺服器啟動中，請前往 ${URL}（已停用自動開啟瀏覽器）`);
    return;
  }
  waitForServer(URL, 60, (ok) => {
    if (ok) {
      console.log(`✓ 已就緒，開啟瀏覽器：${URL}`);
      openBrowser(URL);
    } else {
      console.log(`伺服器尚未回應，請手動前往 ${URL}`);
    }
  });
}

function forwardToCli(args) {
  const child = spawnPnpm(['eml', ...args]);
  child.on('exit', (code) => process.exit(code ?? 0));
}

function printHelp() {
  console.log(`EML Studio launcher

  node scripts/launch.mjs [studio]     啟動 Cogni-Editor 並開啟瀏覽器（預設）
  node scripts/launch.mjs demo         執行範例 examples/phase0/sum.eml
  node scripts/launch.mjs <cli-args>   轉發給 eml CLI（run / transpile / explain / crystallize …）

Windows 可直接雙擊 eml-studio.cmd；macOS/Linux 執行 ./eml-studio.sh
環境變數：EML_STUDIO_PORT（預設 5179）、EML_NO_OPEN=1（不自動開瀏覽器）`);
}

const argv = process.argv.slice(2);
const cmd = argv[0];

if (!cmd || cmd === 'studio' || cmd === 'start') startStudio();
else if (cmd === 'help' || cmd === '--help' || cmd === '-h') printHelp();
else if (cmd === 'demo') forwardToCli(['run', 'examples/phase0/sum.eml']);
else if (CLI_COMMANDS.has(cmd)) forwardToCli(argv);
else {
  console.error(`未知指令：'${cmd}'`);
  printHelp();
  process.exit(1);
}
