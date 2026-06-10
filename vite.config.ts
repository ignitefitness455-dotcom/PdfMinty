import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
import { fileURLToPath, URL } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      'lucide-react/icons': fileURLToPath(
        new URL('./node_modules/lucide-react/dist/esm/icons', import.meta.url)
      ),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
    },
  },
  worker: {
    format: 'es',
    plugins: [],
  },
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({ algorithm: 'gzip', filter: /\.(js|css|html|svg)$/ }),
    viteCompression({ algorithm: 'brotliCompress', filter: /\.(js|css|html|svg)$/ }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'PdfMinty — Secure Offline PDF Studio',
        short_name: 'PdfMinty',
        description: 'Free browser-based PDF tools. Merge, split, compress PDFs privately — no upload needed.',
        theme_color: '#10b981',
        background_color: '#f8fafc',
        categories: ["utilities", "productivity"],
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2,ico,wasm}'],
        runtimeCaching: [
          {
            // App shell / Navigation: NetworkFirst triggers fallback to cache when offline
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-html-cache',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 10,
              },
            },
          },
          {
            // Static assets: CacheFirst and hold for 30 days
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'font' ||
              request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // WASM files: CacheFirst and hold for 30 days
            urlPattern: ({ url }) => url.pathname.endsWith('.wasm'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // API endpoints: NetworkFirst with timeout to always try to reach workers (like feedback/contact)
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-calls-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 Day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      }
    }),
    mode === 'analyze' && visualizer({
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
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    },
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'terser',
    sourcemap: 'hidden', // generate .map files for Cloudflare upload; hidden from browser DevTools
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy PDF libraries in their own chunks — loaded only when tool pages load
          'pdf-lib': ['pdf-lib'],
          'pdfjs-dist': ['pdfjs-dist'],
          // React ecosystem in one vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'canvas-confetti': ['canvas-confetti'],
          'jszip': ['jszip'],
          'react-markdown': ['react-markdown'],
          'i18n': ['i18next', 'react-i18next'],
          'react-helmet-async': ['react-helmet-async'],
        },
      },
    },
  },
}));
