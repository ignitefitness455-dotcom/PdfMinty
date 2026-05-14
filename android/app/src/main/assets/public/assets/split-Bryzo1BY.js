import { P as u } from './PDFButton-56eB-KER.js';
(function () {
  const x = document.getElementById('app') || document.querySelector('main') || document.body,
    w = 'pdfminty-split-styles';
  if (!document.getElementById(w)) {
    const r = document.createElement('style');
    ((r.id = w),
      (r.textContent = `
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
      document.head.appendChild(r));
  }
  x.innerHTML = `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Split PDF</h1>
                <p>Extract pages or split your PDF into multiple files</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">✂️</div>
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
                    <label class="input-label">Split Ranges</label>
                    <input type="text" id="split-ranges" class="text-input" placeholder="e.g., 1-3, 4-5, 8">
                    <p class="help-text">Enter page ranges separated by commas. Each range will be saved as a separate PDF in a ZIP file.</p>
                </div>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">✂️ Split PDF</button>
                </div>
            </div>
        </div>
    `;
  let a = null,
    c = '',
    f = 0;
  const g = document.getElementById('drop-zone'),
    m = document.getElementById('file-input'),
    y = document.getElementById('workspace'),
    I = document.getElementById('file-name-display'),
    P = document.getElementById('remove-file-btn'),
    s = document.getElementById('btn-apply'),
    E = document.getElementById('split-ranges');
  (typeof initDropZone == 'function'
    ? initDropZone('drop-zone', 'file-input', b, '.pdf')
    : (g.addEventListener('click', () => m.click()),
      m.addEventListener('change', (r) => b(r.target.files))),
    P.addEventListener('click', () => {
      ((a = null),
        (c = ''),
        (f = 0),
        (m.value = ''),
        y.classList.add('hidden'),
        g.classList.remove('hidden'));
    }));
  async function b(r) {
    if (!r || r.length === 0) return;
    const n = r[0];
    if (typeof window.validateFile == 'function')
      for (const e of r) {
        const i = window.validateFile(e);
        if (!i.valid) {
          typeof window.showError == 'function' && window.showError(i.reason);
          return;
        }
      }
    try {
      typeof showProgress == 'function' && showProgress(30);
      const e = await n.arrayBuffer();
      (window.pdfDB
        ? (await window.pdfDB.saveFile('split_target', e), (a = 'split_target'))
        : (a = e),
        (c = n.name.replace(/\.[^/.]+$/, '')));
      let i = a instanceof ArrayBuffer ? a : await window.pdfDB.getFile(a);
      const o = await u.load(i, { ignoreEncryption: !0 });
      if (
        ((i = null),
        (f = o.getPageCount()),
        (I.textContent = n.name),
        typeof formatBytes == 'function' &&
          typeof fileSizeDisplay < 'u' &&
          fileSizeDisplay &&
          (fileSizeDisplay.textContent = formatBytes(n.size)),
        typeof renderPdfThumbnail == 'function')
      ) {
        const t = document.getElementById('file-preview-img');
        t && renderPdfThumbnail(n, t);
      }
      (g.classList.add('hidden'),
        y.classList.remove('hidden'),
        typeof hideProgress == 'function' && hideProgress());
    } catch (e) {
      (console.error(e),
        typeof showError == 'function' && showError('Error loading PDF: ' + e.message),
        typeof hideProgress == 'function' && hideProgress());
    }
  }
  function D(r, n) {
    const e = [],
      i = r.split(',');
    for (let o of i)
      if (((o = o.trim()), !!o))
        if (o.includes('-')) {
          const [t, l] = o.split('-').map((p) => parseInt(p.trim(), 10));
          if (isNaN(t) || isNaN(l) || t < 1 || l > n || t > l)
            throw new Error(`Invalid range: ${o}`);
          e.push({ start: t, end: l });
        } else {
          const t = parseInt(o, 10);
          if (isNaN(t) || t < 1 || t > n) throw new Error(`Invalid page number: ${o}`);
          e.push({ start: t, end: t });
        }
    return e;
  }
  s.addEventListener('click', async () => {
    (s.hasAttribute('data-original-text') || s.setAttribute('data-original-text', s.textContent),
      (s.disabled = !0),
      (s.textContent = 'Processing...'),
      typeof window.showProgress == 'function' && window.showProgress(10));
    try {
      if (!a) return;
      const r = E.value.trim();
      if (!r) {
        typeof showError == 'function' && showError('Please enter page ranges to split.');
        return;
      }
      let n;
      try {
        if (((n = D(r, f)), n.length === 0)) throw new Error('No valid ranges found.');
      } catch (e) {
        typeof showError == 'function' && showError(e.message);
        return;
      }
      try {
        let e;
        if (typeof window.runPdfWorkerTask == 'function') {
          const i = { fileBytes: new Uint8Array(a.slice(0)), fileName: c, ranges: n };
          e = await window.runPdfWorkerTask('split', i, [i.fileBytes.buffer], (o) => {});
        } else {
          let i = a instanceof ArrayBuffer ? a : await window.pdfDB.getFile(a);
          const o = await u.load(i);
          ((i = null), (e = []));
          for (let t = 0; t < n.length; t++) {
            const l = n[t],
              p = await u.create(),
              h = [];
            for (let d = l.start - 1; d < l.end; d++) h.push(d);
            const v = await p.copyPages(o, h);
            for (let d = 0; d < v.length; d++)
              (p.addPage(v[d]), d % 50 === 0 && (await new Promise((k) => setTimeout(k, 0))));
            const B = await p.save({ useObjectStreams: !0 });
            e.push({ name: `${c}_${l.start}-${l.end}.pdf`, bytes: B });
          }
        }
        if (e.length === 1)
          typeof downloadFile == 'function' && (downloadFile(e[0].bytes, e[0].name), (a = null));
        else {
          if (typeof JSZip > 'u')
            try {
              await window.loadExternalScript('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js');
            } catch (t) {
              throw new Error('Failed to load JSZip library. Cannot create ZIP file.', {
                cause: t,
              });
            }
          const i = new JSZip();
          for (let t = 0; t < e.length; t++) i.file(e[t].name, e[t].bytes);
          const o = await i.generateAsync({ type: 'uint8array' });
          typeof downloadFile == 'function' && (downloadFile(o, `${c}_split.zip`), (a = null));
        }
        typeof showSuccess == 'function' && showSuccess('PDF split successfully!');
      } catch (e) {
        (console.error(e),
          typeof showError == 'function' && showError('Error splitting PDF: ' + e.message));
      } finally {
      }
      typeof window.showProgress == 'function' && window.showProgress(100);
    } catch (r) {
      (console.error('PDF Processing Error:', r),
        typeof window.hideProgress == 'function' && window.hideProgress(),
        typeof window.showError == 'function'
          ? window.showError(r.message || 'An error occurred while processing the PDF.')
          : alert('Error: ' + (r.message || 'An error occurred')));
    } finally {
      ((s.disabled = !1), (s.textContent = s.getAttribute('data-original-text')));
    }
  });
})();
