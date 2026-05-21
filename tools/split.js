import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { setupBackButton } from './shared.js';

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
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: null-safe .value access
      const rangesText = (document.getElementById('split-ranges')?.value ?? '').trim();
      if (!rangesText) throw new Error('Enter ranges to split.');

      let ranges = [];
      for (let p of rangesText.split(',')) {
        p = p.trim();
        if (p.includes('-')) {
          const [s, e] = p.split('-').map(Number);
          if (s && e) ranges.push({ start: s, end: e });
        } else if (!isNaN(Number(p)) && p !== '') {
          ranges.push({ start: Number(p), end: Number(p) });
        }
      }
      if (ranges.length === 0) throw new Error('Invalid ranges.');

      if (typeof window.runPdfWorkerTask === 'function') {
        const payload = {
          fileBytes: new Uint8Array(actualBytes),
          ranges,
          fileName: currentFileName,
        };
        const results = await window.runPdfWorkerTask('split', payload, [payload.fileBytes.buffer]);

        // Bug 4 fix: validate results array before triggering download
        if (!results || results.length === 0) {
          throw new Error('Failed to split PDF: no output files were produced.');
        }

        if (results.length === 1) {
          // Bug 4 fix: validate single result has non-empty bytes
          if (!results[0]?.bytes || results[0].bytes.length === 0) {
            throw new Error('Failed to split PDF: output file is empty.');
          }
          if (typeof downloadFile === 'function') downloadFile(results[0].bytes, results[0].name);
        } else {
          const JSZip = (await import("jszip")).default;
          const zip = new JSZip();
          results.forEach((r) => {
            // Bug 4 fix: only add non-empty files to the zip
            if (r?.bytes && r.bytes.length > 0) {
              zip.file(r.name, r.bytes);
            }
          });
          // Bug 4 fix: await zip generation before triggering download
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          if (!zipBlob || zipBlob.size === 0) {
            throw new Error('Failed to create split archive: output is empty.');
          }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(zipBlob);
          a.download = currentFileName + '_split.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(a.href), 100);
        }
      } else {
        throw new Error('Worker not found');
      }
      if (typeof showSuccess === 'function') showSuccess('PDF split successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
