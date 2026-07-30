#!/usr/bin/env node
/**
 * SEMANTIC DRIFT MONITOR.
 *
 * Every interpreter/CPython divergence found in this project so far was found
 * by accident: a corpus case happened to use a construct nobody had exercised,
 * and the execution-truth gate caught it. That worked, but it is luck with a
 * long tail — `Σ` waited 119 programs, `with` waited 134, and `%`-formatting
 * was broken for everything past `%s`/`%d`/`%f` the whole time.
 *
 * This turns that luck into a check. It reports two things:
 *
 *   COVERAGE — which shipped EML constructs no corpus program exercises. A
 *   construct at zero is a construct whose semantics nothing is testing, which
 *   is precisely where the divergences have been hiding.
 *
 *   DRIFT — semantics-bearing source files whose content hash has changed since
 *   the last recorded baseline, WITHOUT the matching conformance test being
 *   touched. Editing how `%` formats or how a cache keys is exactly the kind of
 *   change that should not land quietly.
 *
 * Usage:
 *   node scripts/semantic-monitor.mjs            # report; exit 1 on a regression
 *   node scripts/semantic-monitor.mjs --accept   # record the current state as
 *                                                # the baseline (after review)
 *
 * The baseline lives in scripts/semantic-monitor.baseline.json and is committed,
 * so the alert is about CHANGE rather than about absolute numbers — a construct
 * that was already at zero yesterday is reported but does not fail the build;
 * a construct that DROPS to zero, or a semantics file that moves without its
 * test, does.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const BASELINE = join(here, 'semantic-monitor.baseline.json');

/* ── 1. Construct coverage ────────────────────────────────────────────────── */

/**
 * Each entry is a SHIPPED EML construct and a matcher over comment-stripped
 * source. Deliberately excludes the interpreter-deferred ones (numpy `<M>`/`^T`,
 * `async`/`await`, `import`) — those can never have a runnable corpus case, so
 * reporting them as gaps would be noise that trains you to ignore the report.
 */
