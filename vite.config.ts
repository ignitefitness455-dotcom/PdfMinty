import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2022",
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("pdf-lib") || id.includes("@cantoo/pdf-lib") || id.includes("pdfjs-dist")) {
              return "pdf";
            }
            if (id.includes("lucide-react")) {
              return "lucide";
            }
            if (id.includes("jszip")) {
              return "jszip";
            }
            if (id.includes("react-router") || id.includes("react-dom") || id.includes("react/")) {
              return "react";
            }
            if (id.includes("@google/genai") || id.includes("react-markdown")) {
              return "ai";
            }
            return "vendor";
          }
        },
      },
    },
  },
  worker: {
    format: "es",
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
