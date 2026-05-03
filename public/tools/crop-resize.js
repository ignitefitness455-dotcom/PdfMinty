(function() {
    const appContainer = document.getElementById('app') || document.querySelector('main') || document.body;
    
    const styleId = 'pdfminty-cropresize-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .cr-tool { color: var(--text); max-width: 800px; margin: 0 auto; padding: 1rem; }
            .cr-header { text-align: center; margin-bottom: 2rem; }
            .cr-header h1 { margin-bottom: 0.5rem; }
            .cr-header p { color: var(--muted); }
            .back-link { display: inline-block; margin-bottom: 1rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
            .back-link:hover { color: var(--accent); }
            
            .workspace { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5rem; }
            
            .file-info { display: flex; align-items: center; justify-content: space-between; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            .file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 1rem; font-weight: 500; }
            .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; transition: transform 0.2s; }
            .remove-btn:hover { transform: scale(1.2); }
            
            .tabs-nav { display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 1.5rem; }
            .tab-btn { background: none; border: none; color: var(--muted); padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }
            .tab-btn:hover { color: var(--text); }
            .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
            
            .tab-pane { display: none; animation: fadeIn 0.3s ease; }
            .tab-pane.active { display: block; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            
            .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
            .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
            .input-label { font-weight: 500; font-size: 0.9rem; color: var(--muted); }
            .number-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem; }
            .number-input:focus { outline: none; border-color: var(--accent); }
            
            .radio-group { display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem; }
            .radio-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem; }
            .radio-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem; }
            .radio-item input[type="radio"] { accent-color: var(--primary); width: 1.1rem; height: 1.1rem; cursor: pointer; }
            
            .presets { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
            .preset-btn { background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
            .preset-btn:hover { border-color: var(--accent); background: rgba(255,255,255,0.05); }
            
            .actions { display: flex; justify-content: center; margin-top: 2rem; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            
            .hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    appContainer.innerHTML = `
        <div class="cr-tool">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            
            <div class="cr-header">
                <h1>Crop & Resize PDF</h1>
                <p>Adjust margins or change page dimensions</p>
            </div>

            <div id="cr-drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="cr-file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">📐</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop a PDF here, or click to select</p>
            </div>

            <div id="cr-workspace" class="workspace hidden">
                <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left;">
                    <img id="file-preview-img" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
                        <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0;"></span>
                        <span id="file-size-display" class="file-size-badge" style="width: fit-content;"></span>
                    </div>
                    <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; transition: all 0.2s;">✕</button>
                </div>

                <div class="tabs-nav">
                    <button class="tab-btn active" data-target="crop-tab">Crop</button>
                    <button class="tab-btn" data-target="resize-tab">Resize</button>
                </div>

                <!-- CROP TAB -->
                <div id="crop-tab" class="tab-pane active">
                    <div class="input-grid">
                        <div class="input-group">
                            <label class="input-label">Top Margin (mm)</label>
                            <input type="number" id="crop-top" class="number-input" value="0" min="0" step="1">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Right Margin (mm)</label>
                            <input type="number" id="crop-right" class="number-input" value="0" min="0" step="1">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Bottom Margin (mm)</label>
                            <input type="number" id="crop-bottom" class="number-input" value="0" min="0" step="1">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Left Margin (mm)</label>
                            <input type="number" id="crop-left" class="number-input" value="0" min="0" step="1">
                        </div>
                    </div>

                    <div class="radio-group">
                        <div class="radio-title">Apply to</div>
                        <label class="radio-item"><input type="radio" name="crop-pages" value="all" checked> All pages</label>
                        <label class="radio-item"><input type="radio" name="crop-pages" value="first"> Current page only (Page 1)</label>
                    </div>

                    <div class="actions">
                        <button id="btn-do-crop" class="btn-action">✂️ Crop PDF</button>
                    </div>
                </div>

                <!-- RESIZE TAB -->
                <div id="resize-tab" class="tab-pane">
                    <div class="presets">
                        <button type="button" class="preset-btn" data-w="210" data-h="297">A4</button>
                        <button type="button" class="preset-btn" data-w="297" data-h="420">A3</button>
                        <button type="button" class="preset-btn" data-w="215.9" data-h="279.4">Letter</button>
                        <button type="button" class="preset-btn" data-w="215.9" data-h="355.6">Legal</button>
                    </div>

                    <div class="input-grid">
                        <div class="input-group">
                            <label class="input-label">Width (mm)</label>
                            <input type="number" id="resize-w" class="number-input" value="210" min="10" step="0.1">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Height (mm)</label>
                            <input type="number" id="resize-h" class="number-input" value="297" min="10" step="0.1">
                        </div>
                    </div>

                    <div class="radio-group">
                        <div class="radio-title">Content Scaling</div>
                        <label class="radio-item"><input type="radio" name="resize-scale" value="fit" checked> Scale to fit (Maintain aspect ratio)</label>
                        <label class="radio-item"><input type="radio" name="resize-scale" value="stretch"> Stretch to fill</label>
                        <label class="radio-item"><input type="radio" name="resize-scale" value="keep"> Keep original size (Center)</label>
                    </div>

                    <div class="actions">
                        <button id="btn-do-resize" class="btn-action">📐 Resize PDF</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let originalPdfBytes = null;
    let currentFileName = "";
    const MM_TO_PT = 2.835;

    const dropZone = document.getElementById('cr-drop-zone');
    const fileInput = document.getElementById('cr-file-input');
    const workspace = document.getElementById('cr-workspace');
    const fileNameDisplay = document.getElementById('file-name-display');
    const removeFileBtn = document.getElementById('remove-file-btn');
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const presetBtns = document.querySelectorAll('.preset-btn');
    
    const btnCrop = document.getElementById('btn-do-crop');
    const btnResize = document.getElementById('btn-do-resize');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('resize-w').value = btn.dataset.w;
            document.getElementById('resize-h').value = btn.dataset.h;
        });
    });

    if (typeof initDropZone === 'function') {
        initDropZone('cr-drop-zone', 'cr-file-input', handleFiles, '.pdf');
    } else {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    }

    removeFileBtn.addEventListener('click', () => {
        originalPdfBytes = null;
        currentFileName = "";
        fileInput.value = '';
        workspace.classList.add('hidden');
        dropZone.classList.remove('hidden');
    });

    async function handleFiles(files) {
        if (!files || files.length === 0) return;
        const file = files[0];
        
        
        if (typeof window.validateFile === 'function' && !window.validateFile([file])) return;

        try {
            if (typeof showProgress === 'function') showProgress(50);
            originalPdfBytes = await file.arrayBuffer();
            currentFileName = file.name.replace(/\.[^/.]+$/, "");
            
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

    btnCrop.addEventListener('click', async () => {
        if (!originalPdfBytes) return;

        const top = parseFloat(document.getElementById('crop-top').value) || 0;
        const right = parseFloat(document.getElementById('crop-right').value) || 0;
        const bottom = parseFloat(document.getElementById('crop-bottom').value) || 0;
        const left = parseFloat(document.getElementById('crop-left').value) || 0;
        const applyTo = document.querySelector('input[name="crop-pages"]:checked').value;

        try {
            btnCrop.disabled = true;
            btnCrop.textContent = "Cropping...";
            if (typeof showProgress === 'function') showProgress(30);

            const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
            const pages = pdfDoc.getPages();
            const pagesToProcess = applyTo === 'all' ? pages : [pages[0]];

            for (const page of pagesToProcess) {
                const box = page.getCropBox() || page.getMediaBox();
                
                const newX = box.x + (left * MM_TO_PT);
                const newY = box.y + (bottom * MM_TO_PT);
                const newWidth = box.width - ((left + right) * MM_TO_PT);
                const newHeight = box.height - ((top + bottom) * MM_TO_PT);

                if (newWidth <= 0 || newHeight <= 0) {
                    throw new Error("Crop margins are too large for the page dimensions.");
                }

                page.setCropBox(newX, newY, newWidth, newHeight);
            }

            if (typeof showProgress === 'function') showProgress(80);
            const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

            if (typeof showProgress === 'function') showProgress(100);
            if (typeof downloadFile === 'function') {
                downloadFile(modifiedPdfBytes, `${currentFileName}-cropped.pdf`);
                originalPdfBytes = null; // GC Hint
            }
            if (typeof showSuccess === 'function') showSuccess('PDF cropped successfully!');

        } catch (error) {
            console.error('Crop Error:', error);
            if (typeof showError === 'function') showError(error.message || "Error cropping PDF.");
        } finally {
            if (typeof hideProgress === 'function') hideProgress();
            btnCrop.disabled = false;
            btnCrop.textContent = "✂️ Crop PDF";
        }
    });

    btnResize.addEventListener('click', async () => {
        if (!originalPdfBytes) return;

        const targetW_mm = parseFloat(document.getElementById('resize-w').value);
        const targetH_mm = parseFloat(document.getElementById('resize-h').value);
        const scaleMode = document.querySelector('input[name="resize-scale"]:checked').value;

        if (!targetW_mm || !targetH_mm || targetW_mm <= 0 || targetH_mm <= 0) {
            if (typeof showError === 'function') showError("Please enter valid width and height.");
            return;
        }

        const targetW = targetW_mm * MM_TO_PT;
        const targetH = targetH_mm * MM_TO_PT;

        try {
            btnResize.disabled = true;
            btnResize.textContent = "Resizing...";
            if (typeof showProgress === 'function') showProgress(30);

            const srcDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
            const newDoc = await PDFLib.PDFDocument.create();
            
            const srcPages = srcDoc.getPages();
            const embeddedPages = await newDoc.embedPages(srcPages);

            for (let i = 0; i < srcPages.length; i++) {
                const origPage = srcPages[i];
                const embeddedPage = embeddedPages[i];
                const { width: origW, height: origH } = origPage.getSize();
                
                const newPage = newDoc.addPage([targetW, targetH]);
                
                if (scaleMode === 'fit') {
                    const scale = Math.min(targetW / origW, targetH / origH);
                    const drawW = origW * scale;
                    const drawH = origH * scale;
                    const tx = (targetW - drawW) / 2;
                    const ty = (targetH - drawH) / 2;
                    newPage.drawPage(embeddedPage, { x: tx, y: ty, width: drawW, height: drawH });
                } else if (scaleMode === 'stretch') {
                    newPage.drawPage(embeddedPage, { x: 0, y: 0, width: targetW, height: targetH });
                } else if (scaleMode === 'keep') {
                    const tx = (targetW - origW) / 2;
                    const ty = (targetH - origH) / 2;
                    newPage.drawPage(embeddedPage, { x: tx, y: ty, width: origW, height: origH });
                }
                
                if (typeof showProgress === 'function' && i % 5 === 0) {
                    showProgress(30 + ((i / srcPages.length) * 50));
                }
            }

            if (typeof showProgress === 'function') showProgress(85);
            const modifiedPdfBytes = await newDoc.save({ useObjectStreams: true });

            if (typeof showProgress === 'function') showProgress(100);
            if (typeof downloadFile === 'function') {
                downloadFile(modifiedPdfBytes, `${currentFileName}-resized.pdf`);
                originalPdfBytes = null; // GC Hint
            }
            if (typeof showSuccess === 'function') showSuccess('PDF resized successfully!');

        } catch (error) {
            console.error('Resize Error:', error);
            if (typeof showError === 'function') showError(error.message || "Error resizing PDF.");
        } finally {
            if (typeof hideProgress === 'function') hideProgress();
            btnResize.disabled = false;
            btnResize.textContent = "📐 Resize PDF";
        }
    });
})();
