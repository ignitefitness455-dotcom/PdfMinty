import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

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
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: null-safe access (already present, kept and strengthened)
      const passwordInput = document.getElementById('pdf-password');
      if (!passwordInput) {
        throw new Error('Password input field not found. Please reload the tool.');
      }
      const password = passwordInput.value ?? '';

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

        // Bug 4 fix: validate output before reporting success
        if (!isValidOutput(resultBytes)) {
          throw new Error('Failed to unlock PDF: output file is empty.');
        }

        if (typeof downloadFile === 'function')
          downloadFile(resultBytes, currentFileName + '_unlocked.pdf');
        if (typeof showSuccess === 'function') showSuccess('PDF unlocked successfully!');
      } catch (e) {
        if (e.message && e.message.includes('Incorrect password')) throw e;
        if (e.message && e.message.includes('Failed to unlock')) throw e;
        throw new Error('Incorrect password or unable to unlock.', { cause: e });
      }
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
