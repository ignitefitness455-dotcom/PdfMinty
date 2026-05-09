import { PDFDocument } from 'pdf-lib';
(function() {
    const appContainer = document.getElementById('app') || document.querySelector('main') || document.body;
    const styleId = 'pdfminty-compress-styles';
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
            .file-size-badge { background: rgba(6, 182, 212, 0.1); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; white-space: nowrap; margin-right: 1rem; }
            .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; transition: transform 0.2s; }
            .remove-btn:hover { transform: scale(1.2); }
            .actions { display: flex; justify-content: center; margin-top: 2rem; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    appContainer.innerHTML = `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Compress PDF</h1>
                <p>Reduce file size by optimizing PDF structure or compressing images</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🗜️</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop a PDF here, or click to select</p>
            </div>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left;">
                    <img id="file-preview-img" alt="PDF Preview" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
                        <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0;"></span>
                        <span id="file-size-display" class="file-size-badge" style="width: fit-content;"></span>
                    </div>
                    <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; transition: all 0.2s;">✕</button>
                </div>
                
                <div class="compression-options" style="margin-bottom: 1.5rem; text-align: left; background: var(--bg); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem;">Select Compression Level</h3>
                    
                    <label style="display: block; margin-bottom: 1rem; cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: background 0.2s;">
                        <div style="display: flex; align-items: center;">
                            <input type="radio" name="comp-level" value="basic" checked style="margin-right: 0.75rem; transform: scale(1.2);">
                            <strong style="font-size: 1.05rem;">Basic (Recommended)</strong>
                        </div>
                        <p style="margin: 0.25rem 0 0 2rem; font-size: 0.85rem; color: var(--muted); line-height: 1.4;">Optimizes PDF structure. Fast and keeps text searchable. Best for text-heavy documents.</p>
                    </label>
                    
                    <label style="display: block; cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: background 0.2s;">
                        <div style="display: flex; align-items: center;">
                            <input type="radio" name="comp-level" value="strong" style="margin-right: 0.75rem; transform: scale(1.2);">
                            <strong style="font-size: 1.05rem;">Strong (Rasterize)</strong>
                        </div>
                        <p style="margin: 0.25rem 0 0 2rem; font-size: 0.85rem; color: var(--muted); line-height: 1.4;">Converts pages to compressed images (Good Quality). Slower, but reduces size for scanned documents. <strong>Removes text searchability.</strong></p>
                    </label>

                    <label style="display: block; cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: background 0.2s;">
                        <div style="display: flex; align-items: center;">
                            <input type="radio" name="comp-level" value="deep" style="margin-right: 0.75rem; transform: scale(1.2);">
                            <strong style="font-size: 1.05rem;">Deep Image Compression (Max)</strong>
                        </div>
                        <p style="margin: 0.25rem 0 0 2rem; font-size: 0.85rem; color: var(--muted); line-height: 1.4;">Aggressively compresses pages (Lower Quality). Maximum file size reduction. <strong>Removes text searchability.</strong></p>
                    </label>
                </div>

                <div class="actions">
                    <button id="btn-apply" class="btn-action">🗜️ Compress PDF</button>
                </div>
            </div>
        </div>
    `;

    let originalPdfBytes = null;
    let currentFileName = "";

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const workspace = document.getElementById('workspace');
    const fileNameDisplay = document.getElementById('file-name-display');
    const fileSizeDisplay = document.getElementById('file-size-display');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const btnApply = document.getElementById('btn-apply');

    if (typeof initDropZone === 'function') {
        initDropZone('drop-zone', 'file-input', handleFiles, '.pdf');
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

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

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
            const ab = await file.arrayBuffer();
            if (window.pdfDB) {
                await window.pdfDB.saveFile('compress_target', ab);
                originalPdfBytes = 'compress_target';
            } else {
                originalPdfBytes = ab;
            }
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

    async function compressStrong(pdfBytes, scale = 1.5, quality = 0.6) {
        // Load pdf.js dynamically
        if (typeof pdfjsLib === 'undefined') {
            try {
                await window.loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            } catch (e) {
                throw new Error("Failed to load PDF.js library for strong compression.", { cause: e });
            }
        }

        // Pass a copy of the ArrayBuffer to prevent "detached ArrayBuffer" errors
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= totalPages; i++) {
            if (typeof showProgress === 'function') {
                showProgress(Math.round((i / totalPages) * 90));
            }

            const page = await pdf.getPage(i);
            // Scale 1.5 provides a good balance between readability and file size reduction
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            // Compress to JPEG with 0.6 quality (good compression)
            const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
            const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());

            const image = await newPdf.embedJpg(jpegBytes);
            const newPage = newPdf.addPage([viewport.width, viewport.height]);
            newPage.drawImage(image, {
                x: 0,
                y: 0,
                width: viewport.width,
                height: viewport.height,
            });
        }

        return await newPdf.save({ useObjectStreams: true });
    }

    btnApply.addEventListener('click', async () => {
            if (!btnApply.hasAttribute('data-original-text')) {
                btnApply.setAttribute('data-original-text', btnApply.textContent);
            }
            btnApply.disabled = true;
            btnApply.textContent = "Processing...";
            if (typeof window.showProgress === 'function') window.showProgress(10);
            
            try {
                
        if (!originalPdfBytes) return;

        try {
            
            
            const compLevel = document.querySelector('input[name="comp-level"]:checked').value;
            let modifiedPdfBytes;

            if (compLevel === 'strong' || compLevel === 'deep') {
                const scale = compLevel === 'deep' ? 1.0 : 1.5;
                const quality = compLevel === 'deep' ? 0.35 : 0.6;
                
                let actualBytes = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                modifiedPdfBytes = await compressStrong(actualBytes, scale, quality);
                actualBytes = null;
            } else if (compLevel === 'super-strong' /* fallback fix */) {
                
                let actualBytes = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                modifiedPdfBytes = await compressStrong(actualBytes);
            } else {
                
                if (typeof window.runPdfWorkerTask === 'function') {
                    const payload = { fileBytes: new Uint8Array(originalPdfBytes.slice(0)) };
                    modifiedPdfBytes = await window.runPdfWorkerTask('compress', payload, [payload.fileBytes.buffer], (progress) => {
                        
                    });
                } else {
                    
                    let actualBytesSync = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                    const pdfDoc = await PDFDocument.load(actualBytesSync, { ignoreEncryption: true });
                    actualBytesSync = null;
                    
                    modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
                }
            }

            
            
            if (typeof downloadFile === 'function') {
                downloadFile(modifiedPdfBytes, `${currentFileName}_compressed.pdf`);
                originalPdfBytes = null; // GC Hint
            }
            
            const savedBytes = originalPdfBytes.byteLength - modifiedPdfBytes.byteLength;
            if (savedBytes > 0) {
                if (typeof showSuccess === 'function') showSuccess(`Compressed successfully! Saved ${formatBytes(savedBytes)}.`);
            } else {
                if (typeof showSuccess === 'function') showSuccess('Optimization complete. Note: Some files cannot be compressed further.');
            }

        } catch (error) {
            console.error('Compress Error:', error);
            if (typeof showError === 'function') showError(error.message || "Error compressing PDF.");
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
