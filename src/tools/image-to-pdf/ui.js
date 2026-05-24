/**
 * src/tools/image-to-pdf/ui.js
 */
import { createDropZone } from '../../ui/components/DropZone.js';
import { db } from '../../core/Database.js';

export function createUI(container, { locale = 'en', onProcess, onCancel }) {
  container.innerHTML = `
    <div class="tool-container">
      <a class="back-link" href="/">← Back</a>
      <div class="tool-header">
        <h1>Image to PDF</h1>
        <p>Convert your images (JPG, PNG, WebP) into a high quality PDF</p>
      </div>

      <div id="dropzone-container"></div>

      <div id="workspace" class="workspace hidden">
        <p style="margin-bottom: 1rem; color: var(--muted); font-size: 0.9rem;">
          Images will be embedded into the PDF in the order shown.
        </p>
        <div id="file-list" class="file-list"></div>
        <div class="actions" style="margin-top: 1rem; margin-bottom: 1.5rem; justify-content: center; display: flex; gap: 1rem;">
          <button id="btn-add-more" class="btn-secondary">➕ Add More</button>
        </div>
        <div class="actions" style="display: flex; justify-content: center; margin-top: 2rem;">
          <button id="btn-apply" class="btn-action">🖼️ Convert to PDF</button>
        </div>
      </div>
    </div>
  `;

  let filesArray = [];
  const workspace = container.querySelector('#workspace');
  const fileListEl = container.querySelector('#file-list');

  const dropZoneContainer = container.querySelector('#dropzone-container');
  const dropZone = createDropZone(dropZoneContainer, {
    accept: 'image/jpeg,image/png,image/webp',
    multiple: true,
    onDrop: handleNewFiles
  });

  const addMoreInput = document.createElement('input');
  addMoreInput.type = 'file';
  addMoreInput.accept = 'image/jpeg,image/png,image/webp';
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
      filesArray.push({
        name: file.name,
        size: file.size,
        fileObj: file
      });
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

      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file.fileObj);

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
    });

    fileListEl.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        filesArray.splice(idx, 1);
        renderFileList();
        if (filesArray.length === 0) {
          workspace.classList.add('hidden');
          dropZone.element.classList.remove('hidden');
        }
      });
    });
  }

  container.querySelector('#btn-apply').addEventListener('click', () => {
    if (filesArray.length === 0) {
      alert('Please add at least 1 image.');
      return;
    }
    const fileObjs = filesArray.map(f => f.fileObj);
    onProcess(fileObjs, {});
  });
}
