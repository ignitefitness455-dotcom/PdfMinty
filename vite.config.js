export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdflib: ['pdf-lib'],
          confetti: ['canvas-confetti']
        }
      }
    },
    minify: 'terser',
    cssMinify: true
  }
}
