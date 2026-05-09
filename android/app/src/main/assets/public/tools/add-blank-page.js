(function() {
    const appContainer = document.getElementById('app') || document.querySelector('main') || document.body;
    
    const styleId = 'pdfminty-addblank-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .addblank-tool { color: var(--text); max-width: 800px; margin: 0 auto; padding: 1rem; }
            .addblank-header { text-align: center; margin-bottom: 2rem; }
            .addblank-header h1 { margin-bottom: 0.5rem; }
            .addblank-header p { color: var(--muted); }
            .back-link { display: inline-block; margin-bottom: 1rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
            .back-link:hover { color: var(--accent); }
            
            .workspace { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5rem; }
            
            .file-info { display: flex; align-items: center; justify-content: space-between; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            .file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 1rem; font-weight: 500; }
            .page-count-badge { background: rgba(6, 182, 212, 0.1); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; white-space: nowrap; margin-right: 1rem; }
            .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; transition: transform 0.2s; }
            .remove-btn:hover { transform: scale(1.2); }
            
            .options-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem; }
            @media(min-width: 600px) { .options-grid { grid-template-columns: 1fr 1fr; } }
            
            .option-group { display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
            .option-label { font-weight: 600; font-size: 0.95rem; color: var(--text); margin-bottom: 0.25rem; }
            
            .input-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
            .number-input { width: 70px; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--card); color: var(--text); font-family: inherit; font-size: 1rem; text-align: center; }
            .number-input:focus { outline: none; border-color: var(--accent); }
            
            .select-input { padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--card); color: var(--text); font-family: inherit; font-size: 1rem; cursor: pointer; }
            .select-input:focus { outline: none; border-color: var(--accent); }
            
            .shortcuts { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
            .btn-shortcut { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
            .btn-shortcut:hover { background: rgba(255,255,255,0.1); border-color: var(--accent); }
            
            .radio-group { display: flex; flex-direction: column; gap: 0.5rem; }
            .radio-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem; }
            .radio-item input[type="radio"] { accent-color: var(--primary); width: 1.1rem; height: 1.1rem; cursor: pointer; }
            
            .actions { display: flex; justify-content: center; margin-top: 1rem; }
            .btn-apply { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-apply:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-apply:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            
            .hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    appContainer.innerHTML = `
        <div class="addblank-tool">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            
            <div class="addblank-header">
                <h1>Add Blank Page</h1>
                <p>Insert blank pages anywhere in your PDF</p>
            </div>

            <div id="addblank-drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="addblank-file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop a PDF here, or click to select</p>
            </div>

            <div id="addblank-workspace" class="workspace hidden">
                <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left;">
                    <img id="file-preview-img" alt="PDF Preview" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
                        <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0;"></span>
                        <span id="file-size-display" class="file-size-badge" style="width: fit-content;"></span>
                    </div>
                    <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; transition: all 0.2s;">✕</button>
                </div>

                <div class="options-grid">
                    <div class="option-group">
                        <span class="option-label">Insert Position</span>
                        
                        <div class="input-row" style="margin-bottom: 0.75rem;">
                            <span>Insert</span>
                            <input type="number" id="blank-count" class="number-input" value="1" min="1" max="10">
                            <span>blank page(s)</span>
                        </div>
                        
                        <div class="input-row">
                            <select id="pos-type" class="select-input">
                                <option value="after" selected>After</option>
                                <option value="before">Before</option>
                            </select>
                            <span>page</span>
                            <input type="number" id="target-page" class="number-input" value="1" min="1">
                        </div>
                        
                        <div class="shortcuts">
                            <button type="button" id="btn-beginning" class="btn-shortcut">Beginning</button>
                            <button type="button" id="btn-end" class="btn-shortcut">End</button>
                        </div>
                    </div>

                    <div class="option-group">
                        <span class="option-label">Page Size</span>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" name="page-size" value="same" checked> Same as document
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="page-size" value="a4"> A4 (210×297mm)
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="page-size" value="letter"> Letter (216×279mm)
                            </label>
                        </div>
                    </div>
                </div>

                <div class="actions">
                    <button id="apply-btn" class="btn-apply">➕ Add Blank Page</button>
                </div>
            </div>
        </div>
    `;

    let originalPdfBytes = null;
    let currentFileName = "";
    let totalPages = 0;

    const dropZone = document.getElementById('addblank-drop-zone');
    const fileInput = document.getElementById('addblank-file-input');
    const workspace = document.getElementById('addblank-workspace');
    const fileNameDisplay = document.getElementById('file-name-display');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const applyBtn = document.getElementById('apply-btn');
    
    const countInput = document.getElementById('blank-count');
    const posTypeSelect = document.getElementById('pos-type');
    const targetPageInput = document.getElementById('target-page');
    const btnBeginning = document.getElementById('btn-beginning');
    const btnEnd = document.getElementById('btn-end');

    if (typeof initDropZone === 'function') {
        initDropZone('addblank-drop-zone', 'addblank-file-input', handleFiles, '.pdf');
    } else {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    }

    removeFileBtn.addEventListener('click', () => {
        originalPdfBytes = null;
        currentFileName = "";
        totalPages = 0;
        fileInput.value = '';
        workspace.classList.add('hidden');
        dropZone.classList.remove('hidden');
    });

    btnBeginning.addEventListener('click', () => {
        posTypeSelect.value = 'before';
        targetPageInput.value = 1;
    });

    btnEnd.addEventListener('click', () => {
        posTypeSelect.value = 'after';
        targetPageInput.value = totalPages;
    });

    async function handleFiles(files) {
        if (!files || files.length === 0) return;
        const file = files[0];
        
        
        
        if (typeof window.validateFile === 'function') {
            for (const f of files) {
                const check = window.validateFile(f);
                if (!check.valid) {
                    if (typeof window.showError === 'function') window.showError(check.reason);
                    return;
                }
            }
        }
        

        try {
            if (typeof showProgress === 'function') showProgress(30);
            originalPdfBytes = await file.arrayBuffer();
            currentFileName = file.name.replace(/\.[^/.]+$/, "");
            
            const tempDoc = await PDFLib.PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });
            totalPages = tempDoc.getPageCount();
            
            fileNameDisplay.textContent = file.name;
            if (typeof formatBytes === 'function' && typeof fileSizeDisplay !== 'undefined' && fileSizeDisplay) fileSizeDisplay.textContent = formatBytes(file.size);
            
            if (typeof renderPdfThumbnail === 'function') {
                const imgEl = document.getElementById('file-preview-img');
                if (imgEl) renderPdfThumbnail(file, imgEl);
            }
            
            dropZone.classList.add('hidden');
            workspace.classList.remove('hidden');
            
            if (typeof hideProgress === 'function') hideProgress();
        } catch (err) {
            console.error(err);
            if (typeof showError === 'function') showError('Error loading PDF: ' + err.message);
            if (typeof hideProgress === 'function') hideProgress();
        }
    }

    applyBtn.addEventListener('click', async () => {
        if (!originalPdfBytes) return;

        const count = parseInt(countInput.value, 10);
        const targetPage = parseInt(targetPageInput.value, 10);
        const posType = posTypeSelect.value;
        const sizeType = document.querySelector('input[name="page-size"]:checked').value;

        if (isNaN(count) || count < 1 || count > 10) {
            if (typeof showError === 'function') showError("Please enter a valid number of pages to insert (1-10).");
            return;
        }

        if (isNaN(targetPage) || targetPage < 1 || targetPage > totalPages) {
            if (typeof showError === 'function') showError(`Please enter a valid target page (1-${totalPages}).`);
            return;
        }

        try {
            applyBtn.disabled = true;
            applyBtn.textContent = "Processing...";
            if (typeof showProgress === 'function') showProgress(20);

            const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
            
            if (typeof showProgress === 'function') showProgress(40);

            let insertIndex = posType === 'before' ? targetPage - 1 : targetPage;
            
            let dims = [595.28, 841.89]; // Default A4
            
            if (sizeType === 'same') {
                const refPageIdx = Math.min(Math.max(0, insertIndex > 0 ? insertIndex - 1 : 0), totalPages - 1);
                const refPage = pdfDoc.getPage(refPageIdx);
                const { width, height } = refPage.getSize();
                dims = [width, height];
            } else if (sizeType === 'a4') {
                dims = [595.28, 841.89];
            } else if (sizeType === 'letter') {
                dims = [612.00, 792.00];
            }

            for (let i = 0; i < count; i++) {
                pdfDoc.insertPage(insertIndex + i, dims);
            }

            if (typeof showProgress === 'function') showProgress(80);
            
            const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

            if (typeof showProgress === 'function') showProgress(100);

            if (typeof downloadFile === 'function') {
                downloadFile(modifiedPdfBytes, `${currentFileName}-with-blank.pdf`);
                originalPdfBytes = null; // GC Hint
            }

            if (typeof showSuccess === 'function') {
                showSuccess(`Successfully inserted ${count} blank page(s)!`);
            }

        } catch (error) {
            console.error('Add Blank Page Error:', error);
            if (typeof showError === 'function') {
                showError(error.message || "Error adding blank pages to PDF.");
            }
        } finally {
            if (typeof hideProgress === 'function') hideProgress();
            applyBtn.disabled = false;
            applyBtn.textContent = "➕ Add Blank Page";
            
            totalPages += count;
            pageCountDisplay.textContent = `Total pages: ${totalPages}`;
            targetPageInput.max = totalPages;
        }
    });
})();