const CONSTRUCTS = [
  ['sigma-summation', (s) => s.includes('Σ(')],
  ['cold-annotation', (s) => /^\s*@cold\b/m.test(s)],
  ['hot-annotation', (s) => /^\s*@hot\b/m.test(s)],
  ['ternary', (s) => /\?[^"']*:/.test(s)],
  ['class', (s) => /^\s*class\s+\w+\s*:/m.test(s)],
  ['try-except', (s) => /^\s*except\b/m.test(s)],
  ['except-as', (s) => /^\s*except\b.*\bas\b/m.test(s)],
  ['raise', (s) => /^\s*raise\b/m.test(s)],
  ['finally', (s) => /^\s*finally\s*:/m.test(s)],
  ['with-context-manager', (s) => /^\s*with\s+/m.test(s)],
  ['list-comprehension', (s) => /\[[^\]]+\bfor\b[^\]]+\bin\b/.test(s)],
  ['slice', (s) => /\w\[\s*\w*\s*:\s*\w*\s*\]/.test(s)],
  ['dict-literal', (s) => /\{[^}]*:/.test(s)],
  ['percent-format', (s) => /%\s*\(/.test(s)],
  ['modulo', (s) => /\w\s+%\s+\w/.test(s)],
  ['and-or', (s) => /\b(and|or)\b/.test(s)],
  ['not', (s) => /\bnot\b/.test(s)],
  ['break', (s) => /^\s*break\b/m.test(s)],
  ['continue', (s) => /^\s*continue\b/m.test(s)],
  ['while', (s) => /^\s*while\b/m.test(s)],
  ['compound-assign', (s) => /\^[+\-*/]/.test(s)],
  ['print-end', (s) => /\^0\s*\(/.test(s)],
  ['triple-quoted-string', (s) => s.includes('"""')],
  ['sequence-repeat', (s) => /("[^"]*"|\])\s*\*\s*\w/.test(s)],
  ['nested-def', (s) => /^\s+def\s+\w+\(/m.test(s)],
  ['float-division', (s) => /\w\s*\/\s*\w/.test(s)],
];

const BACKSLASH = String.fromCharCode(92);

/** Drop `#` comments, respecting string literals — an English word in prose
 *  must not count as a use of the construct it happens to name. */
function stripComments(src) {
  const out = [];
  for (const line of src.split('\n')) {
    let quote = null;
    let buf = '';
    let prev = '';
    for (const c of line) {
      if (quote) {
        buf += c;
        if (c === quote && prev !== BACKSLASH) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
        buf += c;
      } else if (c === '#') {
        break;
      } else {
        buf += c;
      }
      prev = c;
    }
    out.push(buf);
  }
  return out.join('\n');
}

function corpusSources() {
  const dir = join(root, 'examples');
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('phase')) continue;
    for (const f of readdirSync(join(dir, entry.name))) {
      if (f.endsWith('.eml')) files.push(join(dir, entry.name, f));
    }
  }
  return files.map((f) => stripComments(readFileSync(f, 'utf8')));
}

function measureCoverage() {
  const sources = corpusSources();
  const counts = {};
  for (const [name, match] of CONSTRUCTS) {
    counts[name] = sources.filter((s) => match(s)).length;
  }
  return { programs: sources.length, counts };
}

/* ── 2. Semantics drift ───────────────────────────────────────────────────── */

/**
 * Files whose content decides what a program MEANS, each paired with the test
 * that pins it against real CPython. Changing the left without touching the
 * right is the shape of every silent divergence this project has shipped.
 */
const SEMANTIC_FILES = [
  [
    'packages/interp/src/values.ts',
    // Exception values live here too, not only in the interpreter — the first
    // real alert this monitor raised was for an exception-model change whose
    // tests were all in phase7d, which this list did not mention.
    [
      'tests/percent-format.test.ts',
      'tests/sum-compensation.test.ts',
      'tests/phase7d-exceptions.test.ts',
      'tests/builtin-shapes.test.ts',
    ],
  ],
  [
    'packages/interp/src/index.ts',
    ['tests/interp.test.ts', 'tests/phase7d-exceptions.test.ts', 'tests/builtin-shapes.test.ts'],
  ],
  ['packages/transpiler-python/src/emitter.ts', ['tests/interp.test.ts']],
  ['packages/transpiler-eml/src/eml-emitter.ts', ['tests/reverse-regression.test.ts']],
  ['packages/transpiler-eml/src/py-parser.ts', ['tests/reverse-regression.test.ts']],
  ['packages/transpiler-eml/src/py-lexer.ts', ['tests/reverse-regression.test.ts']],
];

const hashOf = (rel) => {
  const p = join(root, rel);
  if (!existsSync(p) || !statSync(p).isFile()) return null;
  // Hash NORMALIZED content. Hashing raw bytes made the monitor fire after any
  // `git checkout` on Windows, because .gitattributes restores CRLF where the
  // working copy had LF — a false alarm that teaches you to ignore the report,
  // which is worse than not having one. Found by drilling the monitor rather
  // than by trusting it.
  const CRLF = String.fromCharCode(13, 10);
  const LF = String.fromCharCode(10);
  const text = readFileSync(p, 'utf8').split(CRLF).join(LF);
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
};

function measureHashes() {
  const out = {};
  for (const [file, tests] of SEMANTIC_FILES) {
    out[file] = hashOf(file);
    for (const t of tests) out[t] = hashOf(t);
  }
  return out;
}

/* ── 3. Report ────────────────────────────────────────────────────────────── */

const accept = process.argv.includes('--accept');
const coverage = measureCoverage();
const hashes = measureHashes();
const current = { programs: coverage.programs, coverage: coverage.counts, hashes };

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : null;

if (accept) {
  writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n', 'utf8');
  console.log(`semantic-monitor: baseline recorded (${coverage.programs} corpus programs)`);
  process.exit(0);
}

const alerts = [];
const notes = [];

// Coverage: zero is always worth SAYING; a drop is worth FAILING.
const uncovered = Object.entries(coverage.counts)
  .filter(([, n]) => n === 0)
  .map(([k]) => k);
if (uncovered.length > 0) {
  notes.push(`constructs with no corpus coverage: ${uncovered.join(', ')}`);
}
if (baseline) {
  for (const [name, n] of Object.entries(coverage.counts)) {
    const was = baseline.coverage?.[name];
    if (was === undefined) continue;
    // Only reaching ZERO is an alert. An earlier version also alerted on any
    // decrease, which meant deleting one case fired five alerts for constructs
    // that went 45 -> 44 — pure noise, and noise is how a monitor gets ignored.
    // A construct nothing exercises at all is the condition that actually
    // preceded every divergence found so far.
    if (was > 0 && n === 0) {
      alerts.push(`COVERAGE LOST     ${name} was exercised by ${was} program(s), now none`);
    } else if (n < was) {
      notes.push(`${name} coverage ${was} -> ${n} (still covered)`);
    }
  }
}

// Drift: a semantics file moved without its conformance test moving.
if (baseline?.hashes) {
  for (const [file, tests] of SEMANTIC_FILES) {
    const changed = baseline.hashes[file] !== undefined && baseline.hashes[file] !== hashes[file];
    if (!changed) continue;
    // A test counts as touched if it CHANGED or if it is BRAND NEW. The first
    // version required `baseline.hashes[t] !== undefined`, so writing a whole
    // new conformance file — the strongest possible response to a semantics
    // change — did not satisfy the check, while editing one line of an old
    // test did. Found by the monitor alerting on exactly that situation.
    const testsTouched = tests.some((t) => hashes[t] !== null && baseline.hashes[t] !== hashes[t]);
    if (testsTouched) {
      notes.push(`${file} changed, and so did its conformance test — reviewed`);
    } else {
      alerts.push(
        `SEMANTICS CHANGED ${file} changed but none of its conformance tests did\n` +
          `                  (${tests.join(', ')})\n` +
          `                  If the meaning of a program can differ, add or extend a test.\n` +
          `                  If it genuinely cannot, re-run with --accept.`,
      );
    }
  }
}

console.log(`semantic-monitor: ${coverage.programs} corpus programs, ${CONSTRUCTS.length} constructs tracked`);
for (const n of notes) console.log(`  note:  ${n}`);
for (const a of alerts) console.log(`  ALERT: ${a}`);

if (!baseline) {
  console.log('  note:  no baseline yet — run with --accept to record one');
  process.exit(0);
}
if (alerts.length > 0) {
  console.log(`\n${alerts.length} alert(s). Nothing here is automatically wrong — it is a prompt to look.`);
  process.exit(1);
}
console.log('  no drift against the recorded baseline');
