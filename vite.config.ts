import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Unique build timestamp — busts the SW cache on every deploy.
const BUILD_VERSION = `build-${Date.now()}`;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-sw-version',
      transform(code, id) {
        // Inject the build version into public/sw.js during dev (it's served
        // as a static asset, so we use a global placeholder pattern).
        if (id.endsWith('sw.js')) {
          return code.replace(
            /self\.__SW_VERSION__\s*\|\|\s*['"][^'"]*['"]/,
            `self.__SW_VERSION__ || '${BUILD_VERSION}'`
          );
        }
        return null;
      },
      generateBundle() {
        // For production builds we emit sw.js with the version baked in.
        this.emitFile({
          type: 'asset',
          fileName: 'sw.js',
          source: `self.__SW_VERSION__ = '${BUILD_VERSION}';`,
        });
      },
    },
  ],
  define: {
    'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(BUILD_VERSION),
  },
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
