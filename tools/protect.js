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
    toolId: 'protect',
    title: 'Protect PDF',
    description: 'Add password protection to your PDF document',
    icon: ICONS.protect || '📄',
    actionText: '🔒 Protect PDF',
    isMultiFile: false,
    instructions: [
      'Upload the PDF document you want to secure.',
      'Enter a strong password for the document.',
      'Click 🔒 Protect PDF to encrypt your file.',
      'The password-protected PDF will be downloaded.'
    ],
    settingsHtml: `
      <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Password</label>
          <input type="password" id="pdf-password" class="text-input" placeholder="Enter password to encrypt PDF">
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      const password = document.getElementById('pdf-password').value;
      if (!password) throw new Error('Password is required');
      if (typeof window.showProgress === 'function') window.showProgress(5);

      const resultBytes = await runPdfWorkerTask(
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

      if (typeof window.downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_protected.pdf');
      if (typeof window.showSuccess === 'function') window.showSuccess('PDF protected successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
