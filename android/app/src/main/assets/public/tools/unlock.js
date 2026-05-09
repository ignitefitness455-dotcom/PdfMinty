(function() {
    const appContainer = document.getElementById('app') || document.querySelector('main') || document.body;
    const styleId = 'pdfminty-unlock-styles';
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
            .input-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
            .input-label { font-weight: 500; font-size: 0.95rem; color: var(--text); }
            .text-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem; }
            .text-input:focus { outline: none; border-color: var(--accent); }
            .help-text { font-size: 0.85rem; color: var(--muted); }
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
                <h1>Unlock PDF</h1>
                <p>Remove password protection from your PDF</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔓</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop a protected PDF here, or click to select</p>
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
                <div class="input-group">
                    <label class="input-label">Current Password</label>
                    <input type="password" id="password-input" class="text-input" placeholder="Enter the PDF password">
                    <p class="help-text">You must know the current password to unlock the file.</p>
                </div>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">🔓 Unlock PDF</button>
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
    const passwordInput = document.getElementById('password-input');

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
        passwordInput.value = '';
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
            passwordInput.focus();
        } catch (err) {
            console.error(err);
            if (typeof showError === 'function') showError('Error reading file: ' + err.message);
        }
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
        
        const pwd = passwordInput.value;
        if (!pwd) {
            if (typeof showError === 'function') showError("Please enter the password.");
            return;
        }

        try {
            
            
            

            // First, check if the PDF is actually encrypted
            let isEncrypted = false;
            try {
                await PDFLib.PDFDocument.load(originalPdfBytes.slice(0));
                // If this succeeds without a password, the PDF is NOT encrypted
                isEncrypted = false;
            } catch (err) {
                if (err.message && err.message.toLowerCase().includes('encrypted')) {
                    isEncrypted = true;
                } else {
                    throw err; // Some other error occurred
                }
            }

            if (!isEncrypted) {
                if (typeof showError === 'function') showError("This PDF is not password protected.");
                return;
            }

            
            

            // Now try to load with the provided password
            let pdfDoc;
            try {
                pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes.slice(0), { 
                    password: pwd
                });
            } catch (err) {
                console.error('Password Error:', err);
                if (typeof showError === 'function') showError("Incorrect password.");
                return;
            }
            
            
            
            // Saving it without encryption options will save it unlocked
            const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

            
            
            if (typeof downloadFile === 'function') {
                downloadFile(modifiedPdfBytes, `${currentFileName}_unlocked.pdf`);
                originalPdfBytes = null; // GC Hint
            }
            if (typeof showSuccess === 'function') {
                showSuccess("PDF unlocked successfully!");
            }

            passwordInput.value = '';

        } catch (error) {
            console.error('Unlock Error:', error);
            if (typeof showError === 'function') showError(error.message || "Error unlocking PDF.");
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
