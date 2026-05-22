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
    toolId: 'reorder',
    title: 'Reorder PDF',
    description: 'Change the order of pages in your PDF',
    icon: ICONS.reorder || '📄',
    actionText: '🔄 Reorder PDF',
    isMultiFile: false,
    instructions: [
      'Select the PDF file you want to organize.',
      'Provide the new page order using commas and hyphens (e.g., 3, 2, 1).',
      'Click 🔄 Reorder PDF to rearrange the pages.',
      'Your newly ordered PDF is ready for download.'
    ],
    settingsHtml: `
      <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">New Page Order</label>
          <input type="text" id="page-order" class="text-input" placeholder="e.g. 5, 4, 3, 2, 1 or 1-3, 5, 4">
          <p style="font-size: 0.85rem; color: var(--muted); margin-top: 0.5rem;">Enter the new order using commas and hyphens.</p>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      const realInput =
        document.getElementById('page-order') || document.querySelector('input[type="text"]');
      if (!realInput || !realInput.value) throw new Error('Enter page order.');

      let newOrder = [];
      for (let p of realInput.value.trim().split(',')) {
        let pStr = p.trim();
        if (pStr.includes('-')) {
          const [s, e] = pStr.split('-').map(Number);
          if (s <= e) {
            for (let i = s; i <= e; i++) newOrder.push(i);
          } else {
            for (let i = s; i >= e; i--) newOrder.push(i);
          }
        } else if (pStr) newOrder.push(Number(pStr));
      }

      const pdfDoc = await (await import('pdf-lib')).PDFDocument.load(actualBytes);
      const totalPages = pdfDoc.getPageCount();

      if (newOrder.length !== totalPages)
        throw new Error('You must include all pages exactly once.');

      let resultBytes;
      if (typeof runPdfWorkerTask !== 'undefined') {
        const payload = { fileBytes: new Uint8Array(actualBytes), newOrder };
        resultBytes = await runPdfWorkerTask('reorder', payload, [payload.fileBytes.buffer]);
      } else {
        throw new Error('Worker not found');
      }
      if (typeof window.downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_reordered.pdf');
      if (typeof window.showSuccess === 'function') window.showSuccess('PDF reordered successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
