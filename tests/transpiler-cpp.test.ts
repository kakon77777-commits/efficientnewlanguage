import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = join(here, '..', 'examples', 'phase4-cpp');
const demos = readdirSync(demoDir).filter((f) => f.endsWith('.eml')).sort();
const norm = (s: string): string => s.replace(/\r\n/g, '\n');

describe('Phase 4 — EML/C+++ -> C++ prototype', () => {
  it('emits Σ as a real C++ for-loop (lambda IIFE) with eml_pow', () => {
    const r = transpileEmlToCpp('N^+100\nΣ(i^2, i in [1:N]) => r\nr^0\n');
    expect(r.ok).toBe(true);
    expect(r.cpp).toContain('for (long long i = 1; i <= N; ++i)');
    expect(r.cpp).toContain('eml_pow(i, 2)');
    expect(r.cpp).toContain('std::cout << r');
    expect(r.cpp).toContain('int main()');
  });

  it('emits an EML def as a C++ (abbreviated) function', () => {
    const r = transpileEmlToCpp('def square_sum(N):\n    Σ(i^2, i in [1:N]) => r\n    return r\n\nsquare_sum(100) => t\nt^0\n');
    expect(r.cpp).toContain('auto square_sum(auto N) {');
    expect(r.cpp).toContain('auto t = square_sum(100);');
  });

  it('emits first binding as `auto` and reassignment / augmented plainly', () => {
    const r = transpileEmlToCpp('x^+100\nx^+10\nx^*2\nx^0\n');
    expect(r.cpp).toContain('auto x = 100;');
    expect(r.cpp).toContain('x += 10;');
    expect(r.cpp).toContain('x *= 2;');
  });

  it('emits a conditional ternary and membership-over-range (single-eval IIFE)', () => {
    const r = transpileEmlToCpp('x^+50\nx > 40 ? 1 : 0 => y\nx in [1:100] => z\n');
    expect(r.cpp).toContain('auto y = (x > 40 ? 1 : 0);');
    // membership binds the element to a temp so it is evaluated exactly once
    expect(r.cpp).toContain('auto z = [&]{ auto __m0 = x; return (__m0 >= 1 && __m0 <= 100); }();');
  });

  it('emits an integer list literal as std::vector', () => {
    const r = transpileEmlToCpp('list^+[1, 2, 3]\n');
    expect(r.cpp).toContain('std::vector<long long>{1, 2, 3}');
  });

  it('fails loudly (E_CPP_UNSUPPORTED) on numpy / async constructs', () => {
    for (const src of ['<M>([[1, 2]]) => m\n', 'm^T => t\n', '@temporal_loop(max_wait=1)\nasync def f(x):\n    return x\n']) {
      const r = transpileEmlToCpp(src);
      expect(r.ok).toBe(false);
      expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
    }
  });

  it('fails loudly on constructs that would emit non-compiling C++ (review regressions)', () => {
    const cases = [
      'def fact(n):\n    fact(n) => r\n    return r\n', // self-recursion (auto-return can't recurse)
      'nums^+[1.5, 2.5]\n', // non-integer list narrows
      'names^+["a", "b"]\n', // non-integer (string) list
      'nums^+[1, 2, 3]\nnums^0\n', // outputting a list (no operator<< for std::vector)
      'def f(x):\n    return x\n\ndef f(y):\n    return y\n', // duplicate def -> C++ redefinition
    ];
    for (const src of cases) {
      const r = transpileEmlToCpp(src);
      expect(r.ok, src).toBe(false);
      expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED'), src).toBe(true);
    }
  });

  it('surfaces lex/parse/semantic errors as diagnostics (never throws)', () => {
    const r = transpileEmlToCpp('def f(x):\n'); // empty body -> parse error
    expect(r.ok).toBe(false);
    expect(r.cpp).toBe('');
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });

  // Golden: every demo transpiles to its committed .expected.cpp.
  describe('golden demos (>= 3 C+++ demos transpile to C++)', () => {
    expect(demos.length).toBeGreaterThanOrEqual(3);
    for (const f of demos) {
      const base = f.replace(/\.eml$/, '');
      it(base, () => {
        const eml = readFileSync(join(demoDir, f), 'utf8');
        const expected = readFileSync(join(demoDir, `${base}.expected.cpp`), 'utf8');
        const r = transpileEmlToCpp(eml);
        expect(r.ok).toBe(true);
        expect(norm(r.cpp)).toBe(norm(expected));
      });
    }
  });
});

