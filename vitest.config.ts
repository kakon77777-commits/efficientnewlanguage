import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
    environment: 'node',
    /**
     * Many gates here shell out to a real CPython, and several files do it
     * inside one test. Vitest's 5s default is a statement about a pure unit
     * test; under concurrency it is a statement about how busy the machine is.
     *
     * Raised as a CLASS fix rather than per-file: `tests/ai-converter.test.ts`
     * began timing out the day `tests/interp.test.ts` got FASTER, because the
     * files now overlap more and compete for CPU. Nothing about those tests
     * changed and nothing about them asserts speed. Any file that spawns python
     * has the same exposure, so the bound belongs here, once.
     */
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
