import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { isValidOutput, setupBackButton } from './shared.js';

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
    settingsHtml: `<div class="settings-panel" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; padding: 1.5rem; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
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
      // Bug 5 fix: set up back button with history API
      setupBackButton();

      const opacityInput = document.getElementById('wm-opacity');
      const opacityVal = document.getElementById('opacity-val');
      const sizeInput = document.getElementById('wm-size');
      const sizeVal = document.getElementById('size-val');
      const rotationInput = document.getElementById('wm-rotation');
      const rotationVal = document.getElementById('rotation-val');
      const colorInput = document.getElementById('wm-color');
      const colorHex = document.getElementById('color-hex');
      // These elements do not exist in the current settingsHtml but are guarded safely
      const bgOpacityInput = document.getElementById('wm-bg-opacity');
      const bgOpacityVal = document.getElementById('bg-opacity-val');

      if (opacityInput && opacityVal)
        opacityInput.addEventListener(
          'input',
          (e) => (opacityVal.textContent = e.target.value + '%'),
        );
      if (sizeInput && sizeVal)
        sizeInput.addEventListener('input', (e) => (sizeVal.textContent = e.target.value + 'px'));
      if (rotationInput && rotationVal)
        rotationInput.addEventListener('input', (e) => (rotationVal.textContent = e.target.value + '°'));
      if (colorInput && colorHex)
        colorInput.addEventListener('input', (e) => (colorHex.textContent = e.target.value.toUpperCase()));
      if (bgOpacityInput && bgOpacityVal)
        bgOpacityInput.addEventListener(
          'input',
          (e) => (bgOpacityVal.textContent = e.target.value + '%'),
        );
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      // Bug 1 fix: null-safe .value access with fallback defaults on all DOM fields
      const text = document.getElementById('wm-text')?.value ?? '';
      if (!text) throw new Error('Watermark text is required');

      const rawColor = document.getElementById('wm-color')?.value ?? '#ff0000';
      const r = parseInt(rawColor.substr(1, 2), 16) / 255;
      const g = parseInt(rawColor.substr(3, 2), 16) / 255;
      const b = parseInt(rawColor.substr(5, 2), 16) / 255;

      const textSize = parseInt(document.getElementById('wm-size')?.value ?? '60', 10);
      const opacity = parseInt(document.getElementById('wm-opacity')?.value ?? '30', 10) / 100;
      const rotationDeg = parseInt(document.getElementById('wm-rotation')?.value ?? '45', 10);
      const position = document.getElementById('wm-position')?.value ?? 'center';

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

      // Bug 4 fix: validate output before reporting success
      if (!isValidOutput(resultBytes)) {
        throw new Error('Failed to add watermark: output file is empty.');
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
