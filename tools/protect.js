import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

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
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: null-safe access on password field
      const passwordInput = document.getElementById('pdf-password');
      if (!passwordInput) {
        throw new Error('Password input field not found. Please reload the tool.');
      }
      const password = passwordInput.value ?? '';
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

      // Bug 4 fix: validate output before reporting success
      if (!isValidOutput(resultBytes)) {
        throw new Error('Failed to protect PDF: output file is empty.');
      }

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_protected.pdf');
      if (typeof showSuccess === 'function') showSuccess('PDF protected successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
