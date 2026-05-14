export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name && chunkInfo.name.includes('/tools/')) {
            const toolName = chunkInfo.name.split('/').pop();
            return `assets/tool-${toolName}-[hash].js`;
          }
          return 'assets/[name]-[hash].js';
        },
        manualChunks(id) {
          if (id.includes('node_modules/pdf-lib')) return 'pdflib';
          if (id.includes('node_modules/canvas-confetti')) return 'confetti';
          if (id.includes('/tools/')) {
            return `tool-${id.split('/').pop().split('.')[0]}`;
          }
        },
      },
    },
    minify: 'terser',
    cssMinify: true,
  },
};
