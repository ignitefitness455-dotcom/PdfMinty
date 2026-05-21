import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'rotate',
    title: 'Rotate PDF',
    description: 'Rotate all pages in your PDF document',
    icon: window.PdfMinty.ICONS.rotate || '📄',
    actionText: '↻ Rotate PDF',
    isMultiFile: false,
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: null-safe .value access with fallback default
      const direction = document.getElementById('rotate-direction')?.value ?? 'right';
      const degree = direction === 'right' ? 90 : -90;

      if (typeof window.showProgress === 'function') window.showProgress(5);

      const resultBytes = await window.runPdfWorkerTask(
        'rotate',
        {
          fileBytes: actualBytes,
          degree: degree,
        },
        [actualBytes.buffer],
        (prog) => {
          if (typeof window.showProgress === 'function') window.showProgress(prog);
        },
      );

      // Bug 4 fix: validate output before reporting success
      if (!isValidOutput(resultBytes)) {
        throw new Error('Failed to rotate PDF: output file is empty.');
      }

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_rotated.pdf');
      if (typeof showSuccess === 'function') showSuccess('PDF rotated successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
