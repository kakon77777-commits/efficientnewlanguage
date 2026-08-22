import { spawnSync } from 'node:child_process';

/** Resolve a usable Python interpreter; honors $EML_PYTHON. */
function resolvePython(): string | null {
  const override = process.env.EML_PYTHON;
  const candidates = override
    ? [override]
    : process.platform === 'win32'
      ? ['python', 'py', 'python3']
      : ['python3', 'python'];
  for (const cand of candidates) {
    const probe = spawnSync(cand, ['--version'], { encoding: 'utf8' });
    if (!probe.error && probe.status === 0) return cand;
  }
  return null;
}

// Unique marker so the probe value is never confused with the program's own stdout.
const SENTINEL = '~~EMLVAL7f3a~~';
const SPREAD = ['2', '3', '5', '7', '11', '4'];
/** Value every variable not currently being varied is held at. */
const BASELINE = '3';
/**
 * Soft ceiling on generated inputs (each costs two Python processes). The
 * requirement that EVERY numeric variable is varied wins over this bound: with
 * many variables the per-variable spread shrinks instead, never below
 * MIN_SPREAD_PER_VAR, so no variable is left unvaried to stay under a budget.
 */
const MAX_SETS = 48;
const MIN_SPREAD_PER_VAR = 2;

interface RunResult {
  ok: boolean;
  /** Parsed target repr (text after the sentinel), or null if unavailable. */
  value: string | null;
  err: string;
}

function runPython(
  python: string,
  program: string,
  bindings: string,
  targetVariable: string,
  timeoutMs: number,
): RunResult {
  const code = `${bindings}\n${program}\nprint('${SENTINEL}' + repr(${targetVariable}))`;
  const res = spawnSync(python, ['-c', code], {
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    // Pin the hash seed so set/dict reprs are stable across the two processes.
    env: { ...process.env, PYTHONHASHSEED: '0' },
  });
  if (res.error || res.status !== 0) {
    const reason = res.signal ? `killed (${res.signal}; likely timeout)` : (res.stderr ?? '').trim() || res.error?.message || 'non-zero exit';
    return { ok: false, value: null, err: reason };
  }
  const out = res.stdout ?? '';
  const idx = out.lastIndexOf(SENTINEL);
  if (idx < 0) return { ok: false, value: null, err: 'probe marker not found in output' };
  return { ok: true, value: out.slice(idx + SENTINEL.length).trim(), err: '' };
}

export interface EquivalenceResult {
  equivalent: boolean;
  detail: string;
  /** True when the check could not run / could not be confirmed (fail-closed). */
  inconclusive?: boolean;
}

export interface ValidateOptions {
  timeoutMs?: number;
}

