import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Custom plugin: inject SW cache version at build time.
 *
 * - In dev: `public/sw.js` is served as-is; the placeholder
 *   `__SW_CACHE_VERSION__` falls back to `'dev-' + Date.now()` so each
 *   page reload gets a fresh cache (acceptable for dev).
 * - In production build: after Vite copies `public/sw.js` to `dist/sw.js`,
 *   the `writeBundle` hook reads the file, replaces the placeholder with a
 *   unique build version (timestamp + short hash), and writes it back.
 *   This guarantees every deploy ships a unique SW cache version without
 *   requiring manual bumping.
 *
 * IMPORTANT: This plugin does NOT emit a separate `sw.js` (which would
 * overwrite the real one). It only transforms the existing copied file
 * in-place via writeBundle.
 */
function injectSwVersion() {
  const BUILD_VERSION = `build-${Date.now()}`;
  return {
    name: 'pdfminty-inject-sw-version',
    apply: 'build' as const,
    writeBundle(this: { emitFile: (asset: { type: string; fileName: string }) => void }, options: { dir?: string }) {
      const outDir = options.dir;
      if (!outDir) return;
      const swPath = resolve(outDir, 'sw.js');
      try {
        const content = readFileSync(swPath, 'utf-8');
        const updated = content.replaceAll('__SW_CACHE_VERSION__', BUILD_VERSION);
        if (updated !== content) {
          writeFileSync(swPath, updated, 'utf-8');
          console.log(`[pdfminty] SW cache version injected: ${BUILD_VERSION}`);
        }
      } catch {
        // sw.js may not exist if public/ is empty; safe to ignore.
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    injectSwVersion(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  worker: {
    format: 'es',
  },
});
