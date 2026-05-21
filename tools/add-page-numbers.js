import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'add-page-numbers',
    title: 'Add Page Numbers',
    description: 'Insert page numbers into your PDF document',
    icon: window.PdfMinty.ICONS.add_page_numbers || '📄',
    actionText: '🔢 Add Page Numbers',
    isMultiFile: false,
    settingsHtml: `<div class="settings-panel">
                    <div class="setting-group">
                        <label class="input-label">Format</label>
                        <select id="format-select" class="select-input">
                            <option value="1">1, 2, 3...</option>
                            <option value="page_1">Page 1, Page 2...</option>
                            <option value="1_of_n">1 of N, 2 of N...</option>
                            <option value="page_1_of_n">Page 1 of N...</option>
                            <option value="-1-">- 1 -, - 2 -...</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label class="input-label">Position</label>
                        <select id="position-select" class="select-input">
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Font Size</span> <span id="size-val" style="color:var(--accent)">12px</span></label>
                        <input type="range" id="size-input" class="range-input" min="8" max="48" value="12">
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Margin</span> <span id="margin-val" style="color:var(--accent)">30px</span></label>
                        <input type="range" id="margin-input" class="range-input" min="10" max="100" value="30">
                    </div>
                    <div class="setting-group full-width">
                        <label class="input-label">Color</label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="color-input" class="color-input" value="#000000">
                            <span id="color-hex" class="color-hex">#000000</span>
                        </div>
                    </div>
                </div>`,

    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();

      const sizeInput = document.getElementById('size-input');
      const sizeVal = document.getElementById('size-val');
      const marginInput = document.getElementById('margin-input');
      const marginVal = document.getElementById('margin-val');
      const colorInput = document.getElementById('color-input');
      const colorHex = document.getElementById('color-hex');

      if (sizeInput && sizeVal)
        sizeInput.addEventListener('input', (e) => (sizeVal.textContent = e.target.value + 'px'));
      if (marginInput && marginVal)
        marginInput.addEventListener(
          'input',
          (e) => (marginVal.textContent = e.target.value + 'px'),
        );
      if (colorInput && colorHex)
        colorInput.addEventListener(
          'input',
          (e) => (colorHex.textContent = e.target.value.toUpperCase()),
        );
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: the original code referenced non-existent IDs (num-format, num-position,
      // num-size, num-margin). The actual IDs in settingsHtml are format-select, position-select,
      // size-input, margin-input. Use null-safe access with fallback defaults.
      const format = document.getElementById('format-select')?.value ?? '1';
      const position = document.getElementById('position-select')?.value ?? 'bottom-center';
      const size = parseInt(document.getElementById('size-input')?.value ?? '12', 10);
      const margin = parseInt(document.getElementById('margin-input')?.value ?? '30', 10);

      // Read color from color-input and convert to normalised RGB
      const rawColor = document.getElementById('color-input')?.value ?? '#000000';
      const r = parseInt(rawColor.substr(1, 2), 16) / 255;
      const g = parseInt(rawColor.substr(3, 2), 16) / 255;
      const b = parseInt(rawColor.substr(5, 2), 16) / 255;

      let resultBytes;
      if (typeof window.runPdfWorkerTask === 'function') {
        const payload = {
          fileBytes: new Uint8Array(actualBytes),
          format,
          position,
          size,
          margin,
          colorRgb: { r, g, b },
        };
        resultBytes = await window.runPdfWorkerTask('add-page-numbers', payload, [
          payload.fileBytes.buffer,
        ]);
      } else {
        throw new Error('Worker not found');
      }

      // Bug 4 fix: validate output before reporting success
      if (!isValidOutput(resultBytes)) {
        throw new Error('Failed to add page numbers: output file is empty.');
      }

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_numbered.pdf');
      if (typeof showSuccess === 'function') showSuccess('Page numbers added successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
