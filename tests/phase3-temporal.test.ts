import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import { transpileEmlToPython, analyzeSemantics } from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import type { FunctionDef } from '@eml/types';

const TEMPORAL = `@temporal_loop(max_wait=1, check_interval=0.2, timeout_action="return")
async def wait_ready(flag):
    await temporal_wait(flag)
    return 99
`;

describe('Phase 3 — temporal loop: parsing', () => {
  it('parses decorator keyword args, async, and await', () => {
    const fn = parse(TEMPORAL).body[0] as FunctionDef;
    expect(fn.type).toBe('FunctionDef');
    expect(fn.isAsync).toBe(true);
    const dec = fn.decorators[0]!;
    expect(dec.name).toBe('temporal_loop');
    expect(dec.args?.map((a) => a.name)).toEqual(['max_wait', 'check_interval', 'timeout_action']);
    expect(fn.body[0]!.type).toBe('ExpressionStatement');
    const awaitExpr = (fn.body[0] as { expression: { type: string; argument: { type: string } } }).expression;
    expect(awaitExpr.type).toBe('Await');
    expect(awaitExpr.argument.type).toBe('Call');
  });
});

describe('Phase 3 — temporal loop: semantics', () => {
  it('flags temporal usage and does NOT warn temporal_loop as unknown', () => {
    const s = analyzeSemantics(parse(TEMPORAL));
    expect(s.usesTemporal).toBe(true);
    expect(s.diagnostics.find((d) => d.code === 'W_UNKNOWN_DECORATOR')).toBeUndefined();
    expect(s.symbolsUsed).toContain('@temporal_loop');
    expect(s.symbolsUsed).toContain('await');
  });

  it('warns when @temporal_loop is not async', () => {
    const s = analyzeSemantics(parse('@temporal_loop(max_wait=1)\ndef f(x):\n    return x\n'));
    expect(s.diagnostics.find((d) => d.code === 'W_TEMPORAL_NOT_ASYNC')).toBeDefined();
  });

  it('warns on an unknown temporal argument', () => {
    const s = analyzeSemantics(parse('@temporal_loop(max_wait=1, nope=2)\nasync def f(x):\n    return x\n'));
    expect(s.diagnostics.find((d) => d.code === 'W_TEMPORAL_ARG')).toBeDefined();
  });
});

describe('Phase 3 — temporal loop: emission', () => {
  it('emits async def, a real @temporal_loop(...) decorator, await, and the runtime preamble', () => {
    const r = transpileEmlToPython(TEMPORAL);
    expect(r.ok).toBe(true);
    expect(r.python).toContain('@temporal_loop(max_wait=1, check_interval=0.2, timeout_action="return")');
    expect(r.python).toContain('async def wait_ready(flag):');
    expect(r.python).toContain('await temporal_wait(flag)');
    // self-contained runtime preamble
    expect(r.python).toContain('import asyncio as _eml_asyncio');
    expect(r.python).toContain('class DelayedDecisionQueue');
    expect(r.python).toContain('async def temporal_wait(');
    expect(r.python).toContain('def run_temporal(');
  });

  it('does NOT inject the temporal preamble when no temporal loop is used', () => {
    const r = transpileEmlToPython('x^+1\nx^0\n');
    expect(r.python).not.toContain('DelayedDecisionQueue');
    expect(r.python).not.toContain('temporal_wait');
  });

  it('marks the temporal function with the control.temporal CTS type', () => {
    const r = transpileEmlToPython(TEMPORAL);
    const semantic = analyzeSemantics(parse(TEMPORAL));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
    });
    expect(cts.nodes.some((n) => n.semanticType === 'control.temporal')).toBe(true);
  });
});

