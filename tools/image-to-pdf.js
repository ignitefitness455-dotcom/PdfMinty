import { ICONS } from "../src/ui/icons.js";
import { downloadFile } from '../src/utils/fileUtils.js';
import { runPdfWorkerTask } from '../src/core/WorkerManager.js';
import { setupToolUI } from '../src/utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG or PNG images into a PDF document',
    icon: ICONS.image_to_pdf || '📄',
    actionText: '🖼️ Convert to PDF',
    isMultiFile: true,
    instructions: [
      'Upload one or more image files (JPG, PNG, etc.).',
      'If uploading multiple, use the ➕ Add More button.',
      'Click 🖼️ Convert to PDF to wrap the images into a PDF document.',
      'Download your new PDF file.'
    ],
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

      const pdfBytes = await runPdfWorkerTask(
        'image-to-pdf',
        {
          files: fileDatas,
        },
        transferables,
        (prog) => {
          if (typeof window.showProgress === 'function') window.showProgress(prog);
        },
      );

      if (typeof window.downloadFile === 'function') {
        downloadFile(pdfBytes, 'images-converted.pdf');
      }
      if (typeof window.showSuccess === 'function') window.showSuccess('Images converted to PDF successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
