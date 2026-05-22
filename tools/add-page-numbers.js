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
    toolId: 'add-page-numbers',
    title: 'Add Page Numbers',
    description: 'Insert page numbers into your PDF document',
    icon: ICONS.add_page_numbers || '📄',
    actionText: '🔢 Add Page Numbers',
    isMultiFile: false,
    instructions: [
      'Upload your PDF file.',
      'Select the format and position where page numbers should appear.',
      'Click 🔢 Add Page Numbers to insert them.',
      'Download the document with numbered pages.'
    ],
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
      const sizeInput = document.getElementById('size-input');
      const sizeVal = document.getElementById('size-val');
      const marginInput = document.getElementById('margin-input');
      const marginVal = document.getElementById('margin-val');
      const colorInput = document.getElementById('color-input');
      const colorHex = document.getElementById('color-hex');

      if (sizeInput)
        sizeInput.addEventListener('input', (e) => (sizeVal.textContent = e.target.value + 'px'));
      if (marginInput)
        marginInput.addEventListener(
          'input',
          (e) => (marginVal.textContent = e.target.value + 'px'),
        );
      if (colorInput)
        colorInput.addEventListener(
          'input',
          (e) => (colorHex.textContent = e.target.value.toUpperCase()),
        );
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      const format = document.getElementById('num-format')?.value || document.getElementById('format-select')?.value;
      const position = document.getElementById('num-position')?.value || document.getElementById('position-select')?.value;
      const sizeInput = document.getElementById('num-size') || document.getElementById('size-input');
      const marginInput = document.getElementById('num-margin') || document.getElementById('margin-input');
      const size = sizeInput ? parseInt(sizeInput.value, 10) : 12;
      const margin = marginInput ? parseInt(marginInput.value, 10) : 30;

      const colorInput = document.getElementById('color-input');
      const hex = colorInput ? colorInput.value : '#000000';
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      showProgress(10);
      const payload = {
        fileBytes: new Uint8Array(actualBytes),
        format,
        position,
        size,
        margin,
        colorRgb: { r, g, b },
      };
      const resultBytes = await runPdfWorkerTask('add-page-numbers', payload, [
        payload.fileBytes.buffer,
      ]);

      downloadFile(resultBytes, currentFileName + '_numbered.pdf');
      showSuccess('Page numbers added successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
