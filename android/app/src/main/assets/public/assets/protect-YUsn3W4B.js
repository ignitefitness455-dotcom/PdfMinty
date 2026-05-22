import './PDFButton-56eB-KER.js';
(function () {
  const P = document.getElementById('app') || document.querySelector('main') || document.body,
    w = 'pdfminty-protect-styles';
  if (!document.getElementById(w)) {
    const e = document.createElement('style');
    ((e.id = w),
      (e.textContent = `
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
        `),
      document.head.appendChild(e));
  }
  P.innerHTML = `
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
  let i = null,
    g = '';
  const u = document.getElementById('drop-zone'),
    y = document.getElementById('file-input'),
    b = document.getElementById('workspace'),
    k = document.getElementById('file-name-display'),
    E = document.getElementById('remove-file-btn'),
    r = document.getElementById('btn-apply'),
    d = document.getElementById('password-input');
  (typeof initDropZone == 'function'
    ? initDropZone('drop-zone', 'file-input', h, '.pdf')
    : (u.addEventListener('click', () => y.click()),
      y.addEventListener('change', (e) => h(e.target.files))),
    E.addEventListener('click', () => {
      ((i = null),
        (g = ''),
        (y.value = ''),
        (d.value = ''),
        b.classList.add('hidden'),
        u.classList.remove('hidden'));
    }));
  async function h(e) {
    if (!e || e.length === 0) return;
    const t = e[0];
    if (typeof window.validateFile == 'function')
      for (const o of e) {
        const n = window.validateFile(o);
        if (!n.valid) {
          typeof window.showError == 'function' && window.showError(n.reason);
          return;
        }
      }
    try {
      const o = await t.arrayBuffer();
      if (
        (window.pdfDB
          ? (await window.pdfDB.saveFile('protect_target', o), (i = 'protect_target'))
          : (i = o),
        (g = t.name.replace(/\.[^/.]+$/, '')),
        (k.textContent = t.name),
        typeof formatBytes == 'function' &&
          typeof fileSizeDisplay < 'u' &&
          fileSizeDisplay &&
          (fileSizeDisplay.textContent = formatBytes(t.size)),
        typeof renderPdfThumbnail == 'function')
      ) {
        const n = document.getElementById('file-preview-img');
        n && renderPdfThumbnail(t, n);
      }
      (u.classList.add('hidden'), b.classList.remove('hidden'), d.focus());
    } catch (o) {
      (console.error(o),
        typeof showError == 'function' && showError('Error reading file: ' + o.message));
    }
  }
  r.addEventListener('click', async () => {
    (r.hasAttribute('data-original-text') || r.setAttribute('data-original-text', r.textContent),
      (r.disabled = !0),
      (r.textContent = 'Processing...'),
      typeof window.showProgress == 'function' && window.showProgress(10));
    try {
      if (!i) return;
      const e = d.value;
      if (!e) {
        typeof showError == 'function' && showError('Please enter a password.');
        return;
      }
      try {
        (typeof pdfjsLib > 'u' &&
          (await window.loadExternalScript(
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
          ),
          (pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js')),
          typeof window.jspdf > 'u' &&
            (await window.loadExternalScript(
              'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            )));
        const { jsPDF: t } = window.jspdf;
        let o = i instanceof ArrayBuffer ? i : await window.pdfDB.getFile(i);
        const n = pdfjsLib.getDocument({ data: o.slice(0) });
        o = null;
        const v = await n.promise,
          j = v.numPages;
        let l = null;
        for (let c = 1; c <= j; c++) {
          const x = await v.getPage(c),
            a = x.getViewport({ scale: 2 }),
            p = document.createElement('canvas'),
            D = p.getContext('2d');
          ((p.width = a.width), (p.height = a.height));
          const A = { canvasContext: D, viewport: a };
          await x.render(A).promise;
          const z = p.toDataURL('image/jpeg', 0.85),
            m = (a.width / 2) * (25.4 / 72),
            f = (a.height / 2) * (25.4 / 72),
            I = m > f ? 'l' : 'p';
          if (c === 1) {
            const s = [];
            (document.getElementById('perm-print').checked && s.push('print'),
              document.getElementById('perm-modify').checked && s.push('modify'),
              document.getElementById('perm-copy').checked && s.push('copy'),
              document.getElementById('perm-annot').checked && s.push('annot-forms'),
              (l = new t({
                orientation: I,
                unit: 'mm',
                format: [m, f],
                encryption: { userPassword: e, ownerPassword: e + '_owner', userPermissions: s },
              })));
          } else l.addPage([m, f], I);
          l.addImage(z, 'JPEG', 0, 0, m, f);
        }
        const B = l.output('arraybuffer');
        (typeof downloadFile == 'function' &&
          (downloadFile(new Uint8Array(B), `${g}_protected.pdf`), (i = null)),
          typeof showSuccess == 'function' && showSuccess('PDF protected successfully!'),
          (d.value = ''));
      } catch (t) {
        (console.error('Protect Error:', t),
          typeof showError == 'function' && showError(t.message || 'Error protecting PDF.'));
      } finally {
      }
      typeof window.showProgress == 'function' && window.showProgress(100);
    } catch (e) {
      (console.error('PDF Processing Error:', e),
        typeof window.hideProgress == 'function' && window.hideProgress(),
        typeof window.showError == 'function'
          ? window.showError(e.message || 'An error occurred while processing the PDF.')
          : alert('Error: ' + (e.message || 'An error occurred')));
    } finally {
      ((r.disabled = !1), (r.textContent = r.getAttribute('data-original-text')));
    }
  });
})();
