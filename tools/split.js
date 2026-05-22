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
    toolId: 'split',
    title: 'Split PDF',
    description: 'Extract pages or split your PDF into multiple files',
    icon: ICONS.split || '📄',
    actionText: '✂️ Split PDF',
    isMultiFile: false,
    instructions: [
      'Click or drag and drop to upload your PDF file.',
      'Specify the page ranges you want to extract (e.g., 1-3, 5).',
      'Click the ✂️ Split PDF button to extract the specified pages.',
      'Your split PDF will be downloaded instantly as a ZIP file.'
    ],
    settingsHtml: `
      <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Split Ranges</label>
          <input type="text" id="split-ranges" class="text-input" placeholder="e.g. 1-2, 3-5, 6">
          <p style="font-size: 0.85rem; color: var(--muted); margin-top: 0.5rem;">Use commas and hyphens. It will create multiple documents, one for each range, output as a ZIP file.</p>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      const rangesText = document.getElementById('split-ranges').value.trim();
      if (!rangesText) throw new Error('Enter ranges to split.');

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

      showProgress(10);
      const payload = {
        fileBytes: new Uint8Array(actualBytes),
        ranges,
        fileName: currentFileName,
      };
      const results = await runPdfWorkerTask('split', payload, [payload.fileBytes.buffer]);

      if (results.length === 1) {
        downloadFile(results[0].bytes, results[0].name);
      } else {
        const JSZipModule = await import('jszip');
        const JSZip = JSZipModule.default || JSZipModule;
        const zip = new JSZip();
        results.forEach((r) => zip.file(r.name, r.bytes));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipBlob);
        a.download = currentFileName + '_split.zip';
        a.click();
      }
      showSuccess('PDF split successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
