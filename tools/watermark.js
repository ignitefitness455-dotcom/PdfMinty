import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'watermark',
    title: 'Watermark PDF',
    description: 'Stamp text on your PDF pages',
    icon: window.PdfMinty.ICONS.watermark || '📄',
    actionText: '💧 Add Watermark',
    isMultiFile: false,
    settingsHtml: `<div class="settings-panel">
                    <div class="setting-group full-width">
                        <label class="input-label">Watermark Text</label>
                        <input type="text" id="wm-text" class="text-input" placeholder="e.g., CONFIDENTIAL" value="CONFIDENTIAL">
                    </div>
                    <div class="setting-group">
                        <label class="input-label">Color</label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="wm-color" class="color-input" value="#ff0000">
                            <span id="color-hex" class="color-hex">#FF0000</span>
                        </div>
                    </div>
                    <div class="setting-group">
                        <label class="input-label">Position</label>
                        <select id="wm-position" class="select-input">
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Font Size</span> <span id="size-val" style="color:var(--accent)">60px</span></label>
                        <input type="range" id="wm-size" class="range-input" min="12" max="150" value="60">
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Opacity</span> <span id="opacity-val" style="color:var(--accent)">30%</span></label>
                        <input type="range" id="wm-opacity" class="range-input" min="5" max="100" value="30">
                    </div>
                    <div class="setting-group full-width">
                        <label class="input-label"><span>Rotation</span> <span id="rotation-val" style="color:var(--accent)">45°</span></label>
                        <input type="range" id="wm-rotation" class="range-input" min="-90" max="90" value="45">
                    </div>
                </div>`,

    onInit: () => {
      const opacityInput = document.getElementById('wm-opacity');
      const opacityVal = document.getElementById('opacity-val');
      const sizeInput = document.getElementById('wm-size');
      const sizeVal = document.getElementById('size-val');
      const bgOpacityInput = document.getElementById('wm-bg-opacity');
      const bgOpacityVal = document.getElementById('bg-opacity-val');

      if (opacityInput)
        opacityInput.addEventListener(
          'input',
          (e) => (opacityVal.textContent = e.target.value + '%'),
        );
      if (sizeInput)
        sizeInput.addEventListener('input', (e) => (sizeVal.textContent = e.target.value + 'px'));
      if (bgOpacityInput)
        bgOpacityInput.addEventListener(
          'input',
          (e) => (bgOpacityVal.textContent = e.target.value + '%'),
        );
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      const text = document.getElementById('wm-text').value;
      if (!text) throw new Error('Text is required');

      const rawColor = document.getElementById('wm-color').value;
      const r = parseInt(rawColor.substr(1, 2), 16) / 255;
      const g = parseInt(rawColor.substr(3, 2), 16) / 255;
      const b = parseInt(rawColor.substr(5, 2), 16) / 255;

      const textSize = parseInt(document.getElementById('wm-size').value, 10);
      const opacity = parseInt(document.getElementById('wm-opacity').value, 10) / 100;
      const rotationDeg = parseInt(document.getElementById('wm-rotation').value, 10);
      const position = document.getElementById('wm-position').value;

      let resultBytes;
      if (typeof window.runPdfWorkerTask === 'function') {
        const payload = {
          fileBytes: new Uint8Array(actualBytes),
          text,
          colorRgb: { r, g, b },
          opacity,
          textSize,
          rotationDeg,
          position,
        };
        resultBytes = await window.runPdfWorkerTask('watermark', payload, [
          payload.fileBytes.buffer,
        ]);
      } else {
        throw new Error('Worker not found');
      }

      if (typeof downloadFile === 'function')
        downloadFile(resultBytes, currentFileName + '_watermarked.pdf');
      if (typeof showSuccess === 'function') showSuccess('Watermark added successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
