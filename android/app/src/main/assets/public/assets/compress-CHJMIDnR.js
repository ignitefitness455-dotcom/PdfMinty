import { P as I } from './PDFButton-56eB-KER.js';
(function () {
  const P = document.getElementById('app') || document.querySelector('main') || document.body,
    w = 'pdfminty-compress-styles';
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
            .file-size-badge { background: rgba(6, 182, 212, 0.1); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; white-space: nowrap; margin-right: 1rem; }
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
  P.innerHTML = `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Compress PDF</h1>
                <p>Reduce file size by optimizing PDF structure or compressing images</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept=".pdf" style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🗜️</div>
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
                
                <div class="compression-options" style="margin-bottom: 1.5rem; text-align: left; background: var(--bg); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem;">Select Compression Level</h3>
                    
                    <label style="display: block; margin-bottom: 1rem; cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: background 0.2s;">
                        <div style="display: flex; align-items: center;">
                            <input type="radio" name="comp-level" value="basic" checked style="margin-right: 0.75rem; transform: scale(1.2);">
                            <strong style="font-size: 1.05rem;">Basic (Recommended)</strong>
                        </div>
                        <p style="margin: 0.25rem 0 0 2rem; font-size: 0.85rem; color: var(--muted); line-height: 1.4;">Optimizes PDF structure. Fast and keeps text searchable. Best for text-heavy documents.</p>
                    </label>
                    
                    <label style="display: block; cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: background 0.2s;">
                        <div style="display: flex; align-items: center;">
                            <input type="radio" name="comp-level" value="strong" style="margin-right: 0.75rem; transform: scale(1.2);">
                            <strong style="font-size: 1.05rem;">Strong (Rasterize)</strong>
                        </div>
                        <p style="margin: 0.25rem 0 0 2rem; font-size: 0.85rem; color: var(--muted); line-height: 1.4;">Converts pages to compressed images (Good Quality). Slower, but reduces size for scanned documents. <strong>Removes text searchability.</strong></p>
                    </label>

                    <label style="display: block; cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: background 0.2s;">
                        <div style="display: flex; align-items: center;">
                            <input type="radio" name="comp-level" value="deep" style="margin-right: 0.75rem; transform: scale(1.2);">
                            <strong style="font-size: 1.05rem;">Deep Image Compression (Max)</strong>
                        </div>
                        <p style="margin: 0.25rem 0 0 2rem; font-size: 0.85rem; color: var(--muted); line-height: 1.4;">Aggressively compresses pages (Lower Quality). Maximum file size reduction. <strong>Removes text searchability.</strong></p>
                    </label>
                </div>

                <div class="actions">
                    <button id="btn-apply" class="btn-action">🗜️ Compress PDF</button>
                </div>
            </div>
        </div>
    `;
  let o = null,
    m = '';
  const p = document.getElementById('drop-zone'),
    f = document.getElementById('file-input'),
    b = document.getElementById('workspace'),
    B = document.getElementById('file-name-display'),
    g = document.getElementById('file-size-display'),
    k = document.getElementById('remove-file-btn'),
    n = document.getElementById('btn-apply');
  (typeof initDropZone == 'function'
    ? initDropZone('drop-zone', 'file-input', h, '.pdf')
    : (p.addEventListener('click', () => f.click()),
      f.addEventListener('change', (e) => h(e.target.files))),
    k.addEventListener('click', () => {
      ((o = null),
        (m = ''),
        (f.value = ''),
        b.classList.add('hidden'),
        p.classList.remove('hidden'));
    }));
  function u(e, r = 2) {
    if (!+e) return '0 Bytes';
    const i = 1024,
      t = r < 0 ? 0 : r,
      s = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
      a = Math.floor(Math.log(e) / Math.log(i));
    return `${parseFloat((e / Math.pow(i, a)).toFixed(t))} ${s[a]}`;
  }
  async function h(e) {
    if (!e || e.length === 0) return;
    const r = e[0];
    if (typeof window.validateFile == 'function')
      for (const i of e) {
        const t = window.validateFile(i);
        if (!t.valid) {
          typeof window.showError == 'function' && window.showError(t.reason);
          return;
        }
      }
    try {
      typeof showProgress == 'function' && showProgress(30);
      const i = await r.arrayBuffer();
      if (
        (window.pdfDB
          ? (await window.pdfDB.saveFile('compress_target', i), (o = 'compress_target'))
          : (o = i),
        (m = r.name.replace(/\.[^/.]+$/, '')),
        (B.textContent = r.name),
        typeof u == 'function' && typeof g < 'u' && g && (g.textContent = u(r.size)),
        typeof renderPdfThumbnail == 'function')
      ) {
        const t = document.getElementById('file-preview-img');
        t && renderPdfThumbnail(r, t);
      }
      (p.classList.add('hidden'),
        b.classList.remove('hidden'),
        typeof hideProgress == 'function' && hideProgress());
    } catch (i) {
      (console.error(i),
        typeof showError == 'function' && showError('Error loading PDF: ' + i.message),
        typeof hideProgress == 'function' && hideProgress());
    }
  }
  async function v(e, r = 1.5, i = 0.6) {
    if (typeof pdfjsLib > 'u')
      try {
        (await window.loadExternalScript(
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
        ),
          (pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'));
      } catch (l) {
        throw new Error('Failed to load PDF.js library for strong compression.', { cause: l });
      }
    const s = await pdfjsLib.getDocument({ data: e.slice(0) }).promise,
      a = s.numPages,
      y = await I.create();
    for (let l = 1; l <= a; l++) {
      typeof showProgress == 'function' && showProgress(Math.round((l / a) * 90));
      const x = await s.getPage(l),
        d = x.getViewport({ scale: r }),
        c = document.createElement('canvas'),
        E = c.getContext('2d');
      ((c.width = d.width), (c.height = d.height));
      const j = { canvasContext: E, viewport: d };
      await x.render(j).promise;
      const D = c.toDataURL('image/jpeg', i),
        z = await fetch(D).then((M) => M.arrayBuffer()),
        C = await y.embedJpg(z);
      y.addPage([d.width, d.height]).drawImage(C, { x: 0, y: 0, width: d.width, height: d.height });
    }
    return await y.save({ useObjectStreams: !0 });
  }
  n.addEventListener('click', async () => {
    (n.hasAttribute('data-original-text') || n.setAttribute('data-original-text', n.textContent),
      (n.disabled = !0),
      (n.textContent = 'Processing...'),
      typeof window.showProgress == 'function' && window.showProgress(10));
    try {
      if (!o) return;
      try {
        const e = document.querySelector('input[name="comp-level"]:checked').value;
        let r;
        if (e === 'strong' || e === 'deep') {
          const t = e === 'deep' ? 1 : 1.5,
            s = e === 'deep' ? 0.35 : 0.6;
          let a = o instanceof ArrayBuffer ? o : await window.pdfDB.getFile(o);
          ((r = await v(a, t, s)), (a = null));
        } else if (e === 'super-strong') {
          let t = o instanceof ArrayBuffer ? o : await window.pdfDB.getFile(o);
          r = await v(t);
        } else if (typeof window.runPdfWorkerTask == 'function') {
          const t = { fileBytes: new Uint8Array(o.slice(0)) };
          r = await window.runPdfWorkerTask('compress', t, [t.fileBytes.buffer], (s) => {});
        } else {
          let t = o instanceof ArrayBuffer ? o : await window.pdfDB.getFile(o);
          const s = await I.load(t, { ignoreEncryption: !0 });
          ((t = null), (r = await s.save({ useObjectStreams: !0 })));
        }
        typeof downloadFile == 'function' && (downloadFile(r, `${m}_compressed.pdf`), (o = null));
        const i = o.byteLength - r.byteLength;
        i > 0
          ? typeof showSuccess == 'function' &&
            showSuccess(`Compressed successfully! Saved ${u(i)}.`)
          : typeof showSuccess == 'function' &&
            showSuccess('Optimization complete. Note: Some files cannot be compressed further.');
      } catch (e) {
        (console.error('Compress Error:', e),
          typeof showError == 'function' && showError(e.message || 'Error compressing PDF.'));
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
