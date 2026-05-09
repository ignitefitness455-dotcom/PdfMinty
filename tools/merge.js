import { PDFDocument } from 'pdf-lib';
(function() {
    const appContainer = document.getElementById('app') || document.querySelector('main') || document.body;
    const styleId = 'pdfminty-merge-styles';
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
            .file-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
            .file-item { position: relative; background: var(--bg); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; }
            .file-item img { max-width: 100%; max-height: 100%; object-fit: contain; }
            .file-name-badge { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; font-size: 0.75rem; text-align: center; padding: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); border: none; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: background 0.2s; z-index: 10; }
            .remove-btn:hover { background: var(--danger); }
            .actions { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .btn-secondary { background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .btn-secondary:hover { border-color: var(--accent); }
            .hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    appContainer.innerHTML = `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Merge PDF</h1>
                <p>Combine multiple PDFs into a single document</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" multiple style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔗</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop PDFs here, or click to select</p>
            </div>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                <p style="margin-bottom: 1rem; color: var(--muted); font-size: 0.9rem;">Files will be merged in the order shown below.</p>
                <div id="file-list" class="file-list grid"></div>
                <div class="actions">
                    <button id="btn-add-more" class="btn-secondary">➕ Add More</button>
                    <button id="btn-apply" class="btn-action">🔗 Merge PDFs</button>
                </div>
            </div>
        </div>
    `;

    let filesArray = [];
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const workspace = document.getElementById('workspace');
    const fileListEl = document.getElementById('file-list');
    const btnAddMore = document.getElementById('btn-add-more');
    const btnApply = document.getElementById('btn-apply');

    if (typeof initDropZone === 'function') {
        initDropZone('drop-zone', 'file-input', handleFiles, '.pdf');
    } else {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    }

    btnAddMore.addEventListener('click', () => fileInput.click());

    function handleFiles(files) {
        if (!files || files.length === 0) return;
        
        const validFiles = Array.from(files);
        
        if (typeof window.validateFile === 'function') {
            for (const f of files) {
                const check = window.validateFile(f);
                if (!check.valid) {
                    if (typeof window.showError === 'function') window.showError(check.reason);
                    return;
                }
            }
        }
        
    

        // Store to IDB to save memory
        if (window.pdfDB) {
            Promise.all(validFiles.map(async (file) => {
                const id = 'merge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const ab = await file.arrayBuffer();
                await window.pdfDB.saveFile(id, ab);
                return { name: file.name, id, fileObj: file }; // Keep fileObj for thumbnail
            })).then(mapped => {
                filesArray = filesArray.concat(mapped);
                renderFileList();
            });
        } else {
            filesArray = filesArray.concat(validFiles.map(f => ({ name: f.name, fileObj: f })));
            renderFileList();
        }
        renderFileList();
        
        dropZone.classList.add('hidden');
        workspace.classList.remove('hidden');
    }

    function renderFileList() {
        fileListEl.innerHTML = '';
        filesArray.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'file-item';
            
            const img = document.createElement('img');
            if (typeof renderPdfThumbnail === 'function') {
                renderPdfThumbnail(file.fileObj, img);
            }
            
            const btn = document.createElement('button');
            btn.className = 'remove-btn';
            btn.innerHTML = '✕';
            btn.dataset.index = index;
            
            const nameBadge = document.createElement('div');
            nameBadge.className = 'file-name-badge';
            nameBadge.textContent = file.name;
            
            item.appendChild(img);
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

    btnApply.addEventListener('click', async () => {
            if (!btnApply.hasAttribute('data-original-text')) {
                btnApply.setAttribute('data-original-text', btnApply.textContent);
            }
            btnApply.disabled = true;
            btnApply.textContent = "Processing...";
            if (typeof window.showProgress === 'function') window.showProgress(10);
            
            try {
                
        if (filesArray.length < 2) {
            if (typeof showError === 'function') showError("Please add at least 2 PDFs to merge.");
            return;
        }

        try {
            
            
            

            let mergedPdfBytes;
            if (typeof window.runPdfWorkerTask === 'function') {
                const payload = { files: [] };
                for (let i = 0; i < filesArray.length; i++) {
                    let ab;
                    if (filesArray[i].id && window.pdfDB) {
                        try {
                            ab = await window.pdfDB.getFile(filesArray[i].id);
                        } catch(err) { console.error(err); }
                    }
                    if (!ab) ab = await filesArray[i].fileObj.arrayBuffer();
                    payload.files.push(new Uint8Array(ab));
                }
                const transferables = payload.files.map(arr => arr.buffer);
                
                mergedPdfBytes = await window.runPdfWorkerTask('merge', payload, transferables, (progress) => {
                    
                });
            } else {
                const mergedPdf = await PDFDocument.create();
                for (let i = 0; i < filesArray.length; i++) {
                    let fileBytes;
                    if (filesArray[i].id && window.pdfDB) {
                        try { fileBytes = await window.pdfDB.getFile(filesArray[i].id); } catch(err) { console.error(err); }
                    }
                    if (!fileBytes) fileBytes = await filesArray[i].fileObj.arrayBuffer();
                    let pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    for (let j = 0; j < copiedPages.length; j++) {
                        mergedPdf.addPage(copiedPages[j]);
                        if (j % 50 === 0) await new Promise(r => setTimeout(r, 0));
                    }
                    fileBytes = null;
                    pdf = null;
                    
                }
                mergedPdfBytes = await mergedPdf.save({ useObjectStreams: true });
            }
            

            if (typeof downloadFile === 'function') {
                downloadFile(mergedPdfBytes, 'merged-document.pdf');
            }
            if (typeof showSuccess === 'function') showSuccess('PDFs merged successfully!');
        } catch (error) {
            console.error(error);
            if (typeof showError === 'function') showError("Error merging PDFs: " + error.message);
        } finally {
            
            
            
        }
    
                if (typeof window.showProgress === 'function') window.showProgress(100);
            } catch (err) {
                console.error("PDF Processing Error:", err);
                if (typeof window.hideProgress === 'function') window.hideProgress();
                if (typeof window.showError === 'function') {
                    window.showError(err.message || "An error occurred while processing the PDF.");
                } else {
                    alert("Error: " + (err.message || "An error occurred"));
                }
            } finally {
                btnApply.disabled = false;
                btnApply.textContent = btnApply.getAttribute('data-original-text');
            }
    });
})();
