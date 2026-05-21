export const FileHandler = {
  async validateFile(file) {
    if (file.size > 500 * 1024 * 1024) {
      return { valid: false, reason: 'Error: File too large. Maximum allowed size is 500MB.' };
    }

    // Bug 3 fix: detect image-to-pdf mode by both pathname AND hash to support the SPA router
    // The SPA router uses /image-to-pdf-pdf as the pathname; legacy hash was #image-to-pdf
    const isImageToPdfMode =
      window.location.pathname.includes('image-to-pdf') ||
      window.location.hash === '#image-to-pdf';

    if (!isImageToPdfMode) {
      // Bug 3 fix: check MIME type first for a fast, timing-safe rejection of non-PDFs
      if (file.type && file.type !== 'application/pdf' && file.type !== '') {
        // Only reject if the MIME type is explicitly set to something other than PDF
        // (empty type means the browser couldn't determine it, so fall through to magic bytes)
        return {
          valid: false,
          reason: 'Error: Invalid file format. Please upload a valid PDF document.',
        };
      }

      // Bug 3 fix: magic bytes check is properly awaited to prevent timing issues
      try {
        const buffer = await file.slice(0, 4).arrayBuffer();
        const view = new Uint8Array(buffer);
        // %PDF (0x25 0x50 0x44 0x46)
        if (view[0] !== 0x25 || view[1] !== 0x50 || view[2] !== 0x44 || view[3] !== 0x46) {
          return {
            valid: false,
            reason: 'Error: Invalid file format. Please upload a valid PDF document.',
          };
        }
      } catch (e) {
        return {
          valid: false,
          reason: 'Error: Could not read file to verify format.',
        };
      }
    } else {
      // Image to PDF mode: check if it's an image
      if (file.type && !file.type.startsWith('image/')) {
        return {
          valid: false,
          reason: 'Error: Invalid file format. Please upload a valid image.',
        };
      }
    }

    if (file.size > 50 * 1024 * 1024) {
      if (window.PdfMinty && window.PdfMinty.ui) {
        window.PdfMinty.ui.showError(
          'Warning: File size is large (50MB+), processing might take a while.',
        );
      }
    }
    return { valid: true };
  },

  // Bug 3 fix: ensure file reading is fully awaited
  async readFileAsArrayBuffer(file) {
    return await file.arrayBuffer();
  },

  initDropZone(id, inputId, onFiles, accept = '.pdf') {
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

    zone.addEventListener('click', (e) => {
      if (e.target !== input) input.click();
    });
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-active');
      setOverlayState('📥', 'Release to add files');
    });
    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-active');
    });
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
      
      // Real progress callback passed to onFiles if it supports it
      const updateProgress = (percent) => {
        progBar.style.width = `${percent}%`;
      };
      
      try {
        await onFiles(files, updateProgress);
        
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
          input.value = '';
        }, 1500);
      } catch (err) {
        overlay.classList.remove('active');
        if (window.PdfMinty && window.PdfMinty.ui) {
          // Bug 2 fix: safely extract message string to prevent [Object Object]
          const msg = (typeof err === 'string') ? err : (err && err.message) ? err.message : 'Failed to process files';
          window.PdfMinty.ui.showError(msg);
        }
      }
    }
  },
};