describe('Phase 3 — temporal loop: review regressions', () => {
  it('parenthesizes a non-atomic await argument (keeps grouping)', () => {
    const r = transpileEmlToPython('@temporal_loop(max_wait=1)\nasync def f(x):\n    await (g(x) + 1) => r\n    return r\n');
    expect(r.python).toContain('r = await (g(x) + 1)');
    const c = transpileEmlToPython('@temporal_loop(max_wait=1)\nasync def f(x):\n    await (x > 0 ? g(x) : h(x)) => r\n    return r\n');
    expect(c.python).toContain('await (g(x) if x > 0 else h(x))');
  });

  it('does not cache an async @cold function (warns W_COLD_ASYNC, no @functools.cache)', () => {
    const r = transpileEmlToPython('@cold\nasync def f(x):\n    return x\n');
    expect(r.python).not.toContain('@functools.cache');
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_ASYNC')).toBeDefined();
  });

  it('detects an impure call hidden inside an await argument (purity walks Await)', () => {
    const r = transpileEmlToPython('@cold\nasync def f(N):\n    await sink(input()) => r\n    return r\n');
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT')).toBeDefined();
    expect(r.metadata.functions.find((fn) => fn.name === 'f')!.pure).toBe(false);
  });

  it('counts a call reached through await in importance', () => {
    const r = transpileEmlToPython('@cold\ndef leaf(x):\n    return x\n\n@temporal_loop(max_wait=1)\nasync def caller(N):\n    await leaf(N) => r\n    return r\n');
    const leaf = r.metadata.functions.find((fn) => fn.name === 'leaf')!;
    expect(leaf.importance.callFrequency).toBe(1);
  });

  it('rejects a positional decorator arg after a keyword arg', () => {
    const r = transpileEmlToPython('@temporal_loop(max_wait=1, 60)\nasync def f(x):\n    return x\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });
});

describe('Phase 3 — temporal loop: runtime execution', () => {
  // Small timings keep the timeout path fast.
  const PROG = `@temporal_loop(max_wait=0.3, check_interval=0.1, timeout_action="return")
async def wait_ready(flag):
    await temporal_wait(flag)
    return 99

run_temporal(wait_ready, 1) => resolved
resolved^0
run_temporal(wait_ready, 0) => timed_out
timed_out^0
`;

  it('resolves when the condition is truthy, times out (no busy wait) when falsy, and emits a phosphor trace', () => {
    const { python, ok } = transpileEmlToPython(PROG);
    expect(ok).toBe(true);
    const res = spawnSync('python', ['-c', python], { encoding: 'utf8' });
    if (res.error) throw res.error;
    expect(res.status).toBe(0);
    // stdout: resolved -> 99, timed-out -> None
    expect(res.stdout.trim().split(/\r?\n/)).toEqual(['99', 'None']);
    // stderr carries the phosphor-jsonl-v1 temporal trace
    expect(res.stderr).toContain('"type": "eml:temporal:resolved"');
    expect(res.stderr).toContain('"type": "eml:temporal:timeout"');
    expect(res.stderr).toContain('"type": "eml:temporal:wait"'); // it polled (check_interval)
  });

  const waitCount = (eml: string): number => {
    const { python } = transpileEmlToPython(eml);
    const res = spawnSync('python', ['-c', python], { encoding: 'utf8' });
    if (res.error) throw res.error;
    return (res.stderr.match(/eml:temporal:wait/g) ?? []).length;
  };

  it('clamps the final sleep to the deadline (check_interval > max_wait does not overshoot)', () => {
    // interval 5 >> max_wait 0.3: the single sleep is clamped to the remaining
    // window, so exactly one wait fires before timeout (no 5s overshoot).
    expect(waitCount('@temporal_loop(max_wait=0.3, check_interval=5, timeout_action="return")\nasync def w(f):\n    await temporal_wait(f)\n    return 1\n\nrun_temporal(w, 0) => t\n')).toBe(1);
  });

  it('floors check_interval=0 so it cannot busy-spin / flood the trace', () => {
    // Was ~thousands of waits before the floor; now a small, bounded count.
    expect(waitCount('@temporal_loop(max_wait=0.3, check_interval=0, timeout_action="return")\nasync def w(f):\n    await temporal_wait(f)\n    return 1\n\nrun_temporal(w, 0) => t\n')).toBeLessThan(50);
  });
});
