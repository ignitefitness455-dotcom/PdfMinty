import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'split',
    title: 'Split PDF',
    description: 'Extract pages or split your PDF into multiple files',
    icon: window.PdfMinty.ICONS.split || '📄',
    actionText: '✂️ Split PDF',
    isMultiFile: false,
    settingsHtml: `
      <div class="settings-panel">
        <div class="setting-group full-width">
          <label class="input-label">Ranges to Split</label>
          <input type="text" id="split-ranges" class="text-input" placeholder="e.g., 1-3, 4-6, 7 or 1-5" required />
          <small style="color: var(--muted); font-size: 0.85rem; margin-top: 0.25rem;">Each range becomes a separate file. Use commas to separate ranges (e.g., 1-3, 4-6, 7).</small>
        </div>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      // Defensive check: ensure split-ranges input exists
      const rangesInput = document.getElementById('split-ranges');
      if (!rangesInput) {
        throw new Error('Ranges input field not found. Please refresh the page.');
      }

      const rangesText = rangesInput.value?.trim();
      if (!rangesText) {
        throw new Error('Enter ranges to split.');
      }

      let ranges = [];
      for (let p of rangesText.split(',')) {
        p = p.trim();
        if (p.includes('-')) {
          const [s, e] = p.split('-').map(Number);
          if (s && e) ranges.push({ start: s, end: e });
        } else if (!isNaN(Number(p))) {
          ranges.push({ start: Number(p), end: Number(p) });
        }
      }
      if (ranges.length === 0) throw new Error('Invalid ranges.');

      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
        if (typeof window.runPdfWorkerTask !== 'function') {
          throw new Error('Worker not found');
        }

        const payload = {
          fileBytes: new Uint8Array(actualBytes),
          ranges,
          fileName: currentFileName,
        };
        const results = await window.runPdfWorkerTask('split', payload, [payload.fileBytes.buffer], (prog) => {
          if (typeof window.showProgress === 'function') window.showProgress(prog);
        });

        // Verify results exist
        if (!results || results.length === 0) {
          throw new Error('PDF split failed: no results returned');
        }

        if (results.length === 1) {
          // Single file result
          if (!results[0].bytes || results[0].bytes.length === 0) {
            throw new Error('PDF split failed: empty result');
          }

          if (typeof downloadFile === 'function') {
            downloadFile(results[0].bytes, results[0].name);
          } else {
            throw new Error('Download function not available');
          }
        } else {
          // Multiple files: create ZIP
          const JSZip =
            (await import('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js')).default ||
            window.JSZip;

          if (!JSZip) {
            throw new Error('ZIP library failed to load');
          }

          const zip = new JSZip();
          results.forEach((r) => {
            if (r.bytes && r.bytes.length > 0) {
              zip.file(r.name, r.bytes);
            }
          });

          const zipBlob = await zip.generateAsync({ type: 'blob' });
          if (!zipBlob || zipBlob.size === 0) {
            throw new Error('ZIP generation failed: empty file');
          }

          const a = document.createElement('a');
          a.href = URL.createObjectURL(zipBlob);
          a.download = currentFileName + '_split.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(a.href), 100);
        }

        if (typeof showSuccess === 'function') {
          showSuccess('PDF split successfully!');
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
