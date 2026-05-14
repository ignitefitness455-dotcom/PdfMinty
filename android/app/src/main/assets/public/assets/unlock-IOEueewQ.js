import { P as u } from './PDFButton-56eB-KER.js';
(function () {
  const g = document.getElementById('app') || document.querySelector('main') || document.body,
    p = 'pdfminty-unlock-styles';
  if (!document.getElementById(p)) {
    const e = document.createElement('style');
    ((e.id = p),
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
  g.innerHTML = `
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
  let i = null,
    d = '';
  const l = document.getElementById('drop-zone'),
    c = document.getElementById('file-input'),
    f = document.getElementById('workspace'),
    w = document.getElementById('file-name-display'),
    y = document.getElementById('remove-file-btn'),
    o = document.getElementById('btn-apply'),
    a = document.getElementById('password-input');
  (typeof initDropZone == 'function'
    ? initDropZone('drop-zone', 'file-input', m, '.pdf')
    : (l.addEventListener('click', () => c.click()),
      c.addEventListener('change', (e) => m(e.target.files))),
    y.addEventListener('click', () => {
      ((i = null),
        (d = ''),
        (c.value = ''),
        (a.value = ''),
        f.classList.add('hidden'),
        l.classList.remove('hidden'));
    }));
  async function m(e) {
    if (!e || e.length === 0) return;
    const t = e[0];
    if (typeof window.validateFile == 'function')
      for (const r of e) {
        const s = window.validateFile(r);
        if (!s.valid) {
          typeof window.showError == 'function' && window.showError(s.reason);
          return;
        }
      }
    try {
      if (
        ((i = await t.arrayBuffer()),
        (d = t.name.replace(/\.[^/.]+$/, '')),
        (w.textContent = t.name),
        typeof formatBytes == 'function' &&
          typeof fileSizeDisplay < 'u' &&
          fileSizeDisplay &&
          (fileSizeDisplay.textContent = formatBytes(t.size)),
        typeof renderPdfThumbnail == 'function')
      ) {
        const r = document.getElementById('file-preview-img');
        r && renderPdfThumbnail(t, r);
      }
      (l.classList.add('hidden'), f.classList.remove('hidden'), a.focus());
    } catch (r) {
      (console.error(r),
        typeof showError == 'function' && showError('Error reading file: ' + r.message));
    }
  }
  o.addEventListener('click', async () => {
    (o.hasAttribute('data-original-text') || o.setAttribute('data-original-text', o.textContent),
      (o.disabled = !0),
      (o.textContent = 'Processing...'),
      typeof window.showProgress == 'function' && window.showProgress(10));
    try {
      if (!i) return;
      const e = a.value;
      if (!e) {
        typeof showError == 'function' && showError('Please enter the password.');
        return;
      }
      try {
        let t = !1;
        try {
          (await u.load(i.slice(0)), (t = !1));
        } catch (n) {
          if (n.message && n.message.toLowerCase().includes('encrypted')) t = !0;
          else throw n;
        }
        if (!t) {
          typeof showError == 'function' && showError('This PDF is not password protected.');
          return;
        }
        let r;
        try {
          r = await u.load(i.slice(0), { password: e });
        } catch (n) {
          (console.error('Password Error:', n),
            typeof showError == 'function' && showError('Incorrect password.'));
          return;
        }
        const s = await r.save({ useObjectStreams: !0 });
        (typeof downloadFile == 'function' && (downloadFile(s, `${d}_unlocked.pdf`), (i = null)),
          typeof showSuccess == 'function' && showSuccess('PDF unlocked successfully!'),
          (a.value = ''));
      } catch (t) {
        (console.error('Unlock Error:', t),
          typeof showError == 'function' && showError(t.message || 'Error unlocking PDF.'));
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
      ((o.disabled = !1), (o.textContent = o.getAttribute('data-original-text')));
    }
  });
})();
