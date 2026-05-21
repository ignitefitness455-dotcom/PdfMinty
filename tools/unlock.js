import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'unlock',
    title: 'Unlock PDF',
    description: 'Remove password protection from your PDF',
    icon: window.PdfMinty.ICONS.unlock || '📄',
    actionText: '🔓 Unlock PDF',
    isMultiFile: false,
    onApply: async ({ actualBytes, currentFileName }) => {
      const passwordInput = document.getElementById('pdf-password');
      if (!passwordInput) {
        throw new Error('Password input field not found. Please reload the tool.');
      }
      const password = passwordInput.value;

      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
        const resultBytes = await window.runPdfWorkerTask(
          'unlock',
          {
            fileBytes: actualBytes,
            password: password,
          },
          [actualBytes.buffer],
          (prog) => {
            if (typeof window.showProgress === 'function') window.showProgress(prog);
          },
        );

        if (typeof downloadFile === 'function')
          downloadFile(resultBytes, currentFileName + '_unlocked.pdf');
        if (typeof showSuccess === 'function') showSuccess('PDF unlocked successfully!');
      } catch (e) {
        if (e.message && e.message.includes('Incorrect password')) throw e;
        throw new Error('Incorrect password or unable to unlock.', { cause: e });
      }
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
