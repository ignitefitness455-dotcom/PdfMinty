/**
 * src/tools/delete-pages/ui.js
 */
import { createDropZone } from '../../ui/components/DropZone.js';
import { renderPdfThumbnail, formatBytes } from '../../utils/fileUtils.js';

export function createUI(container, { locale = 'en', onProcess, onCancel }) {
  container.innerHTML = `
    <div class="tool-container">
      <a class="back-link" href="/">← Back</a>
      <div class="tool-header">
        <h1>Delete Pages</h1>
        <p>Remove unwanted pages from your PDF document</p>
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

        <div class="settings-panel" style="grid-template-columns: 1fr; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;">
          <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
            <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Pages to Delete</label>
            <input type="text" id="delete-ranges" class="text-input" placeholder="e.g. 1-3, 5, 8">
            <p style="font-size: 0.85rem; color: var(--muted); margin-top: 0.5rem;">Enter the page numbers or ranges to exclude (e.g. 1, 3-5).</p>
          </div>
        </div>

        <div class="actions" style="display: flex; justify-content: center; margin-top: 2rem;">
          <button id="btn-apply" class="btn-action">🗑️ Delete Pages</button>
        </div>
      </div>
    </div>
  `;

  let uploadedFile = null;
  let fileBytes = null;
  const workspace = container.querySelector('#workspace');
  const dropZoneContainer = container.querySelector('#dropzone-container');

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
    const rangesText = container.querySelector('#delete-ranges').value.trim();
    if (!rangesText) {
      alert('Please enter pages or ranges to delete.');
      return;
    }

    onProcess(fileBytes, {
      rangesText,
      fileName: uploadedFile.name.replace(/\.[^/.]+$/, '')
    });
  });
}
