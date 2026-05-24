/**
 * src/tools/add-page-numbers/ui.js
 */
import { createDropZone } from '../../ui/components/DropZone.js';
import { renderPdfThumbnail, formatBytes } from '../../utils/fileUtils.js';

export function createUI(container, { locale = 'en', onProcess, onCancel }) {
  container.innerHTML = `
    <div class="tool-container">
      <a class="back-link" href="/">← Back</a>
      <div class="tool-header">
        <h1>Add Page Numbers</h1>
        <p>Digitize and number your PDF with clean formatting styles and placements</p>
      </div>

      <div id="dropzone-container"></div>

      <div id="workspace" class="workspace hidden">
        <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05);">
          <img id="file-preview-img" alt="PDF Preview" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
            <span id="file-name-display" style="font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
            <span id="file-size-display" style="font-size: 0.875rem; color: var(--muted);"></span>
          </div>
          <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer;">✕</button>
        </div>

        <div class="settings-panel" style="border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;">
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
            <label class="input-label" style="display: flex; justify-content: space-between;">
              <span>Font Size</span> 
              <span id="size-val" style="color:var(--accent)">12px</span>
            </label>
            <input type="range" id="size-input" min="8" max="48" value="12" style="accent-color: var(--primary);">
          </div>
          <div class="setting-group">
            <label class="input-label" style="display: flex; justify-content: space-between;">
              <span>Margin</span> 
              <span id="margin-val" style="color:var(--accent)">30px</span>
            </label>
            <input type="range" id="margin-input" min="10" max="100" value="30" style="accent-color: var(--primary);">
          </div>
          <div class="setting-group full-width">
            <label class="input-label">Color</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input type="color" id="color-input" class="color-input" value="#000000" style="padding: 0; min-height: unset; height: 40px; width: 50px;">
              <span id="color-hex" style="font-size: 0.9rem; font-family: monospace; color: var(--muted);">#000000</span>
            </div>
          </div>
        </div>

        <div class="actions" style="display: flex; justify-content: center; margin-top: 2rem;">
          <button id="btn-apply" class="btn-action">🔢 Add Page Numbers</button>
        </div>
      </div>
    </div>
  `;

  let uploadedFile = null;
  let fileBytes = null;
  const workspace = container.querySelector('#workspace');
  const dropZoneContainer = container.querySelector('#dropzone-container');

  const sizeInput = container.querySelector('#size-input');
  const sizeVal = container.querySelector('#size-val');
  const marginInput = container.querySelector('#margin-input');
  const marginVal = container.querySelector('#margin-val');
  const colorInput = container.querySelector('#color-input');
  const colorHex = container.querySelector('#color-hex');

  sizeInput.addEventListener('input', (e) => {
    sizeVal.textContent = e.target.value + 'px';
  });
  marginInput.addEventListener('input', (e) => {
    marginVal.textContent = e.target.value + 'px';
  });
  colorInput.addEventListener('input', (e) => {
    colorHex.textContent = e.target.value.toUpperCase();
  });

  const dropZone = createDropZone(dropZoneContainer, {
    accept: '.pdf',
    multiple: false,
    onDrop: handleNewFile
  });

  async function handleNewFile(files) {
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      const arrayBuffer = await file.arrayBuffer();
      fileBytes = new Uint8Array(arrayBuffer);
      uploadedFile = file;

      container.querySelector('#file-name-display').textContent = file.name;
      container.querySelector('#file-size-display').textContent = formatBytes(file.size);

      const previewImg = container.querySelector('#file-preview-img');
      renderPdfThumbnail(file, previewImg);

      dropZone.element.classList.add('hidden');
      workspace.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      alert('Failed to load file');
    }
  }

  container.querySelector('#remove-file-btn').addEventListener('click', () => {
    uploadedFile = null;
    fileBytes = null;
    workspace.classList.add('hidden');
    dropZone.element.classList.remove('hidden');
    dropZone.reset();
  });

  container.querySelector('#btn-apply').addEventListener('click', () => {
    const format = container.querySelector('#format-select').value;
    const position = container.querySelector('#position-select').value;
    const size = parseInt(sizeInput.value, 10);
    const margin = parseInt(marginInput.value, 10);

    const hex = colorInput.value;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    onProcess(fileBytes, {
      format,
      position,
      size,
      margin,
      colorRgb: { r, g, b },
      fileName: uploadedFile.name.replace(/\.[^/.]+$/, '')
    });
  });
}
