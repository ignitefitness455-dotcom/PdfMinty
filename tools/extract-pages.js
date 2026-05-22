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
    toolId: 'extract-pages',
    title: 'Extract Pages',
    description: 'Get specific pages from your PDF as a new document',
    icon: ICONS.extract_pages || '📄',
    actionText: '📑 Extract Pages',
    isMultiFile: false,
    instructions: [
      'Upload your PDF file.',
      'Enter the specific page numbers to extract (e.g., 1, 5, 8).',
      'Click 📑 Extract Pages to create a new PDF with only those pages.',
      'Download the extracted PDF file.'
    ],
    settingsHtml: `
      <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Pages to Extract</label>
          <input type="text" id="extract-ranges" class="text-input" placeholder="e.g. 1-3, 5, 8">
          <p style="font-size: 0.85rem; color: var(--muted); margin-top: 0.5rem;">Use commas and hyphens (e.g. 1, 3, 5-10)</p>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      const rangesText = document.getElementById('extract-ranges').value.trim();
      if (!rangesText) throw new Error('Please enter pages to extract.');

      if (typeof window.showProgress === 'function') window.showProgress(5);

      const resultBytes = await runPdfWorkerTask(
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

      if (typeof window.downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_extracted.pdf');
      if (typeof window.showSuccess === 'function') window.showSuccess('Pages extracted successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
