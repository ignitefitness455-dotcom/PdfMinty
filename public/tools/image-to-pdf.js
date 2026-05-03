(function() {
    const appContainer = document.getElementById('app') || document.querySelector('main') || document.body;
    const styleId = 'pdfminty-img2pdf-styles';
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
            .file-item { position: relative; background: var(--bg); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
            .file-item img { max-width: 100%; max-height: 100%; object-fit: contain; }
            .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); border: none; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: background 0.2s; }
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
                <h1>Image to PDF</h1>
                <p>Convert JPG or PNG images into a PDF document</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept="image/jpeg, image/png" multiple style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop images here, or click to select</p>
            </div>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                <p style="margin-bottom: 1rem; color: var(--muted); font-size: 0.9rem;">Images will be converted in the order shown below.</p>
                <div id="file-list" class="file-list grid"></div>
                <div class="actions">
                    <button id="btn-add-more" class="btn-secondary">➕ Add More</button>
                    <button id="btn-apply" class="btn-action">🖼️ Convert to PDF</button>
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
        initDropZone('drop-zone', 'file-input', handleFiles, 'image/jpeg, image/png');
    } else {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    }

    btnAddMore.addEventListener('click', () => fileInput.click());

    function handleFiles(files) {
        if (!files || files.length === 0) return;
        const validFiles = Array.from(files).filter(f => f.type === 'image/jpeg' || f.type === 'image/png');
        if (validFiles.length === 0) {
            if (typeof showError === 'function') showError('Please select valid JPG or PNG images.');
            return;
        }
        if (typeof window.validateSizeOnly === 'function' && !window.validateSizeOnly(validFiles)) return;

        filesArray = filesArray.concat(validFiles);
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
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);
            
            const btn = document.createElement('button');
            btn.className = 'remove-btn';
            btn.innerHTML = '✕';
            btn.dataset.index = index;
            
            item.appendChild(img);
            item.appendChild(btn);
            fileListEl.appendChild(item);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                filesArray.splice(idx, 1);
                renderFileList();
                if (filesArray.length === 0) {
                    workspace.classList.add('hidden');
                    dropZone.classList.remove('hidden');
                }
            });
        });
    }

    btnApply.addEventListener('click', async () => {
        if (filesArray.length === 0) return;

        try {
            btnApply.disabled = true;
            btnApply.textContent = "Processing...";
            if (typeof showProgress === 'function') showProgress(20);

            const pdfDoc = await PDFLib.PDFDocument.create();
            
            for (let i = 0; i < filesArray.length; i++) {
                const file = filesArray[i];
                const fileBytes = await file.arrayBuffer();
                let image;
                
                if (file.type === 'image/jpeg') {
                    image = await pdfDoc.embedJpg(fileBytes);
                } else if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(fileBytes);
                }
                
                const { width, height } = image.scale(1);
                const page = pdfDoc.addPage([width, height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
                
                if (typeof showProgress === 'function') showProgress(20 + ((i+1)/filesArray.length * 60));
            }

            const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
            if (typeof showProgress === 'function') showProgress(100);

            if (typeof downloadFile === 'function') {
                downloadFile(pdfBytes, 'images-converted.pdf');
            }
            if (typeof showSuccess === 'function') showSuccess('Images converted to PDF successfully!');
        } catch (error) {
            console.error(error);
            if (typeof showError === 'function') showError("Error converting images: " + error.message);
        } finally {
            if (typeof hideProgress === 'function') hideProgress();
            btnApply.disabled = false;
            btnApply.textContent = "🖼️ Convert to PDF";
        }
    });
})();
