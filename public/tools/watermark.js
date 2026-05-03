(function() {
    const appContainer = document.getElementById('app') || document.querySelector('main') || document.body;
    const styleId = 'pdfminty-watermark-styles';
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
            .settings-panel { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
            @media (max-width: 600px) { .settings-panel { grid-template-columns: 1fr; } }
            .setting-group { display: flex; flex-direction: column; gap: 0.5rem; }
            .setting-group.full-width { grid-column: 1 / -1; }
            .input-label { font-weight: 500; font-size: 0.95rem; color: var(--text); display: flex; justify-content: space-between; }
            .text-input, .select-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem; }
            .text-input:focus, .select-input:focus { outline: none; border-color: var(--accent); }
            .range-input { width: 100%; cursor: pointer; accent-color: var(--accent); height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; outline: none; -webkit-appearance: none; margin-top: 0.5rem; }
            .range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: var(--accent); border-radius: 50%; cursor: pointer; }
            .color-picker-wrapper { display: flex; align-items: center; gap: 1rem; background: var(--bg); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
            .color-input { width: 35px; height: 35px; padding: 0; border: none; border-radius: 4px; cursor: pointer; background: transparent; }
            .color-hex { font-family: monospace; font-size: 1rem; color: var(--muted); }
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
                <h1>Watermark PDF</h1>
                <p>Stamp text on your PDF pages</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">💧</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop a PDF here, or click to select</p>
            </div>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left;">
                    <img id="file-preview-img" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
                        <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0;"></span>
                        <span id="file-size-display" class="file-size-badge" style="width: fit-content;"></span>
                    </div>
                    <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; transition: all 0.2s;">✕</button>
                </div>
                <div class="settings-panel">
                    <div class="setting-group full-width">
                        <label class="input-label">Watermark Text</label>
                        <input type="text" id="wm-text" class="text-input" placeholder="e.g., CONFIDENTIAL" value="CONFIDENTIAL">
                    </div>
                    <div class="setting-group">
                        <label class="input-label">Color</label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="wm-color" class="color-input" value="#ff0000">
                            <span id="color-hex" class="color-hex">#FF0000</span>
                        </div>
                    </div>
                    <div class="setting-group">
                        <label class="input-label">Position</label>
                        <select id="wm-position" class="select-input">
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Font Size</span> <span id="size-val" style="color:var(--accent)">60px</span></label>
                        <input type="range" id="wm-size" class="range-input" min="12" max="150" value="60">
                    </div>
                    <div class="setting-group">
                        <label class="input-label"><span>Opacity</span> <span id="opacity-val" style="color:var(--accent)">30%</span></label>
                        <input type="range" id="wm-opacity" class="range-input" min="5" max="100" value="30">
                    </div>
                    <div class="setting-group full-width">
                        <label class="input-label"><span>Rotation</span> <span id="rotation-val" style="color:var(--accent)">45°</span></label>
                        <input type="range" id="wm-rotation" class="range-input" min="-90" max="90" value="45">
                    </div>
                </div>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">💧 Add Watermark</button>
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
    const removeFileBtn = document.getElementById('remove-file-btn');
    const btnApply = document.getElementById('btn-apply');
    
    const textInput = document.getElementById('wm-text');
    const colorInput = document.getElementById('wm-color');
    const colorHex = document.getElementById('color-hex');
    const positionInput = document.getElementById('wm-position');
    const sizeInput = document.getElementById('wm-size');
    const sizeVal = document.getElementById('size-val');
    const opacityInput = document.getElementById('wm-opacity');
    const opacityVal = document.getElementById('opacity-val');
    const rotationInput = document.getElementById('wm-rotation');
    const rotationVal = document.getElementById('rotation-val');

    // Live update UI values
    colorInput.addEventListener('input', (e) => colorHex.textContent = e.target.value.toUpperCase());
    sizeInput.addEventListener('input', (e) => sizeVal.textContent = e.target.value + 'px');
    opacityInput.addEventListener('input', (e) => opacityVal.textContent = e.target.value + '%');
    rotationInput.addEventListener('input', (e) => rotationVal.textContent = e.target.value + '°');

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

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
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
        
        const text = textInput.value.trim();
        if (!text) {
            if (typeof showError === 'function') showError("Please enter watermark text.");
            return;
        }

        try {
            
            
            

            const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes.slice(0));
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
            
            const colorRgb = hexToRgb(colorInput.value);
            const opacity = parseInt(opacityInput.value) / 100;
            const textSize = parseInt(sizeInput.value);
            const rotationDeg = parseInt(rotationInput.value);
            const position = positionInput.value;
            const angle = rotationDeg * (Math.PI / 180);

            pages.forEach(page => {
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(text, textSize);
                const textHeight = font.heightAtSize(textSize);

                // Calculate the center X
                const centerX = width / 2;
                
                // Calculate the center Y based on position
                let centerY = height / 2;
                if (position === 'top') {
                    centerY = height - (textHeight * 2);
                } else if (position === 'bottom') {
                    centerY = textHeight * 2;
                }

                // Draw text rotated, roughly centered at (centerX, centerY)
                page.drawText(text, {
                    x: centerX - (textWidth / 2) * Math.cos(angle) + (textHeight / 2) * Math.sin(angle),
                    y: centerY - (textWidth / 2) * Math.sin(angle) - (textHeight / 2) * Math.cos(angle),
                    size: textSize,
                    font: font,
                    color: PDFLib.rgb(colorRgb.r, colorRgb.g, colorRgb.b),
                    opacity: opacity,
                    rotate: PDFLib.degrees(rotationDeg),
                });
            });

            
            const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

            
            if (typeof downloadFile === 'function') {
                downloadFile(modifiedPdfBytes, `${currentFileName}_watermarked.pdf`);
                originalPdfBytes = null; // GC Hint
            }
            if (typeof showSuccess === 'function') showSuccess('Watermark added successfully!');

        } catch (error) {
            console.error('Watermark Error:', error);
            if (typeof showError === 'function') showError(error.message || "Error adding watermark.");
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
