import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'delete-pages',
    title: 'Delete Pages',
    description: 'Remove unwanted pages from your PDF',
    icon: window.PdfMinty.ICONS.delete_pages || '📄',
    actionText: '🗑️ Delete Pages',
    isMultiFile: false,
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: null-safe .value access
      const rangesText = (document.getElementById('delete-ranges')?.value ?? '').trim();
      if (!rangesText) throw new Error('Please enter pages to delete.');

      if (typeof window.showProgress === 'function') window.showProgress(5);

      const resultBytes = await window.runPdfWorkerTask(
        'delete-pages',
        {
          fileBytes: actualBytes,
          rangesText: rangesText,
        },
        [actualBytes.buffer],
        (prog) => {
          if (typeof window.showProgress === 'function') window.showProgress(prog);
        },
      );

      // Bug 4 fix: validate output before reporting success
      if (!isValidOutput(resultBytes)) {
        throw new Error('Failed to delete pages: output file is empty.');
      }

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_deleted.pdf');
      if (typeof showSuccess === 'function') showSuccess('Pages deleted successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
