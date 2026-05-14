import './PDFButton-56eB-KER.js';
(function () {
  const b = document.getElementById('app') || document.querySelector('main') || document.body,
    f = 'pdfminty-pdf2img-styles';
  if (!document.getElementById(f)) {
    const e = document.createElement('style');
    ((e.id = f),
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
            .page-count-badge { background: rgba(6, 182, 212, 0.1); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; white-space: nowrap; margin-right: 1rem; }
            .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; padding: 0 0.5rem; transition: transform 0.2s; }
            .remove-btn:hover { transform: scale(1.2); }
            .actions { display: flex; justify-content: center; margin-top: 2rem; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .hidden { display: none !important; }
        `),
      document.head.appendChild(e));
  }
  b.innerHTML = `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>PDF to Image</h1>
                <p>Convert each page of your PDF into a JPG image</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
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
                <p style="text-align: center; color: var(--muted); margin-bottom: 1.5rem;">The images will be downloaded as a ZIP file.</p>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">🖼️ Convert to JPG</button>
                </div>
            </div>
        </div>
    `;
  let a = null,
    s = '',
    m = 0;
  const l = document.getElementById('drop-zone'),
    c = document.getElementById('file-input'),
    g = document.getElementById('workspace'),
    y = document.getElementById('file-name-display'),
    h = document.getElementById('remove-file-btn'),
    i = document.getElementById('btn-apply');
  (typeof initDropZone == 'function'
    ? initDropZone('drop-zone', 'file-input', u, '.pdf')
    : (l.addEventListener('click', () => c.click()),
      c.addEventListener('change', (e) => u(e.target.files))),
    h.addEventListener('click', () => {
      ((a = null),
        (s = ''),
        (m = 0),
        (c.value = ''),
        g.classList.add('hidden'),
        l.classList.remove('hidden'));
    }));
  async function u(e) {
    if (!e || e.length === 0) return;
    const o = e[0];
    if (typeof window.validateFile == 'function')
      for (const r of e) {
        const n = window.validateFile(r);
        if (!n.valid) {
          typeof window.showError == 'function' && window.showError(n.reason);
          return;
        }
      }
    try {
      if (
        (typeof showProgress == 'function' && showProgress(30),
        (a = o),
        (s = o.name.replace(/\.[^/.]+$/, '')),
        typeof pdfjsLib > 'u')
      )
        try {
          (await window.loadExternalScript(
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
          ),
            (pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'));
        } catch (t) {
          throw new Error('Failed to load PDF.js library.', { cause: t });
        }
      const r = await o.arrayBuffer();
      if (
        ((m = (await pdfjsLib.getDocument({ data: r }).promise).numPages),
        (y.textContent = o.name),
        typeof formatBytes == 'function' &&
          typeof fileSizeDisplay < 'u' &&
          fileSizeDisplay &&
          (fileSizeDisplay.textContent = formatBytes(o.size)),
        typeof renderPdfThumbnail == 'function')
      ) {
        const t = document.getElementById('file-preview-img');
        t && renderPdfThumbnail(o, t);
      }
      (l.classList.add('hidden'),
        g.classList.remove('hidden'),
        typeof hideProgress == 'function' && hideProgress());
    } catch (r) {
      (console.error(r),
        typeof showError == 'function' && showError('Error loading PDF: ' + r.message),
        typeof hideProgress == 'function' && hideProgress());
    }
  }
  i.addEventListener('click', async () => {
    (i.hasAttribute('data-original-text') || i.setAttribute('data-original-text', i.textContent),
      (i.disabled = !0),
      (i.textContent = 'Processing...'),
      typeof window.showProgress == 'function' && window.showProgress(10));
    try {
      if (!a) return;
      if (typeof JSZip > 'u')
        try {
          await window.loadExternalScript('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js');
        } catch (t) {
          throw new Error('Failed to load JSZip library. Cannot create ZIP file.', { cause: t });
        }
      const e = await a.arrayBuffer(),
        o = await pdfjsLib.getDocument({ data: e }).promise,
        r = new JSZip();
      for (let t = 1; t <= o.numPages; t++) {
        const w = await o.getPage(t),
          p = w.getViewport({ scale: 2 }),
          d = document.createElement('canvas'),
          v = d.getContext('2d');
        ((d.height = p.height), (d.width = p.width));
        const x = { canvasContext: v, viewport: p };
        await w.render(x).promise;
        const I = await new Promise((P) => d.toBlob(P, 'image/jpeg', 0.9));
        r.file(`${s}_page_${t}.jpg`, I);
      }
      const n = await r.generateAsync({ type: 'uint8array' });
      (typeof window.downloadFile == 'function'
        ? window.downloadFile(n, `${s}_images.zip`)
        : console.error('downloadFile function missing'),
        typeof showSuccess == 'function' && showSuccess('PDF converted to images successfully!'),
        typeof window.showProgress == 'function' && window.showProgress(100));
    } catch (e) {
      (console.error('PDF Processing Error:', e),
        typeof window.hideProgress == 'function' && window.hideProgress(),
        typeof window.showError == 'function'
          ? window.showError(e.message || 'An error occurred while processing the PDF.')
          : alert('Error: ' + (e.message || 'An error occurred')));
    } finally {
      ((i.disabled = !1), (i.textContent = i.getAttribute('data-original-text')));
    }
  });
})();
