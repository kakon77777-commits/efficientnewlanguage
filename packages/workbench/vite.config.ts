import { defineConfig } from 'vite';

export default defineConfig({
  // @eml/* are run-from-source TS workspace packages; don't pre-bundle them.
  optimizeDeps: {
    exclude: [
      '@eml/parser',
      '@eml/transpiler-python',
      '@eml/transpiler-eml',
      '@eml/types',
      '@eml/trace',
      '@eml/interp',
    ],
  },
  server: {
    // Fixed port so the EML Studio launcher can open a known URL. Override with
    // EML_STUDIO_PORT (the launcher reads the same variable).
    port: Number(process.env.EML_STUDIO_PORT) || 5179,
    strictPort: true,
    // allow serving the symlinked workspace packages from the monorepo root
    fs: { allow: ['../..'] },
  },
});
