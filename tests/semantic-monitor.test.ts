import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * The monitor runs as part of the suite, not only as a command someone
 * remembers to type. There is no CI workflow in this repo, so `pnpm test` is
 * the only thing guaranteed to run before a commit — a monitor that has to be
 * invoked by hand is a monitor that reports to nobody.
 *
 * What it can fail on:
 *   - a semantics-bearing file changed without its conformance test
 *   - an EML construct stopped being exercised by any corpus program
 *
 * Neither is automatically a bug. The failure means "look at this", and
 * `pnpm monitor:accept` records the new state once it has been looked at.
 */
const here = dirname(fileURLToPath(import.meta.url));
const monitor = join(here, '..', 'scripts', 'semantic-monitor.mjs');

describe('semantic drift monitor', () => {
  it('reports no drift against the committed baseline', () => {
    const r = spawnSync(process.execPath, [monitor], { encoding: 'utf8' });
    expect(r.error).toBeUndefined();
    expect(r.stdout + r.stderr, 'run `pnpm monitor` for detail, `pnpm monitor:accept` once reviewed').toContain(
      'no drift against the recorded baseline',
    );
    expect(r.status).toBe(0);
  });

  it('the baseline covers every construct the monitor tracks', () => {
    // Guards the guard: adding a construct to CONSTRUCTS without re-accepting
    // would leave it unmonitored (an undefined baseline entry is skipped).
    const r = spawnSync(process.execPath, [monitor], { encoding: 'utf8' });
    const tracked = Number(/(\d+) constructs tracked/.exec(r.stdout)?.[1] ?? 0);
    expect(tracked).toBeGreaterThan(20);
  });
});
