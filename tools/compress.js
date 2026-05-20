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
      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
        if (typeof window.runPdfWorkerTask !== 'function') {
          throw new Error('Worker not found');
        }

        const payload = { fileBytes: new Uint8Array(actualBytes) };
        const resultBytes = await window.runPdfWorkerTask('compress', payload, [
          payload.fileBytes.buffer,
        ], (prog) => {
          if (typeof window.showProgress === 'function') window.showProgress(prog);
        });

        // Verify result bytes exist and are not empty before downloading
        if (!resultBytes || resultBytes.length === 0) {
          throw new Error('PDF compression failed: empty result');
        }

        if (typeof downloadFile !== 'function') {
          throw new Error('Download function not available');
        }

        downloadFile(resultBytes, currentFileName + '_compressed.pdf');

        // Only show success after download is initiated
        if (typeof showSuccess === 'function') {
          showSuccess('PDF compressed successfully!');
        }
      } catch (error) {
        // Re-throw to let processPdfTask handle error display
        throw error;
      }
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
