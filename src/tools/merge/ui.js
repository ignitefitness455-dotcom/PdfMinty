/**
 * src/tools/merge/ui.js
 */
import { createDropZone } from '../../ui/components/DropZone.js';
import { renderPdfThumbnail, formatBytes } from '../../utils/fileUtils.js';
import { db } from '../../core/Database.js';

export function createUI(container, { locale = 'en', onProcess, onCancel }) {
  container.innerHTML = `
    <div class="tool-container">
      <a class="back-link" href="/">← Back</a>
      <div class="tool-header">
        <h1>Merge PDF</h1>
        <p>Combine multiple PDF files into one in perfect order</p>
      </div>

      <div id="dropzone-container"></div>

      <div id="workspace" class="workspace hidden">
        <p style="margin-bottom: 1rem; color: var(--muted); font-size: 0.9rem;">
          Drag and drop to reorder files. They will be merged in the order shown.
        </p>
        <div id="file-list" class="file-list"></div>
        <div class="actions" style="margin-top: 1rem; margin-bottom: 1.5rem; justify-content: center; display: flex; gap: 1rem;">
          <button id="btn-add-more" class="btn-secondary">➕ Add More</button>
        </div>
        <div class="actions" style="display: flex; justify-content: center; margin-top: 2rem;">
          <button id="btn-apply" class="btn-action">🔗 Merge PDFs</button>
        </div>
      </div>
    </div>
  `;

  let filesArray = [];
  const workspace = container.querySelector('#workspace');
  const fileListEl = container.querySelector('#file-list');

  const dropZoneContainer = container.querySelector('#dropzone-container');
  const dropZone = createDropZone(dropZoneContainer, {
    accept: '.pdf',
    multiple: true,
    onDrop: handleNewFiles
  });

  const addMoreInput = document.createElement('input');
  addMoreInput.type = 'file';
  addMoreInput.accept = '.pdf';
  addMoreInput.multiple = true;
  addMoreInput.style.display = 'none';
  container.appendChild(addMoreInput);

  container.querySelector('#btn-add-more').addEventListener('click', () => {
    addMoreInput.click();
  });

  addMoreInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleNewFiles(Array.from(e.target.files));
    }
  });

  async function handleNewFiles(files) {
    if (!files || files.length === 0) return;

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const id = 'merge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        let savedToDb = false;
        try {
          await db.saveFile(id, arrayBuffer);
          savedToDb = true;
        } catch (e) {
          console.warn('DB save failed for multi-file, using memory fallback', e);
        }

        filesArray.push({
          id: savedToDb ? id : null,
          name: file.name,
          size: file.size,
          fileObj: file,
          bytes: new Uint8Array(arrayBuffer)
        });
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }

    renderFileList();
    if (filesArray.length > 0) {
      dropZone.element.classList.add('hidden');
      workspace.classList.remove('hidden');
    }
  }

  function renderFileList() {
    fileListEl.innerHTML = '';
    filesArray.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.draggable = true;
      item.style.cursor = 'grab';

      const img = document.createElement('img');
      renderPdfThumbnail(file.fileObj, img);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '✕';
      removeBtn.dataset.index = index;

      const nameBadge = document.createElement('div');
      nameBadge.className = 'file-name-badge';
      nameBadge.textContent = file.name;

      item.appendChild(img);
      item.appendChild(nameBadge);
      item.appendChild(removeBtn);
      fileListEl.appendChild(item);

      // Reordering via HTML5 drag-and-drop
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', index);
        item.style.opacity = '0.5';
      });

      item.addEventListener('dragend', () => {
        item.style.opacity = '1';
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = index;

        if (fromIndex !== toIndex) {
          const moved = filesArray.splice(fromIndex, 1)[0];
          filesArray.splice(toIndex, 0, moved);
          renderFileList();
        }
      });
    });

    fileListEl.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const removed = filesArray.splice(idx, 1)[0];
        if (removed.id) {
          db.deleteFile(removed.id).catch(console.error);
        }
        renderFileList();
        if (filesArray.length === 0) {
          workspace.classList.add('hidden');
          dropZone.element.classList.remove('hidden');
        }
      });
    });
  }

  container.querySelector('#btn-apply').addEventListener('click', () => {
    if (filesArray.length < 2) {
      alert('Please add at least 2 PDFs to merge.');
      return;
    }
    const byteArrays = filesArray.map(f => f.bytes);
    onProcess(byteArrays, {});
  });
}
