import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'compress',
    title: 'Compress PDF',
    description: 'Reduce file size by optimizing PDF structure or compressing images',
    icon: window.PdfMinty.ICONS.compress || '📄',
    actionText: '🗜️ Compress PDF',
    isMultiFile: false,
    onApply: async ({ actualBytes, currentFileName }) => {
      let resultBytes;
      if (typeof window.runPdfWorkerTask === 'function') {
        const payload = { fileBytes: new Uint8Array(actualBytes) };
        resultBytes = await window.runPdfWorkerTask('compress', payload, [
          payload.fileBytes.buffer,
        ]);
      } else {
        throw new Error('Worker not found');
      }
      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_compressed.pdf');
      if (typeof showSuccess === 'function') showSuccess('PDF compressed successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
