import { getPdfBytes, processPdfTask } from '../../tools/shared.js';
import { FileHandler } from './fileHandler.js';
import { db } from '../core/Database.js';
import { UI } from '../ui/UIManager.js';
import { renderPdfThumbnail, formatBytes } from './fileUtils.js';

export const singleFilePreviewHtml = `
    <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05);">
        <img id="file-preview-img" loading="lazy" alt="PDF Preview" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
            <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></span>
            <div style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem;">
                <span id="page-count-display" class="page-count-badge" style="display: none; background: rgba(6, 182, 212, 0.1); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; white-space: nowrap;"></span>
                <span id="file-size-display" class="file-size-badge" style="width: fit-content; font-size: 0.875rem; color: var(--muted);"></span>
            </div>
        </div>
        <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; transition: all 0.2s;">✕</button>
    </div>
`;

export function renderToolBase({
  title,
  description,
  icon,
  dropText,
  extraWorkspaceHtml,
  actionText,
  instructions,
}) {
  const instructionsHtml = (instructions && instructions.length > 0) ? `
            <div class="instructions-section" style="margin-top: 3rem; background: var(--bg); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.25rem;">How to use this tool</h3>
                <ol style="margin: 0; padding-left: 1.5rem; color: var(--muted); line-height: 1.6;">
                    ${instructions.map(inst => `<li style="margin-bottom: 0.5rem;">${inst}</li>`).join('')}
                </ol>
            </div>
  ` : '';

  return `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="/">← Back</a>
            <div class="tool-header">
                <h1>${title}</h1>
                <p>${description}</p>
            </div>
            <label id="drop-zone" tabindex="0" role="button" aria-label="File upload zone: ${dropText || 'Drag & drop a PDF here, or click to select'}" style="display: block; border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" aria-hidden="true" tabindex="-1" accept=".pdf" style="display: none;" ${title.includes('Merge') ? 'multiple' : ''} />
                <div class="tool-hero-icon" style="font-size: 3.5rem; margin-bottom: 1rem; color: var(--primary); filter: drop-shadow(0 4px 10px rgba(99, 102, 241, 0.3));" aria-hidden="true">${icon}</div>
                <p style="font-size: 1.25rem; margin: 0; font-weight: 500;">${dropText || 'Drag & drop a PDF here, or click to select'}</p>
            </label>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                ${extraWorkspaceHtml}
                <div class="actions">
                    <button id="btn-apply" class="btn-action">${actionText}</button>
                </div>
            </div>
            ${instructionsHtml}
        </div>
    `;
}

