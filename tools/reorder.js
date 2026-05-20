import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  let totalPages = 0;

  setupToolUI({
    toolId: 'reorder',
    title: 'Reorder PDF',
    description: 'Change the order of pages in your PDF',
    icon: window.PdfMinty.ICONS.reorder || '📄',
    actionText: '🔄 Reorder PDF',
    isMultiFile: false,
    settingsHtml: `
      <div class="settings-panel">
        <div class="setting-group full-width">
          <label class="input-label">Page Order</label>
          <input type="text" id="page-order" class="text-input" placeholder="e.g., 1,2,3 or 3,2,1 or 1-3" required />
          <small style="color: var(--muted); font-size: 0.85rem; margin-top: 0.25rem;">Enter the order of pages. Use commas to separate and hyphens for ranges (e.g., 3,2,1 or 1-3).</small>
        </div>
      </div>
    `,
    onInit: () => {
      // Hook into file load to detect page count and prepopulate
      const originalSetupToolUI = window.setupToolUI;
      
      // We'll override the file handling to detect page count
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
          if (e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
              const ab = await file.arrayBuffer();
              const { PDFDocument } = await import('pdf-lib');
              const pdfDoc = await PDFDocument.load(ab);
              totalPages = pdfDoc.getPageCount();

              // Prepopulate page order with default sequence
              const pageOrderInput = document.getElementById('page-order');
              if (pageOrderInput && totalPages > 0) {
                const defaultOrder = Array.from({ length: totalPages }, (_, i) => i + 1).join(',');
                pageOrderInput.value = defaultOrder;
                pageOrderInput.placeholder = `e.g., 1,2,3 (total ${totalPages} pages)`;
              }
            } catch (err) {
              console.error('Error detecting page count:', err);
            }
          }
        });
      }
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Defensive check: ensure page-order input exists
      const pageOrderInput = document.getElementById('page-order');
      if (!pageOrderInput) {
        throw new Error('Page order input field not found. Please refresh the page.');
      }

      const pageOrderText = pageOrderInput.value?.trim();
      if (!pageOrderText) {
        throw new Error('Enter page order.');
      }

      let newOrder = [];
      for (let p of pageOrderText.split(',')) {
        let pStr = p.trim();
        if (pStr.includes('-')) {
          const [s, e] = pStr.split('-').map(Number);
          if (s && e) {
            if (s <= e) {
              for (let i = s; i <= e; i++) newOrder.push(i);
            } else {
              for (let i = s; i >= e; i--) newOrder.push(i);
            }
          }
        } else if (pStr && !isNaN(Number(pStr))) {
          newOrder.push(Number(pStr));
        }
      }

      if (newOrder.length === 0) {
        throw new Error('Invalid page order format.');
      }

      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
        // Load PDF to get total page count for validation
        const { PDFDocument } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.load(actualBytes);
        const totalPages = pdfDoc.getPageCount();

        if (newOrder.length !== totalPages) {
          throw new Error(`You must include all ${totalPages} pages exactly once. You provided ${newOrder.length} pages.`);
        }

        if (typeof window.runPdfWorkerTask !== 'function') {
          throw new Error('Worker not found');
        }

        const payload = { fileBytes: new Uint8Array(actualBytes), newOrder };
        const resultBytes = await window.runPdfWorkerTask('reorder', payload, [payload.fileBytes.buffer], (prog) => {
          if (typeof window.showProgress === 'function') window.showProgress(prog);
        });

        // Verify result bytes exist before downloading
        if (!resultBytes || resultBytes.length === 0) {
          throw new Error('PDF reorder failed: empty result');
        }

        if (typeof downloadFile === 'function') {
          downloadFile(resultBytes, currentFileName + '_reordered.pdf');
        } else {
          throw new Error('Download function not available');
        }

        if (typeof showSuccess === 'function') {
          showSuccess('PDF reordered successfully!');
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
