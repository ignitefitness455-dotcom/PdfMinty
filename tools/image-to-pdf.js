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
      if (filesArray.length === 0) return;

      if (typeof window.showProgress === 'function') window.showProgress(5);

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

      const transferables = fileDatas.map((f) => f.bytes.buffer);

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

      if (typeof downloadFile === 'function') {
        downloadFile(pdfBytes, 'images-converted.pdf');
      }
      if (typeof showSuccess === 'function') showSuccess('Images converted to PDF successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
