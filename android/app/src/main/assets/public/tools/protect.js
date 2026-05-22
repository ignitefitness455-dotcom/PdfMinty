(function () {
  const appContainer =
    document.getElementById('app') || document.querySelector('main') || document.body;
  const styleId = 'pdfminty-protect-styles';
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
                <h1>Protect PDF</h1>
                <p>Add password protection to your PDF document</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
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
                <div class="input-group">
                    <label class="input-label">Set Password</label>
                    <input type="password" id="password-input" class="text-input" placeholder="Enter a secure password">
                    <p class="help-text">This password will be required to open the PDF.</p>
                </div>
                
                <div class="advanced-security" style="margin-bottom: 1.5rem; background: var(--bg); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <h3 style="margin-top: 0; font-size: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        🛡️ Advanced Permissions
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="perm-print" checked> Allow Printing
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="perm-modify" checked> Allow Modification
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="perm-copy" checked> Allow Copying Content
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="perm-annot" checked> Allow Annotations
                        </label>
                    </div>
                </div>

                <p style="text-align: center; color: var(--muted); margin-bottom: 1.5rem; font-size: 0.9rem; background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px;">
                    <strong>Note:</strong> To apply password protection securely in your browser without a server, the document will be converted to high-quality images. Form fields will be flattened.
                </p>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">🔒 Protect PDF</button>
                </div>
            </div>
        </div>
    `;

  let originalPdfBytes = null;
  let currentFileName = '';

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
    currentFileName = '';
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
      const ab = await file.arrayBuffer();
      if (window.pdfDB) {
        await window.pdfDB.saveFile('protect_target', ab);
        originalPdfBytes = 'protect_target';
      } else {
        originalPdfBytes = ab;
      }
      currentFileName = file.name.replace(/\.[^/.]+$/, '');

      fileNameDisplay.textContent = file.name;
      if (
        typeof formatBytes === 'function' &&
        typeof fileSizeDisplay !== 'undefined' &&
        fileSizeDisplay
      )
        fileSizeDisplay.textContent = formatBytes(file.size);

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
    btnApply.textContent = 'Processing...';
    if (typeof window.showProgress === 'function') window.showProgress(10);

    try {
      if (!originalPdfBytes) return;

      const pwd = passwordInput.value;
      if (!pwd) {
        if (typeof showError === 'function') showError('Please enter a password.');
        return;
      }

      try {
        // Load required libraries dynamically
        if (typeof pdfjsLib === 'undefined') {
          await window.loadExternalScript(
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
          );
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        if (typeof window.jspdf === 'undefined') {
          await window.loadExternalScript(
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
          );
        }

        const { jsPDF } = window.jspdf;

        // Read the original PDF
        // Pass a copy of the ArrayBuffer to prevent "detached ArrayBuffer" errors
        let actualBytes =
          originalPdfBytes instanceof ArrayBuffer
            ? originalPdfBytes
            : await window.pdfDB.getFile(originalPdfBytes);
        const loadingTask = pdfjsLib.getDocument({ data: actualBytes.slice(0) });
        actualBytes = null;
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        let doc = null;

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          // Scale 2.0 provides good quality for the output PDF
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };

          await page.render(renderContext).promise;

          // Convert canvas to JPEG
          const imgData = canvas.toDataURL('image/jpeg', 0.85);

          // Calculate dimensions in mm (jsPDF default is mm)
          // 1 point = 1/72 inch = 25.4/72 mm
          const widthMm = (viewport.width / 2.0) * (25.4 / 72);
          const heightMm = (viewport.height / 2.0) * (25.4 / 72);

          const orientation = widthMm > heightMm ? 'l' : 'p';

          if (i === 1) {
            // Create the jsPDF document with encryption on the first page
            const perms = [];
            if (document.getElementById('perm-print').checked) perms.push('print');
            if (document.getElementById('perm-modify').checked) perms.push('modify');
            if (document.getElementById('perm-copy').checked) perms.push('copy');
            if (document.getElementById('perm-annot').checked) perms.push('annot-forms');

            doc = new jsPDF({
              orientation: orientation,
              unit: 'mm',
              format: [widthMm, heightMm],
              encryption: {
                userPassword: pwd,
                ownerPassword: pwd + '_owner', // Give distinct owner password so perm restrictions apply to users
                userPermissions: perms,
              },
            });
          } else {
            doc.addPage([widthMm, heightMm], orientation);
          }

          doc.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm);
        }

        // Generate the protected PDF
        const pdfOutput = doc.output('arraybuffer');

        if (typeof downloadFile === 'function') {
          downloadFile(new Uint8Array(pdfOutput), `${currentFileName}_protected.pdf`);
          originalPdfBytes = null; // GC Hint
        }
        if (typeof showSuccess === 'function') {
          showSuccess('PDF protected successfully!');
        }

        // Clear password field
        passwordInput.value = '';
      } catch (error) {
        console.error('Protect Error:', error);
        if (typeof showError === 'function') showError(error.message || 'Error protecting PDF.');
      } finally {
      }

      if (typeof window.showProgress === 'function') window.showProgress(100);
    } catch (err) {
      console.error('PDF Processing Error:', err);
      if (typeof window.hideProgress === 'function') window.hideProgress();
      if (typeof window.showError === 'function') {
        window.showError(err.message || 'An error occurred while processing the PDF.');
      } else {
        alert('Error: ' + (err.message || 'An error occurred'));
      }
    } finally {
      btnApply.disabled = false;
      btnApply.textContent = btnApply.getAttribute('data-original-text');
    }
  });
})();