export function setupToolUI({
  toolId,
  title,
  description,
  icon,
  actionText,
  isMultiFile = false,
  settingsHtml = '',
  instructions = [],
  onInit = null,
  onApply = null,
}) {
  const appContainer =
    document.getElementById('app') || document.querySelector('main') || document.body;

  const styleId = 'pdfminty-common-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
            .tool-container { color: var(--text); max-width: 800px; margin: 0 auto; padding: 1rem; }
            .tool-header { text-align: center; margin-bottom: 2rem; }
            .tool-header h1 { margin-bottom: 0.5rem; }
            .tool-header p { color: var(--muted); }
            .back-link { display: inline-block; margin-bottom: 1rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
            .back-link:hover { color: var(--accent); }
            .workspace { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5rem; }
            .file-info { display: flex; align-items: center; justify-content: space-between; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            .file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 1rem; font-weight: 500; }
            .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; transition: transform 0.2s; }
            .remove-btn:hover { transform: scale(1.2); }
            
            /* File List (multi file) */
            .file-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
            .file-item { position: relative; background: var(--bg); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; }
            .file-item img { max-width: 100%; max-height: 100%; object-fit: contain; }
            .file-name-badge { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; font-size: 0.75rem; text-align: center; padding: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .file-item .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); border: none; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: background 0.2s; z-index: 10; }
            .file-item .remove-btn:hover { background: var(--danger); }

            /* Settings */
            .settings-panel { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            @media (max-width: 600px) { .settings-panel { grid-template-columns: 1fr; } }
            .setting-group { display: flex; flex-direction: column; gap: 0.5rem; }
            .setting-group.full-width { grid-column: 1 / -1; }
            .input-label { font-weight: 500; font-size: 0.95rem; color: var(--text); display: flex; justify-content: space-between; }
            .text-input, .select-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem; cursor: pointer; }
            .text-input:focus, .select-input:focus { outline: none; border-color: var(--accent); }
            .range-input { width: 100%; cursor: pointer; accent-color: var(--accent); height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; outline: none; -webkit-appearance: none; margin-top: 0.5rem; }
            .range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: var(--accent); border-radius: 50%; cursor: pointer; }
            .color-picker-wrapper { display: flex; align-items: center; gap: 1rem; background: var(--bg); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
            .color-input { width: 35px; height: 35px; padding: 0; border: none; border-radius: 4px; cursor: pointer; background: transparent; }
            .color-hex { font-family: monospace; font-size: 1rem; color: var(--muted); }
            
            /* Actions */
            .actions { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .btn-secondary { background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .btn-secondary:hover { border-color: var(--accent); }
            .hidden { display: none !important; }
        `;
    document.head.appendChild(style);
  }

  const fileListHtml = isMultiFile
    ? '<p style="margin-bottom: 1rem; color: var(--muted); font-size: 0.9rem;">Files will be processed in the order shown below.</p><div id="file-list" class="file-list"></div><div class="actions" style="margin-top:0.5rem; margin-bottom: 1.5rem;"><button id="btn-add-more" class="btn-secondary">➕ Add More</button></div>'
    : singleFilePreviewHtml;

  appContainer.innerHTML = renderToolBase({
    title,
    description,
    icon,
    actionText,
    extraWorkspaceHtml: fileListHtml + (settingsHtml || ''),
    instructions,
  });

  let originalPdfBytes = null;
  let currentFileName = '';
  let filesArray = [];

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const workspace = document.getElementById('workspace');

  if (onInit) {
    onInit();
  }

  const isImageTool = window.location.pathname.includes('image-to-pdf') || toolId === 'image_to_pdf';
  FileHandler.initDropZone(
    'drop-zone',
    'file-input',
    handleFiles,
    isImageTool ? 'image/*,.pdf' : '.pdf',
  );

  if (isMultiFile) {
    document.getElementById('btn-add-more')?.addEventListener('click', () => fileInput.click());
  }
  async function handleFiles(files) {
    if (!files || files.length === 0) return;

    for (const f of files) {
      const check = FileHandler.validateFile(f);
      if (!check.valid) {
        UI.showError(check.reason);
        return;
      }
    }

    if (!isMultiFile) {
      const file = files[0];
      try {
        UI.showProgress(50);
        const ab = await FileHandler.readFileAsArrayBuffer(file);
        
        let savedToDb = false;
        try {
          await db.saveFile(toolId + '_target', ab);
          originalPdfBytes = toolId + '_target';
          savedToDb = true;
        } catch(e) {
          console.warn('IDB save failed, falling back to memory', e);
        }
        if (!savedToDb) {
          originalPdfBytes = ab;
        }
        
        currentFileName = file.name.replace(/\.[^/.]+$/, '');

        const fileNameDisplay = document.getElementById('file-name-display');
        if (fileNameDisplay) fileNameDisplay.textContent = file.name;

        const fileSizeDisplay = document.getElementById('file-size-display');
        if (fileSizeDisplay) {
          fileSizeDisplay.textContent = formatBytes(file.size);
        }

        const imgEl = document.getElementById('file-preview-img');
        if (imgEl && file.type === 'application/pdf') {
          renderPdfThumbnail(file, imgEl);
        }

        dropZone.classList.add('hidden');
        workspace.classList.remove('hidden');
      } catch (err) {
        console.error('File handler error:', err);
        UI.showError(err.message || 'Failed to read file');
      } finally {
        UI.hideProgress();
      }
    } else {
      const validFiles = Array.from(files);
      
      try {
        const mappedFiles = await Promise.all(
          validFiles.map(async (file) => {
            const id = toolId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const ab = await FileHandler.readFileAsArrayBuffer(file);
            
            let savedToDb = false;
            try {
              await db.saveFile(id, ab);
              savedToDb = true;
            } catch(e) {
              console.warn('IDB multi-save failed', e);
            }
            
            if (!savedToDb) {
              return { name: file.name, id: null, fileObj: file };
            }
            return { name: file.name, id, fileObj: file };
          })
        );
        
        filesArray = filesArray.concat(mappedFiles);
        renderFileList();
        
        dropZone.classList.add('hidden');
        workspace.classList.remove('hidden');
      } catch (err) {
        console.error('Error processing files', err);
        UI.showError('Failed to process files: ' + err.message);
        return;
      }
    }
  }

  function renderFileList() {
    if (!isMultiFile) return;
    const fileListEl = document.getElementById('file-list');
    if (!fileListEl) return;
    fileListEl.innerHTML = '';
    filesArray.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';

      if (file.fileObj.type.startsWith('image/')) {
        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => (img.src = e.target.result);
        reader.readAsDataURL(file.fileObj);
        item.appendChild(img);
      } else {
        const img = document.createElement('img');
        renderPdfThumbnail(file.fileObj, img);
        item.appendChild(img);
      }

      const btn = document.createElement('button');
      btn.className = 'remove-btn';
      btn.innerHTML = '✕';
      btn.dataset.index = index;

      const nameBadge = document.createElement('div');
      nameBadge.className = 'file-name-badge';
      nameBadge.textContent = file.name;

      item.appendChild(nameBadge);
      item.appendChild(btn);
      fileListEl.appendChild(item);
    });

    document.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const removed = filesArray.splice(idx, 1)[0];
        if (removed.id) {
          db.deleteFile(removed.id).catch(console.error);
        }
        renderFileList();
        if (filesArray.length === 0) {
          workspace.classList.add('hidden');
          dropZone.classList.remove('hidden');
        }
      });
    });
  }

  const removeFileBtn = document.getElementById('remove-file-btn');
  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', () => {
      originalPdfBytes = null;
      currentFileName = '';
      if (fileInput) fileInput.value = '';
      workspace.classList.add('hidden');
      dropZone.classList.remove('hidden');
    });
  }

  const btnApply = document.getElementById('btn-apply');
  if (btnApply && onApply) {
    btnApply.addEventListener('click', () => {
      processPdfTask(btnApply, async () => {
        let actualBytes;
        if (!isMultiFile && originalPdfBytes) {
          actualBytes = await getPdfBytes(originalPdfBytes);
        }
        await onApply({
          actualBytes,
          currentFileName,
          filesArray,
        });
      });
    });
  }
}
