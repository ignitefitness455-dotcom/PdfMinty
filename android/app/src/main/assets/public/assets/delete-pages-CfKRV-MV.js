import { P as y } from './PDFButton-56eB-KER.js';
(function () {
  const w = document.getElementById('app') || document.querySelector('main') || document.body,
    g = 'pdfminty-delete-styles';
  if (!document.getElementById(g)) {
    const e = document.createElement('style');
    ((e.id = g),
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
            .input-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
            .input-label { font-weight: 500; font-size: 0.95rem; color: var(--text); }
            .text-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem; }
            .text-input:focus { outline: none; border-color: var(--danger); }
            .help-text { font-size: 0.85rem; color: var(--muted); }
            .actions { display: flex; justify-content: center; margin-top: 2rem; }
            .btn-action { background: linear-gradient(to right, #ef4444, #b91c1c); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; width: 100%; max-width: 300px; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .hidden { display: none !important; }
        `),
      document.head.appendChild(e));
  }
  w.innerHTML = `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Delete Pages</h1>
                <p>Remove unwanted pages from your PDF</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🗑️</div>
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
                    <label class="input-label">Pages to Delete</label>
                    <input type="text" id="delete-pages-input" class="text-input" placeholder="e.g., 1, 3, 5-7">
                    <p class="help-text">Enter page numbers or ranges separated by commas.</p>
                </div>
                <div class="actions">
                    <button id="btn-apply" class="btn-action">🗑️ Delete Pages</button>
                </div>
            </div>
        </div>
    `;
  let s = null,
    p = '',
    l = 0;
  const f = document.getElementById('drop-zone'),
    m = document.getElementById('file-input'),
    u = document.getElementById('workspace'),
    h = document.getElementById('file-name-display'),
    v = document.getElementById('remove-file-btn'),
    n = document.getElementById('btn-apply'),
    x = document.getElementById('delete-pages-input');
  (typeof initDropZone == 'function'
    ? initDropZone('drop-zone', 'file-input', b, '.pdf')
    : (f.addEventListener('click', () => m.click()),
      m.addEventListener('change', (e) => b(e.target.files))),
    v.addEventListener('click', () => {
      ((s = null),
        (p = ''),
        (l = 0),
        (m.value = ''),
        u.classList.add('hidden'),
        f.classList.remove('hidden'));
    }));
  async function b(e) {
    if (!e || e.length === 0) return;
    const r = e[0];
    if (typeof window.validateFile == 'function')
      for (const t of e) {
        const a = window.validateFile(t);
        if (!a.valid) {
          typeof window.showError == 'function' && window.showError(a.reason);
          return;
        }
      }
    try {
      if (
        (typeof showProgress == 'function' && showProgress(30),
        (s = await r.arrayBuffer()),
        (p = r.name.replace(/\.[^/.]+$/, '')),
        (l = (await y.load(s, { ignoreEncryption: !0 })).getPageCount()),
        (h.textContent = r.name),
        typeof formatBytes == 'function' &&
          typeof fileSizeDisplay < 'u' &&
          fileSizeDisplay &&
          (fileSizeDisplay.textContent = formatBytes(r.size)),
        typeof renderPdfThumbnail == 'function')
      ) {
        const a = document.getElementById('file-preview-img');
        a && renderPdfThumbnail(r, a);
      }
      (f.classList.add('hidden'),
        u.classList.remove('hidden'),
        typeof hideProgress == 'function' && hideProgress());
    } catch (t) {
      (console.error(t),
        typeof showError == 'function' && showError('Error loading PDF: ' + t.message),
        typeof hideProgress == 'function' && hideProgress());
    }
  }
  function I(e, r) {
    const t = new Set(),
      a = e.split(',');
    for (let o of a)
      if (((o = o.trim()), !!o))
        if (o.includes('-')) {
          const [i, c] = o.split('-').map((d) => parseInt(d.trim(), 10));
          if (isNaN(i) || isNaN(c) || i < 1 || c > r || i > c)
            throw new Error(`Invalid range: ${o}`);
          for (let d = i; d <= c; d++) t.add(d);
        } else {
          const i = parseInt(o, 10);
          if (isNaN(i) || i < 1 || i > r) throw new Error(`Invalid page number: ${o}`);
          t.add(i);
        }
    return Array.from(t).sort((o, i) => i - o);
  }
  n.addEventListener('click', async () => {
    (n.hasAttribute('data-original-text') || n.setAttribute('data-original-text', n.textContent),
      (n.disabled = !0),
      (n.textContent = 'Processing...'),
      typeof window.showProgress == 'function' && window.showProgress(10));
    try {
      if (!s) return;
      const e = x.value.trim();
      if (!e) {
        typeof showError == 'function' && showError('Please enter pages to delete.');
        return;
      }
      let r;
      try {
        if (((r = I(e, l)), r.length === 0)) throw new Error('No valid pages specified.');
        if (r.length === l) throw new Error('You cannot delete all pages.');
      } catch (t) {
        typeof showError == 'function' && showError(t.message);
        return;
      }
      try {
        const t = await y.load(s);
        for (const o of r) t.removePage(o - 1);
        const a = await t.save({ useObjectStreams: !0 });
        (typeof downloadFile == 'function' && (downloadFile(a, `${p}_deleted.pdf`), (s = null)),
          typeof showSuccess == 'function' && showSuccess('Pages deleted successfully!'));
      } catch (t) {
        (console.error('Delete Error:', t),
          typeof showError == 'function' && showError(t.message || 'Error deleting pages.'));
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
      ((n.disabled = !1), (n.textContent = n.getAttribute('data-original-text')));
    }
  });
})();
