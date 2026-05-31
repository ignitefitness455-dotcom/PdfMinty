import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
import { fileURLToPath, URL } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  resolve: {
    alias: {
      'lucide-react/icons': fileURLToPath(
        new URL('./node_modules/lucide-react/dist/esm/icons', import.meta.url)
      ),
    },
  },
  worker: {
    format: 'es',
    plugins: [],
  },
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' }),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    },
  },
  build: {
    target: 'es2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      external: ['@google/genai'],
      output: {
        manualChunks(id) {
          // React core (rarely changes — cacheable)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          // Routing
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // PDF processing (heavy, only when tool opens)
          if (id.includes('node_modules/pdf-lib')) {
            return 'pdf-lib';
          }
          // Icons (only if still using barrel import)
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // JSZip (only for pdf-to-img if implemented)
          if (id.includes('node_modules/jszip')) {
            return 'jszip';
          }
          // Everything else from node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