/** Extract `name = value` free-variable assignments from LLM-supplied binding strings. */
function parseFreeVars(bindings: string[]): { name: string; value: string; numeric: boolean }[] {
  const seen = new Map<string, { name: string; value: string; numeric: boolean }>();
  for (const b of bindings) {
    for (const line of b.split('\n')) {
      const m = /^\s*([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/.exec(line);
      if (m && !seen.has(m[1]!)) {
        const value = m[2]!;
        seen.set(m[1]!, { name: m[1]!, value, numeric: /^-?\d+(\.\d+)?$/.test(value) });
      }
    }
  }
  return [...seen.values()];
}

/**
 * Round-trip equivalence check. CRITICAL: it does NOT trust the LLM's own test
 * inputs (conflict of interest — the same model proposed the suggestion). When
 * the free variables are numeric, the validator generates its OWN diverse,
 * non-degenerate inputs (>=2, non-empty ranges) so a wrong suggestion cannot
 * hide behind a binding like `n=1` or an empty range `n=0`. It also requires the
 * inputs to actually discriminate (>=2 distinct original outputs) before
 * certifying. Execution is hardened: timeout, output cap, pinned hash seed,
 * isolated probe.
 */
export function validateEquivalence(
  original: string,
  compiled: string,
  targetVariable: string,
  llmBindings: string[],
  options: ValidateOptions = {},
): EquivalenceResult {
  const python = resolvePython();
  if (!python) return { equivalent: false, inconclusive: true, detail: 'no Python interpreter found; cannot validate' };
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(targetVariable)) {
    return { equivalent: false, detail: `invalid target variable '${targetVariable}'` };
  }
  const timeoutMs = options.timeoutMs ?? 5000;

  const freeVars = parseFreeVars(llmBindings);
  const numericVars = freeVars.filter((v) => v.numeric);
  const otherVars = freeVars.filter((v) => !v.numeric);

  // Build the binding sets the validator will actually test.
  let testSets: string[];
  let coverage = 'LLM-supplied bindings';
  let generatedNothing = false;
  if (numericVars.length > 0) {
    // EMLP-AUDIT-001. Two things were wrong here.
    //
    // (a) Only freeVars[0] was varied and every other numeric variable was
    //     pinned to the literal '3', so a candidate that ignored any other
    //     variable agreed on every input it was shown. freeVars is in the order
    //     the LLM wrote its binding lines, so which variable got exercised was
    //     chosen by the party under test - the same party this function
    //     documents itself as not trusting.
    //
    // (b) Generation was gated on EVERY free variable being numeric, so a
    //     single legitimate string variable turned the whole scheme off and
    //     fell back to the LLM's own bindings. The numeric variables then got
    //     no independent variation at all. Found by 岑衡 against the first fix
    //     (EMLP-RELAY-0028): a non-numeric variable must not cancel coverage of
    //     the numeric ones.
    //
    // Coverage rule: ONE-AT-A-TIME over the numeric variables. For each, hold
    // the other numerics at BASELINE and every non-numeric at the value the
    // caller supplied, and vary that one across the spread. Non-numeric values
    // are echoed back rather than chosen, so they add no freedom the validator
    // is trusting the LLM for; the numeric coverage is unaffected by their
    // presence.
    //
    // Bound: MAX_SETS. If it would be exceeded the per-variable spread shrinks,
    // never the set of variables. This is NOT a claim of general equivalence
    // from a finite sample; it is a claim that no single numeric variable is
    // ignored.
    //
    // Sorting by name makes the generated inputs independent of the order the
    // caller listed its bindings in. Sorting ALONE would not be a fix: it would
    // only make which variable gets missed stable instead of caller-controlled.
    const ordered = [...numericVars].sort((x, y) => (x.name < y.name ? -1 : x.name > y.name ? 1 : 0));
    const perVar = Math.min(SPREAD.length, Math.max(MIN_SPREAD_PER_VAR, Math.floor(MAX_SETS / ordered.length)));
    const values = SPREAD.slice(0, perVar);
    const held = otherVars.map((fv) => `${fv.name} = ${fv.value}`);
    const generated: string[] = [];
    for (const target of ordered) {
      for (const v of values) {
        const numericLines = ordered.map((fv) => `${fv.name} = ${fv.name === target.name ? v : BASELINE}`);
        generated.push([...numericLines, ...held].join('\n'));
      }
    }
    testSets = [...new Set(generated)];
    coverage = `one-at-a-time over ${ordered.length} numeric variable(s) x ${values.length} value(s)`;
    if (otherVars.length > 0) {
      coverage += `, ${otherVars.length} non-numeric held at the supplied value`;
    }
  } else if (freeVars.length === 0) {
    // No free variables at all: the programs are constant, so running them once
    // is a complete check rather than a sample.
    testSets = llmBindings.length > 0 ? [...llmBindings] : [''];
    coverage = 'no free variables';
  } else {
    // Free variables exist and none is numeric, so the validator cannot
    // generate anything of its own and would be relying entirely on the
    // bindings proposed by the model under test. Fail closed rather than
    // certify on those (EMLP-RELAY-0028).
    testSets = llmBindings.length > 0 ? [...llmBindings] : [''];
    coverage = 'LLM-supplied bindings only';
    generatedNothing = true;
  }
  // The LLM's own bindings must also agree where usable (extra checks, never sole evidence).
  const sets = [...new Set([...testSets, ...llmBindings])];

  const usable: { orig: string; comp: string }[] = [];
  let bothFailed = 0;
  let firstBothFailure = '';
  for (let i = 0; i < sets.length; i++) {
    const bindings = sets[i] ?? '';
    const a = runPython(python, original, bindings, targetVariable, timeoutMs);
    const b = runPython(python, compiled, bindings, targetVariable, timeoutMs);
    if (a.ok && b.ok) {
      usable.push({ orig: a.value!, comp: b.value! });
      continue;
    }
    if (a.ok !== b.ok) {
      // EMLP-AUDIT-002. One side produced a value and the other did not. That is
      // a DIVERGENCE, not an unusable input: the candidate either introduced an
      // error the original does not raise, or swallowed one the original does.
      // The previous rule dropped this with `continue`, so the one input that
      // demonstrates the defect was removed precisely because it demonstrated
      // it, leaving no trace in the count or in the returned detail.
      const failed = a.ok ? 'compiled' : 'original';
      const why = ((a.ok ? b.err : a.err).split('\n').pop() ?? 'unknown').trim();
      return {
        equivalent: false,
        detail: `${targetVariable}: ${failed} failed where the other succeeded (${why})`,
      };
    }
    // Both sides failed the same way: the input itself is unusable. Counted,
    // not silently dropped.
    bothFailed++;
    if (!firstBothFailure) firstBothFailure = (a.err.split('\n').pop() ?? '').trim();
  }

  if (usable.length === 0) {
    return {
      equivalent: false,
      inconclusive: true,
      detail: `no usable test input (${bothFailed} binding(s) failed on BOTH sides; first: ${firstBothFailure || 'unknown'})`,
    };
  }
  // Agreement: every usable input must match.
  for (const u of usable) {
    if (u.orig !== u.comp) {
      return { equivalent: false, detail: `${targetVariable}: original=${u.orig} != compiled=${u.comp}` };
    }
  }
  if (generatedNothing) {
    return {
      equivalent: false,
      inconclusive: true,
      detail: `could not confirm - every free variable is non-numeric, so the only inputs available are the ones proposed by the model under test`,
    };
  }

  // Discrimination: when there are free variables, the inputs must actually
  // exercise the computation (otherwise a degenerate input proves nothing).
  if (freeVars.length > 0) {
    const distinct = new Set(usable.map((u) => u.orig)).size;
    if (usable.length < 2 || distinct < 2) {
      return {
        equivalent: false,
        inconclusive: true,
        detail: 'could not confirm — test inputs do not exercise the computation (need >=2 discriminating inputs)',
      };
    }
  }
  const skipped = bothFailed > 0 ? `; ${bothFailed} input(s) unusable on both sides` : '';
  return { equivalent: true, detail: `equivalent across ${usable.length} validator-chosen input(s) [${coverage}]${skipped}` };
}
