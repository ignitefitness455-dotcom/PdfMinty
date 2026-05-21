import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'extract-pages',
    title: 'Extract Pages',
    description: 'Get specific pages from your PDF as a new document',
    icon: window.PdfMinty.ICONS.extract_pages || '📄',
    actionText: '📑 Extract Pages',
    isMultiFile: false,
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: null-safe .value access
      const rangesText = (document.getElementById('extract-ranges')?.value ?? '').trim();
      if (!rangesText) throw new Error('Please enter pages to extract.');

      if (typeof window.showProgress === 'function') window.showProgress(5);

      const resultBytes = await window.runPdfWorkerTask(
        'extract-pages',
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
        throw new Error('Failed to extract pages: output file is empty.');
      }

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_extracted.pdf');
      if (typeof showSuccess === 'function') showSuccess('Pages extracted successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
