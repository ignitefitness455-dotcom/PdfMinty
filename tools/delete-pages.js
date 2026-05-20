import { setupToolUI } from '../utils/pdfToolsSetup.js';

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
    settingsHtml: `
      <div class="settings-panel">
        <div class="setting-group full-width">
          <label class="input-label">Pages to Delete</label>
          <input type="text" id="delete-ranges" class="text-input" placeholder="e.g., 1,3,5-7 or 2-4" required />
          <small style="color: var(--muted); font-size: 0.85rem; margin-top: 0.25rem;">Separate pages with commas. Use hyphens for ranges (e.g., 2-4).</small>
        </div>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      // Defensive check: ensure delete-ranges input exists
      const rangesInput = document.getElementById('delete-ranges');
      if (!rangesInput) {
        throw new Error('Pages input field not found. Please refresh the page.');
      }

      const rangesText = rangesInput.value?.trim();
      if (!rangesText) {
        throw new Error('Please enter pages to delete.');
      }

      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
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

        // Verify result bytes exist before downloading
        if (!resultBytes || resultBytes.length === 0) {
          throw new Error('Page deletion failed: empty result');
        }

        if (typeof downloadFile === 'function') {
          downloadFile(resultBytes, currentFileName + '_deleted.pdf');
        } else {
          throw new Error('Download function not available');
        }

        if (typeof showSuccess === 'function') {
          showSuccess('Pages deleted successfully!');
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
