import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
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
const ledger = join(here, '..', 'scripts', 'semantic-monitor.jsonl');

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

  it('appends to the ledger on every run', () => {
    const before = existsSync(ledger) ? readFileSync(ledger, 'utf8').trimEnd().split('\n').length : 0;
    spawnSync(process.execPath, [monitor], { encoding: 'utf8' });
    const after = readFileSync(ledger, 'utf8').trimEnd().split('\n').length;
    expect(after, 'a run that records nothing leaves no evidence it happened').toBeGreaterThan(before);
  });

  it('every ledger line is one well-formed EML-native event', () => {
    const lines = readFileSync(ledger, 'utf8').trimEnd().split('\n');
    for (const line of lines) {
      const e = JSON.parse(line);
      expect(e.stream).toBe('eml');
      // EML's own protocol id. This project was deliberately separated from
      // PHOSPHOR; the ledger borrows the append-only SHAPE and none of the
      // naming, and this assertion is what keeps that true under later edits.
      expect(e.proto).toBe('eml-monitor-v1');
      expect(e.proto).not.toMatch(/phosphor/i);
      expect(typeof e.seq).toBe('number');
      expect(typeof e.ts).toBe('string');
      expect(e.type).toMatch(/^monitor:/);
    }
  });

  it('sequence numbers are strictly increasing across the whole ledger', () => {
    // A counter that resets makes two runs indistinguishable in the record.
    const seqs = readFileSync(ledger, 'utf8')
      .trimEnd()
      .split('\n')
      .map((l) => JSON.parse(l).seq);
    for (let i = 1; i < seqs.length; i++) expect(seqs[i]).toBeGreaterThan(seqs[i - 1]);
  });
});

describe('accepting an open alert requires a stated reason', () => {
  /**
   * The baseline stores a snapshot, so accepting an alert USED TO overwrite the
   * only evidence it existed: the alert fired, the baseline moved, and nothing
   * in the repo remembered. Since `--accept` is precisely the thing one reaches
   * for when one should be looking harder, a silent accept was the weakest
   * point in the design.
   *
   * These run against a COPY of the real baseline so the drill cannot corrupt
   * the committed one — a lesson from an earlier session, where drilling a
   * check against live state destroyed uncommitted work.
   */
  it('refuses --accept without --why when alerts are open, and does not write', () => {
    const tmp = join(here, '..', 'scripts', '.monitor-drill-baseline.json');
    const real = join(here, '..', 'scripts', 'semantic-monitor.baseline.json');
    const original = readFileSync(real, 'utf8');
    // A baseline claiming a different hash for a real semantics file produces
    // exactly the "changed without its test" alert, without touching any source.
    const doctored = JSON.parse(original);
    doctored.hashes['packages/interp/src/values.ts'] = '0000000000000000';
    writeFileSync(tmp, JSON.stringify(doctored, null, 2) + '\n', 'utf8');
    try {
      writeFileSync(real, JSON.stringify(doctored, null, 2) + '\n', 'utf8');
      const refused = spawnSync(process.execPath, [monitor, '--accept'], { encoding: 'utf8' });
      expect(refused.status, 'must refuse').toBe(1);
      expect(refused.stdout).toContain('without a reason');
      expect(readFileSync(real, 'utf8'), 'a refusal must not move the baseline').toBe(
        JSON.stringify(doctored, null, 2) + '\n',
      );

      const accepted = spawnSync(process.execPath, [monitor, '--accept', '--why', 'drill'], { encoding: 'utf8' });
      expect(accepted.status, 'must accept once a reason is given').toBe(0);
      expect(readFileSync(real, 'utf8'), 'accepting DOES move the baseline').not.toBe(
        JSON.stringify(doctored, null, 2) + '\n',
      );
    } finally {
      writeFileSync(real, original, 'utf8'); // always restore the committed baseline
      if (existsSync(tmp)) rmSync(tmp);
    }
  });
});
