export const FileHandler = {
  validateFile(file) {
    const isPdfEx = file.name.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.type && file.type.includes('pdf');
    const isImageMime = file.type && file.type.startsWith('image/');
    const isImageEx = file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i);
    
    if (!isPdfMime && !isPdfEx) {
      if (!isImageMime && !isImageEx) {
        return {
          valid: false,
          reason: 'Error: Invalid file format. Please upload a valid PDF document.',
        };
      } else if (!window.location.pathname.includes('image-to-pdf')) {
        // Multi-file sometimes passes accept="image/*,.pdf" so we also rely on tool title if needed,
        // but checking 'image-to-pdf' route is safe
        const titleEl = document.querySelector('.tool-header h1');
        const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
        if (!titleText.includes('image')) {
            return {
              valid: false,
              reason: 'Error: Invalid file format. Please upload a valid PDF document.',
            };
        }
      }
    }
    if (file.size > 500 * 1024 * 1024) {
      return { valid: false, reason: 'Error: File too large. Maximum allowed size is 500MB.' };
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

  async readFileAsArrayBuffer(file) {
    if (file.arrayBuffer) {
      return await file.arrayBuffer();
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
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

    const setOverlayState = (i, t, showProg = false) => {
      const icon = overlay.querySelector('.drop-icon-large');
      const text = overlay.querySelector('.drop-text-large');
      const progContainer = overlay.querySelector('.drop-progress-container');
      
      if(icon) icon.textContent = i;
      if(text) text.textContent = t;
      if (showProg && progContainer) {
        progContainer.classList.remove('hidden');
        if(icon) icon.style.animation = 'none';
      } else if (progContainer) {
        progContainer.classList.add('hidden');
        if(icon) icon.style.animation = '';
      }
    };

    zone.addEventListener('click', (e) => {
      // If zone is strongly a label, native handles it.
      // But if it's a div (legacy), we need to manually click.
      if (zone.tagName !== 'LABEL' && e.target !== input) {
        input.click();
      }
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
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-active');
      if (e.dataTransfer.files.length > 0) {
        onFiles(Array.from(e.dataTransfer.files));
        if (input) input.value = '';
      }
    });
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        onFiles(Array.from(e.target.files));
        if (input) input.value = '';
      }
    });
  },
};
