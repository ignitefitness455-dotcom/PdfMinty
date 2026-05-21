import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

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
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ filesArray }) => {
      if (!filesArray || filesArray.length === 0) {
        throw new Error('Please add at least one image to convert.');
      }

      // Bug 3 fix: validate each file is actually an image before processing
      for (const item of filesArray) {
        const fileType = item.fileObj?.type ?? '';
        if (!fileType.startsWith('image/')) {
          throw new Error(
            `Invalid file format: "${item.name}" is not an image. Please upload JPG or PNG files.`
          );
        }
      }

      if (typeof window.showProgress === 'function') window.showProgress(5);

      // Bug 3 fix: ensure all file reading is properly awaited before sending to worker
      const fileDatas = await Promise.all(
        filesArray.map(async (item) => {
          // Await the arrayBuffer call to prevent timing-related format errors
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

      // Bug 4 fix: validate output before reporting success
      if (!isValidOutput(pdfBytes)) {
        throw new Error('Failed to convert images to PDF: output file is empty.');
      }

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
