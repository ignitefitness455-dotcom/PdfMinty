import { getPdfBytes, processPdfTask } from '../tools/shared.js';
import { singleFilePreviewHtml, renderToolBase } from '../shared-ui.js';

export function setupToolUI({
    toolId,
    title,
    description,
    icon,
    actionText,
    isMultiFile = false,
    settingsHtml = '',
    onInit = null,
    onApply = null
}) {
    const appContainer = document.getElementById('app') || document.querySelector('main') || document.body;
    
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
        extraWorkspaceHtml: fileListHtml + (settingsHtml || '')
    });

    let originalPdfBytes = null;
    let currentFileName = "";
    let filesArray = []; 

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const workspace = document.getElementById('workspace');

    // Default init behavior
    if (onInit) {
        onInit();
    }

    // Default dropzone logic
    if (typeof window.initDropZone === 'function') {
        window.initDropZone('drop-zone', 'file-input', handleFiles, isMultiFile ? 'image/*,.pdf' : '.pdf');
    } else {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    }

    if (isMultiFile) {
        document.getElementById('btn-add-more')?.addEventListener('click', () => fileInput.click());
    }

    async function handleFiles(files) {
        if (!files || files.length === 0) return;
        
        if (typeof window.validateFile === 'function') {
            for (const f of files) {
                const check = window.validateFile(f);
                if (!check.valid) {
                    if (typeof window.showError === 'function') window.showError(check.reason);
                    return;
                }
            }
        }
        
        if (!isMultiFile) {
            const file = files[0];
            try {
                if (typeof window.showProgress === 'function') window.showProgress(50);
                const ab = await file.arrayBuffer();
                if (window.pdfDB) {
                    await window.pdfDB.saveFile(toolId + '_target', ab);
                    originalPdfBytes = toolId + '_target';
                } else {
                    originalPdfBytes = ab;
                }
                currentFileName = file.name.replace(/\\.[^/.]+$/, "");
                
                const fileNameDisplay = document.getElementById('file-name-display');
                if(fileNameDisplay) fileNameDisplay.textContent = file.name;
                
                const fileSizeDisplay = document.getElementById('file-size-display');
                if (typeof formatBytes === 'function' && fileSizeDisplay) fileSizeDisplay.textContent = formatBytes(file.size);
                
                if (typeof window.renderPdfThumbnail === 'function') {
                    const imgEl = document.getElementById('file-preview-img');
                    if (imgEl && file.type === 'application/pdf') window.renderPdfThumbnail(file, imgEl);
                }
                
                dropZone.classList.add('hidden');
                workspace.classList.remove('hidden');
            } catch(err) {
                console.error(err);
                if (typeof window.showError === 'function') window.showError(err.message);
            } finally {
                if (typeof window.hideProgress === 'function') window.hideProgress();
            }
        } else {
            // Multi-file logic
            const validFiles = Array.from(files);
            if (window.pdfDB) {
                Promise.all(validFiles.map(async (file) => {
                    const id = toolId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    const ab = await file.arrayBuffer();
                    await window.pdfDB.saveFile(id, ab);
                    return { name: file.name, id, fileObj: file };
                })).then(mapped => {
                    filesArray = filesArray.concat(mapped);
                    renderFileList();
                });
            } else {
                filesArray = filesArray.concat(validFiles.map(f => ({ name: f.name, fileObj: f })));
                renderFileList();
            }
            dropZone.classList.add('hidden');
            workspace.classList.remove('hidden');
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
                reader.onload = (e) => img.src = e.target.result;
                reader.readAsDataURL(file.fileObj);
                item.appendChild(img);
            } else {
                const img = document.createElement('img');
                if (typeof window.renderPdfThumbnail === 'function') {
                    window.renderPdfThumbnail(file.fileObj, img);
                }
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

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const removed = filesArray.splice(idx, 1)[0];
                if (window.pdfDB && removed.id) window.pdfDB.deleteFile(removed.id);
                renderFileList();
                if (filesArray.length === 0) {
                    workspace.classList.add('hidden');
                    dropZone.classList.remove('hidden');
                }
            });
        });
    }

    const removeFileBtn = document.getElementById('remove-file-btn');
    if(removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            originalPdfBytes = null;
            currentFileName = "";
            fileInput.value = '';
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
                    filesArray // For multi file
                });
            });
        });
    }
}
