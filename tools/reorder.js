import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'reorder',
    title: 'Reorder PDF',
    description: 'Change the order of pages in your PDF',
    icon: window.PdfMinty.ICONS.reorder || '📄',
    actionText: '🔄 Reorder PDF',
    isMultiFile: false,
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: null-safe element lookup and .value access
      const realInput =
        document.getElementById('page-order') || document.querySelector('input[type="text"]');
      if (!realInput) throw new Error('Page order input not found. Please reload the tool.');
      const inputValue = (realInput.value ?? '').trim();
      if (!inputValue) throw new Error('Enter page order.');

      let newOrder = [];
      for (let p of inputValue.split(',')) {
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
      if (typeof window.runPdfWorkerTask === 'function') {
        const payload = { fileBytes: new Uint8Array(actualBytes), newOrder };
        resultBytes = await window.runPdfWorkerTask('reorder', payload, [payload.fileBytes.buffer]);
      } else {
        throw new Error('Worker not found');
      }

      // Bug 4 fix: validate output before reporting success
      if (!isValidOutput(resultBytes)) {
        throw new Error('Failed to reorder PDF: output file is empty.');
      }

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_reordered.pdf');
      if (typeof showSuccess === 'function') showSuccess('PDF reordered successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
