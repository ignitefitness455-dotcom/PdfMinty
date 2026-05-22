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
    toolId: 'unlock',
    title: 'Unlock PDF',
    description: 'Remove password protection from your PDF',
    icon: ICONS.unlock || '📄',
    actionText: '🔓 Unlock PDF',
    isMultiFile: false,
    instructions: [
      'Upload the locked PDF file.',
      'Enter the correct required password to unlock it.',
      'Click 🔓 Unlock PDF to remove the password protection permanently.',
      'Download the unlocked version of your PDF.'
    ],
    settingsHtml: `
      <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Password</label>
          <input type="password" id="pdf-password" class="text-input" placeholder="Enter password to decrypt PDF">
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      const password = document.getElementById('pdf-password')
        ? document.getElementById('pdf-password').value
        : document.querySelector('input[type="password"]').value;

      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
        const resultBytes = await runPdfWorkerTask(
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

        if (typeof window.downloadFile === 'function')
          downloadFile(resultBytes, currentFileName + '_unlocked.pdf');
        if (typeof window.showSuccess === 'function') window.showSuccess('PDF unlocked successfully!');
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
