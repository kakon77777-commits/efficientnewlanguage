import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * `eml test` is the practical, vitest-independent conformance check
 * documented in docs/conformance.md — this is the one place that proves the
 * ACTUAL CLI command (argv parsing, --dir, exit codes) works, not just the
 * internal transpileEmlToPython comparison tests/golden.test.ts re-implements
 * directly. Spawns the real repo-root tsx entry point, same invocation style
 * as `pnpm eml test`.
 */
const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const tsx = join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const cliEntry = join(repoRoot, 'packages', 'cli', 'src', 'index.ts');

function runCli(args: string[]): { status: number; stdout: string; stderr: string } {
  const r = spawnSync(process.execPath, [tsx, cliEntry, ...args], { encoding: 'utf8', cwd: repoRoot });
  return { status: r.status ?? -1, stdout: r.stdout, stderr: r.stderr };
}

describe('eml test — the real CLI command (docs/conformance.md)', () => {
  it('the default fixture set (tests/fixtures/) passes with exit code 0', () => {
    const r = runCli(['test']);
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/^29 passed, 0 failed, 29 total$/m);
  });

  it('--dir points at an alternative fixture set, and a mismatch fails with exit code 1', () => {
    const dir = mkdtempSync(join(tmpdir(), 'eml-conformance-'));
    try {
      writeFileSync(join(dir, 'ok.eml'), 'x^+1\nx^0\n');
      writeFileSync(join(dir, 'ok.expected.py'), 'x = 1\nprint(x)\n');
      writeFileSync(join(dir, 'wrong.eml'), 'x^+1\nx^0\n');
      writeFileSync(join(dir, 'wrong.expected.py'), 'x = 2\nprint(x)\n');

      const r = runCli(['test', '--dir', dir]);
      expect(r.status).toBe(1);
      expect(r.stdout).toMatch(/PASS ok/);
      expect(r.stdout).toMatch(/FAIL wrong/);
      expect(r.stdout).toMatch(/^1 passed, 1 failed, 2 total$/m);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('a missing companion .expected.py is skipped, not a hard error', () => {
    const dir = mkdtempSync(join(tmpdir(), 'eml-conformance-'));
    try {
      writeFileSync(join(dir, 'orphan.eml'), 'x^+1\nx^0\n');
      const r = runCli(['test', '--dir', dir]);
      expect(r.status).toBe(0);
      expect(r.stderr).toMatch(/SKIP orphan/);
      expect(r.stdout).toMatch(/^0 passed, 0 failed, 0 total$/m);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
