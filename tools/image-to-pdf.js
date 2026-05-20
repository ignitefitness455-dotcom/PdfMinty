import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG or PNG images into a PDF document',
    icon: window.PdfMinty.ICONS.image_to_pdf || '📄',
    actionText: '🖼️ Convert to PDF',
    isMultiFile: true,
    onApply: async ({ filesArray }) => {
      if (filesArray.length === 0) {
        throw new Error('Please select at least one image.');
      }

      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
        // Read all images first
        const fileDatas = await Promise.all(
          filesArray.map(async (item) => {
            const buffer = await item.fileObj.arrayBuffer();
            return {
              bytes: new Uint8Array(buffer),
              type: item.fileObj.type,
              name: item.fileObj.name,
            };
          }),
        );

        if (fileDatas.length === 0) {
          throw new Error('Failed to read image files.');
        }

        const transferables = fileDatas.map((f) => f.bytes.buffer);

        if (typeof window.runPdfWorkerTask !== 'function') {
          throw new Error('Worker not found');
        }

        const pdfBytes = await window.runPdfWorkerTask(
          'image-to-pdf',
          {
            files: fileDatas,
          },
          transferables,
          (prog) => {
            if (typeof window.showProgress === 'function') window.showProgress(prog);
          },
        );

        // Verify result bytes exist and are not empty before downloading
        if (!pdfBytes || pdfBytes.length === 0) {
          throw new Error('PDF conversion failed: empty result');
        }

        if (typeof downloadFile !== 'function') {
          throw new Error('Download function not available');
        }

        downloadFile(pdfBytes, 'images-converted.pdf');

        // Only show success after download is initiated
        if (typeof showSuccess === 'function') {
          showSuccess('Images converted to PDF successfully!');
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
