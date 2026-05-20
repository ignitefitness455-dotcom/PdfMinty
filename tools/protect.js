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
    settingsHtml: `
      <div class="settings-panel">
        <div class="setting-group full-width">
          <label class="input-label">Password</label>
          <input type="password" id="pdf-password" class="text-input" placeholder="Enter a strong password" required />
        </div>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      // Defensive check: ensure password input exists and has a value
      const passwordInput = document.getElementById('pdf-password');
      if (!passwordInput) {
        throw new Error('Password field not found. Please refresh the page.');
      }

      const password = passwordInput.value?.trim();
      if (!password) {
        throw new Error('Password is required');
      }

      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
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

        // Verify result bytes exist before downloading
        if (!resultBytes || resultBytes.length === 0) {
          throw new Error('PDF protection failed: empty result');
        }

        if (typeof downloadFile === 'function') {
          downloadFile(resultBytes, currentFileName + '_protected.pdf');
        } else {
          throw new Error('Download function not available');
        }

        if (typeof showSuccess === 'function') {
          showSuccess('PDF protected successfully!');
        }
      } catch (error) {
        // Re-throw to let processPdfTask handle error display
        throw error;
      }
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