// Compile + run the demos when a C++20 toolchain is available; skip otherwise.
// Supports POSIX compilers (g++/clang++) and MSVC (cl via the VS vcvars env).
type Toolchain = { kind: 'posix'; cmd: string } | { kind: 'msvc'; vcvars: string };

function findToolchain(): Toolchain | null {
  for (const cmd of ['g++', 'clang++']) {
    if (!spawnSync(cmd, ['--version'], { encoding: 'utf8' }).error) return { kind: 'posix', cmd };
  }
  if (process.platform === 'win32') {
    const vswhere = `${process.env['ProgramFiles(x86)']}\\Microsoft Visual Studio\\Installer\\vswhere.exe`;
    if (existsSync(vswhere)) {
      const r = spawnSync(vswhere, ['-latest', '-products', '*', '-property', 'installationPath'], { encoding: 'utf8' });
      const inst = (r.stdout ?? '').trim().split(/\r?\n/)[0];
      if (inst) {
        const vcvars = join(inst, 'VC', 'Auxiliary', 'Build', 'vcvars64.bat');
        if (existsSync(vcvars)) return { kind: 'msvc', vcvars };
      }
    }
  }
  return null;
}

const normOut = (s: string): string => s.replace(/\r\n/g, '\n').trim();

/**
 * Compile + run every demo and return base -> normalized stdout. MSVC's vcvars
 * setup is slow (~10s), so all demos share ONE developer session rather than
 * paying it per demo.
 */
function buildAndRunAll(tc: Toolchain, bases: string[], dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (tc.kind === 'posix') {
    for (const base of bases) {
      const exe = join(dir, `${base}.exe`);
      const b = spawnSync(tc.cmd, ['-std=c++20', '-O0', join(dir, `${base}.cpp`), '-o', exe], { encoding: 'utf8' });
      out[base] = (b.status ?? 1) !== 0 ? `COMPILE FAILED: ${b.stderr}` : normOut(spawnSync(exe, [], { encoding: 'utf8' }).stdout);
    }
    return out;
  }
  const bat = join(dir, 'build.bat');
  const lines = ['@echo off', `call "${tc.vcvars}" >nul 2>&1`];
  for (const base of bases) {
    const src = join(dir, `${base}.cpp`);
    const exe = join(dir, `${base}.exe`);
    const obj = join(dir, `${base}.obj`);
    lines.push(`cl /nologo /std:c++20 /EHsc "${src}" /Fe:"${exe}" /Fo:"${obj}" >nul 2>&1 && echo @@${base}@@&& "${exe}"`);
  }
  writeFileSync(bat, lines.join('\r\n'));
  const text = normOut(spawnSync('cmd', ['/c', bat], { encoding: 'utf8' }).stdout ?? '') + '\n';
  for (const base of bases) {
    const m = new RegExp(`@@${base}@@\\n([\\s\\S]*?)(?=@@|$)`).exec(text);
    out[base] = (m?.[1] ?? '(no output — compile failed?)').trim();
  }
  return out;
}

const toolchain = findToolchain();
const expectedStdout: Record<string, string> = {
  sum_squares: '338350',
  square_sum_fn: '338350',
  conditional: '1\n1',
};

describe.skipIf(!toolchain)(`Phase 4 — C++ compiles + runs (via ${toolchain?.kind ?? 'no compiler'})`, () => {
  it('all demos compile with a real C++20 compiler and print the expected output', () => {
    const bases = demos.map((f) => f.replace(/\.eml$/, '')).filter((b) => b in expectedStdout);
    const dir = mkdtempSync(join(tmpdir(), 'eml-cpp-'));
    try {
      for (const base of bases) {
        writeFileSync(join(dir, `${base}.cpp`), transpileEmlToCpp(readFileSync(join(demoDir, `${base}.eml`), 'utf8')).cpp);
      }
      const outputs = buildAndRunAll(toolchain!, bases, dir);
      for (const base of bases) expect(outputs[base], `${base}: ${outputs[base]}`).toBe(expectedStdout[base]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120_000);
});
