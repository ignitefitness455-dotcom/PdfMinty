/**
 * src/tools/add-blank-page/ui.js
 */
import { createDropZone } from '../../ui/components/DropZone.js';
import { renderPdfThumbnail, formatBytes } from '../../utils/fileUtils.js';

export function createUI(container, { locale = 'en', onProcess, onCancel }) {
  container.innerHTML = `
    <div class="tool-container">
      <a class="back-link" href="/">← Back</a>
      <div class="tool-header">
        <h1>Add Blank Page</h1>
        <p>Insert new, empty pages at specific locations in your PDF document</p>
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

        <div class="options-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          <div class="option-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <span class="option-label" style="font-weight: 600; font-size: 0.95rem; color: var(--text); margin-bottom: 0.25rem;">Insert Position</span>
            
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span>Insert</span>
              <input type="number" id="blank-count" class="text-input" style="width: 70px; text-align: center; height: 38px; padding: 0.25rem;" value="1" min="1" max="10">
              <span>blank page(s)</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
              <select id="pos-type" class="select-input" style="height: 38px; padding: 0.25rem; width: 100px;">
                <option value="after" selected>After</option>
                <option value="before">Before</option>
              </select>
              <span>page</span>
              <input type="number" id="target-page" class="text-input" style="width: 70px; text-align: center; height: 38px; padding: 0.25rem;" value="1" min="1">
            </div>
            
            <div class="shortcuts" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              <button type="button" id="btn-beginning" class="btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;">Beginning</button>
              <button type="button" id="btn-end" class="btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;">End</button>
            </div>
          </div>

          <div class="option-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <span class="option-label" style="font-weight: 600; font-size: 0.95rem; color: var(--text); margin-bottom: 0.25rem;">Page Size</span>
            <div class="radio-group" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem;">
                <input type="radio" name="page-size" value="same" style="accent-color: var(--primary); cursor: pointer;" checked> Same as document
              </label>
              <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem;">
                <input type="radio" name="page-size" value="a4" style="accent-color: var(--primary); cursor: pointer;"> A4 (210×297mm)
              </label>
              <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem;">
                <input type="radio" name="page-size" value="letter" style="accent-color: var(--primary); cursor: pointer;"> Letter (216×279mm)
              </label>
            </div>
          </div>
        </div>

        <div class="actions" style="display: flex; justify-content: center; margin-top: 2rem;">
          <button id="btn-apply" class="btn-action">➕ Add Blank Page</button>
        </div>
      </div>
    </div>
  `;

  let uploadedFile = null;
  let fileBytes = null;
  const workspace = container.querySelector('#workspace');
  const dropZoneContainer = container.querySelector('#dropzone-container');

  const insertCount = container.querySelector('#blank-count');
  const posTypeSel = container.querySelector('#pos-type');
  const targetPageInput = container.querySelector('#target-page');

  container.querySelector('#btn-beginning').addEventListener('click', () => {
    posTypeSel.value = 'before';
    targetPageInput.value = 1;
  });

  container.querySelector('#btn-end').addEventListener('click', () => {
    posTypeSel.value = 'after';
    targetPageInput.value = 999999;
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
    const count = parseInt(insertCount.value, 10);
    const targetPage = parseInt(targetPageInput.value, 10);
    const posType = posTypeSel.value;
    const sizeType = container.querySelector('input[name="page-size"]:checked').value;

    if (isNaN(count) || count < 1 || count > 10) {
      alert('Please enter a valid page count (1 to 10).');
      return;
    }

    onProcess(fileBytes, {
      count,
      targetPage,
      posType,
      sizeType,
      fileName: uploadedFile.name.replace(/\.[^/.]+$/, '')
    });
  });
}
