import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'compress',
    title: 'Compress PDF',
    description: 'Reduce file size by optimizing PDF structure or compressing images',
    icon: window.PdfMinty.ICONS.compress || '📄',
    actionText: '🗜️ Compress PDF',
    isMultiFile: false,
    settingsHtml: `
      <div class="radio-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
          <div class="radio-title" style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">Compression Level</div>
          <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="compression-level" value="basic" checked style="accent-color: var(--primary);"> Basic (Metadata & Object Stream Optimization)</label>
          <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="compression-level" value="strong" style="accent-color: var(--primary);"> Strong (Basic + Image Re-encoding, Medium Quality)</label>
          <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="compression-level" value="deep" style="accent-color: var(--primary);"> Deep (Basic + Image Re-encoding, Low Quality)</label>
      </div>
    `,
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      let resultBytes;
      // Bug 1 fix: null-safe access with fallback default
      const compressionLevel = document.querySelector('input[name="compression-level"]:checked')?.value ?? 'basic';

      if (typeof window.runPdfWorkerTask === 'function') {
        const payload = { fileBytes: new Uint8Array(actualBytes), compressionLevel };
        resultBytes = await window.runPdfWorkerTask('compress', payload, [
          payload.fileBytes.buffer,
        ]);
      } else {
        throw new Error('Worker not found');
      }

      // Bug 4 fix: validate output before reporting success
      if (!isValidOutput(resultBytes)) {
        throw new Error('Failed to compress PDF: output file is empty.');
      }

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_compressed.pdf');
      if (typeof showSuccess === 'function') showSuccess('PDF compressed successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
