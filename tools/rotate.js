import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'rotate',
    title: 'Rotate PDF',
    description: 'Rotate all pages in your PDF document',
    icon: window.PdfMinty.ICONS.rotate || '📄',
    actionText: '↻ Rotate PDF',
    isMultiFile: false,
    settingsHtml: `
      <div class="settings-panel">
        <div class="setting-group full-width">
          <label class="input-label">Rotation Direction</label>
          <select id="rotate-direction" class="select-input">
            <option value="right">Rotate 90° Clockwise (Right)</option>
            <option value="left">Rotate 90° Counter-Clockwise (Left)</option>
          </select>
        </div>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      // Defensive check: ensure rotate-direction select exists
      const directionSelect = document.getElementById('rotate-direction');
      if (!directionSelect) {
        throw new Error('Rotation direction selector not found. Please refresh the page.');
      }

      const direction = directionSelect.value;
      const degree = direction === 'right' ? 90 : -90;

      if (typeof window.showProgress === 'function') window.showProgress(5);

      try {
        const resultBytes = await window.runPdfWorkerTask(
          'rotate',
          {
            fileBytes: actualBytes,
            degree: degree,
          },
          [actualBytes.buffer],
          (prog) => {
            if (typeof window.showProgress === 'function') window.showProgress(prog);
          },
        );

        // Verify result bytes exist before downloading
        if (!resultBytes || resultBytes.length === 0) {
          throw new Error('PDF rotation failed: empty result');
        }

        if (typeof downloadFile === 'function') {
          downloadFile(resultBytes, currentFileName + '_rotated.pdf');
        } else {
          throw new Error('Download function not available');
        }

        if (typeof showSuccess === 'function') {
          showSuccess('PDF rotated successfully!');
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
