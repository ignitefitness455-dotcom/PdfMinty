export const FileHandler = {
    validateFile(file) {
        if (!file.type || !file.type.includes('pdf')) {
            if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
                 return { valid: false, reason: "Error: Invalid file format. Please upload a valid PDF document." };
            } else if (file.type !== 'application/pdf' && window.location.hash !== '#image-to-pdf') {
                 return { valid: false, reason: "Error: Invalid file format. Please upload a valid PDF document." };
            }
        }
        if (file.size > 500 * 1024 * 1024) {
            return { valid: false, reason: "Error: File too large. Maximum allowed size is 500MB." };
        }
        if (file.size > 50 * 1024 * 1024) {
             if (window.PdfMinty && window.PdfMinty.ui) {
                 window.PdfMinty.ui.showError("Warning: File size is large (50MB+), processing might take a while.");
             }
        }
        return { valid: true };
    },

    async readFileAsArrayBuffer(file) {
        return await file.arrayBuffer();
    },

    initDropZone(id, inputId, onFiles, accept = ".pdf") {
        const zone = document.getElementById(id);
        const input = document.getElementById(inputId);
        if (!zone || !input) return;

        if (accept) input.accept = accept;

        zone.classList.add('drop-zone-enhanced');

        const overlay = document.createElement('div');
        overlay.className = 'drop-overlay';
        overlay.innerHTML = `
            <div class="drop-icon-large">📥</div>
            <div class="drop-text-large">Release to add files</div>
            <div class="drop-progress-container hidden">
                <div class="drop-progress-bar"></div>
            </div>
        `;
        zone.appendChild(overlay);

        const icon = overlay.querySelector('.drop-icon-large');
        const text = overlay.querySelector('.drop-text-large');
        const progContainer = overlay.querySelector('.drop-progress-container');
        const progBar = overlay.querySelector('.drop-progress-bar');

        const setOverlayState = (i, t, showProg = false) => {
            icon.textContent = i;
            text.textContent = t;
            if (showProg) {
                progContainer.classList.remove('hidden');
                icon.style.animation = 'none';
            } else {
                progContainer.classList.add('hidden');
                icon.style.animation = '';
            }
        };

        zone.addEventListener('click', (e) => { if (e.target !== input) input.click(); });
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-active'); setOverlayState('📥', 'Release to add files'); });
        zone.addEventListener('dragleave', (e) => { e.preventDefault(); if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-active'); });
        zone.addEventListener('drop', async (e) => {
            e.preventDefault();
            zone.classList.remove('drag-active');
            if (e.dataTransfer.files.length > 0) await processFiles(e.dataTransfer.files);
        });
        input.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) await processFiles(e.target.files);
        });

        async function processFiles(files) {
            overlay.classList.add('active');
            setOverlayState('⏳', `Processing ${files.length} file(s)...`, true);
            for (let i = 0; i <= 100; i += 20) {
                progBar.style.width = `${i}%`;
                await new Promise(r => setTimeout(r, 30));
            }
            
            // Success Animation
            overlay.innerHTML = `
                <div class="success-checkmark">
                    <div class="check-icon">
                        <span class="icon-line line-tip"></span>
                        <span class="icon-line line-long"></span>
                        <div class="icon-circle"></div>
                        <div class="icon-fix"></div>
                    </div>
                </div>
                <div class="drop-text-large" style="margin-top: 1rem;">Files added successfully!</div>
            `;
            
            setTimeout(() => {
                overlay.classList.remove('active');
                // Restore original overlay content for next time
                overlay.innerHTML = `
                    <div class="drop-icon-large">📥</div>
                    <div class="drop-text-large">Release to add files</div>
                    <div class="drop-progress-container hidden">
                        <div class="drop-progress-bar"></div>
                    </div>
                `;
                onFiles(files);
                input.value = ''; 
            }, 1500);
        }
    }
};
