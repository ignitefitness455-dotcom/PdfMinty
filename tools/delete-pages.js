import { ICONS } from "../src/ui/icons.js";
import { downloadFile, showSuccess, showError, showProgress, hideProgress } from '../utils/globals.js';
import { runPdfWorkerTask } from '../utils/pdfWorker.js';
import { setupToolUI } from '../src/utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'delete-pages',
    title: 'Delete Pages',
    description: 'Remove unwanted pages from your PDF',
    icon: ICONS.delete_pages || '📄',
    actionText: '🗑️ Delete Pages',
    isMultiFile: false,
    instructions: [
      'Upload the PDF document containing pages to remove.',
      'Enter the page numbers you want to delete (e.g., 2, 4-6).',
      'Click 🗑️ Delete Pages to remove them from the document.',
      'Download the updated PDF without the deleted pages.'
    ],
    settingsHtml: `
      <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Pages to Delete</label>
          <input type="text" id="delete-ranges" class="text-input" placeholder="e.g. 1-3, 5, 8">
          <p style="font-size: 0.85rem; color: var(--muted); margin-top: 0.5rem;">Use commas and hyphens (e.g. 1, 3, 5-10)</p>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      const rangesText = document.getElementById('delete-ranges').value.trim();
      if (!rangesText) throw new Error('Please enter pages to delete.');

      showProgress(5);

      const resultBytes = await runPdfWorkerTask(
        'delete-pages',
        {
          fileBytes: actualBytes,
          rangesText: rangesText,
        },
        [actualBytes.buffer],
        (prog) => {
          showProgress(prog);
        },
      );

      downloadFile(resultBytes, currentFileName + '_deleted.pdf');
      showSuccess('Pages deleted successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
