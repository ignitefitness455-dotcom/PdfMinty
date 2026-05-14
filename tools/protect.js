import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'protect',
    title: 'Protect PDF',
    description: 'Add password protection to your PDF document',
    icon: window.PdfMinty.ICONS.protect || '📄',
    actionText: '🔒 Protect PDF',
    isMultiFile: false,
    onApply: async ({ actualBytes, currentFileName }) => {
      const password = document.getElementById('pdf-password').value;
      if (!password) throw new Error('Password is required');
      if (typeof window.showProgress === 'function') window.showProgress(5);

      const resultBytes = await window.runPdfWorkerTask(
        'protect',
        {
          fileBytes: actualBytes,
          password: password,
          fileName: currentFileName,
        },
        [actualBytes.buffer],
        (prog) => {
          if (typeof window.showProgress === 'function') window.showProgress(prog);
        },
      );

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_protected.pdf');
      if (typeof showSuccess === 'function') showSuccess('PDF protected successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
