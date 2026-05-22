import { P as w } from './PDFButton-56eB-KER.js';
(function () {
  const h = document.getElementById('app') || document.querySelector('main') || document.body,
    l = 'pdfminty-img2pdf-styles';
  if (!document.getElementById(l)) {
    const e = document.createElement('style');
    ((e.id = l),
      (e.textContent = `
            .tool-container { color: var(--text); max-width: 800px; margin: 0 auto; padding: 1rem; }
            .tool-header { text-align: center; margin-bottom: 2rem; }
            .tool-header h1 { margin-bottom: 0.5rem; }
            .tool-header p { color: var(--muted); }
            .back-link { display: inline-block; margin-bottom: 1rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
            .back-link:hover { color: var(--accent); }
            .workspace { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5rem; }
            .file-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
            .file-item { position: relative; background: var(--bg); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
            .file-item img { max-width: 100%; max-height: 100%; object-fit: contain; }
            .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); border: none; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: background 0.2s; }
            .remove-btn:hover { background: var(--danger); }
            .actions { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
            .btn-action { background: linear-gradient(to right, var(--primary), var(--accent)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.2s; }
            .btn-action:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
            .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .btn-secondary { background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.75rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .btn-secondary:hover { border-color: var(--accent); }
            .hidden { display: none !important; }
        `),
      document.head.appendChild(e));
  }
  h.innerHTML = `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>Image to PDF</h1>
                <p>Convert JPG or PNG images into a PDF document</p>
            </div>
            <div id="drop-zone" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" accept="image/jpeg, image/png" multiple style="display: none;" />
                <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
                <p style="font-size: 1.25rem; margin: 0;">Drag & drop images here, or click to select</p>
            </div>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                <p style="margin-bottom: 1rem; color: var(--muted); font-size: 0.9rem;">Images will be converted in the order shown below.</p>
                <div id="file-list" class="file-list grid"></div>
                <div class="actions">
                    <button id="btn-add-more" class="btn-secondary">➕ Add More</button>
                    <button id="btn-apply" class="btn-action">🖼️ Convert to PDF</button>
                </div>
            </div>
        </div>
    `;
  let n = [];
  const s = document.getElementById('drop-zone'),
    c = document.getElementById('file-input'),
    m = document.getElementById('workspace'),
    p = document.getElementById('file-list'),
    y = document.getElementById('btn-add-more'),
    r = document.getElementById('btn-apply');
  (typeof initDropZone == 'function'
    ? initDropZone('drop-zone', 'file-input', g, 'image/jpeg, image/png')
    : (s.addEventListener('click', () => c.click()),
      c.addEventListener('change', (e) => g(e.target.files))),
    y.addEventListener('click', () => c.click()));
  function g(e) {
    if (!e || e.length === 0) return;
    const i = Array.from(e).filter((t) => t.type === 'image/jpeg' || t.type === 'image/png');
    if (i.length === 0) {
      typeof showError == 'function' && showError('Please select valid JPG or PNG images.');
      return;
    }
    if (typeof window.validateFile == 'function')
      for (const t of e) {
        const o = window.validateFile(t);
        if (!o.valid) {
          typeof window.showError == 'function' && window.showError(o.reason);
          return;
        }
      }
    ((n = n.concat(i)), f(), s.classList.add('hidden'), m.classList.remove('hidden'));
  }
  function f() {
    ((p.innerHTML = ''),
      n.forEach((e, i) => {
        const t = document.createElement('div');
        t.className = 'file-item';
        const o = document.createElement('img');
        ((o.src = URL.createObjectURL(e)), (o.onload = () => URL.revokeObjectURL(o.src)));
        const a = document.createElement('button');
        ((a.className = 'remove-btn'),
          (a.innerHTML = '✕'),
          (a.dataset.index = i),
          t.appendChild(o),
          t.appendChild(a),
          p.appendChild(t));
      }),
      document.querySelectorAll('.remove-btn').forEach((e) => {
        e.addEventListener('click', (i) => {
          const t = parseInt(i.target.dataset.index);
          (n.splice(t, 1),
            f(),
            n.length === 0 && (m.classList.add('hidden'), s.classList.remove('hidden')));
        });
      }));
  }
  r.addEventListener('click', async () => {
    (r.hasAttribute('data-original-text') || r.setAttribute('data-original-text', r.textContent),
      (r.disabled = !0),
      (r.textContent = 'Processing...'),
      typeof window.showProgress == 'function' && window.showProgress(10));
    try {
      if (n.length === 0) return;
      try {
        const e = await w.create();
        for (let t = 0; t < n.length; t++) {
          const o = n[t],
            a = await o.arrayBuffer();
          let d;
          o.type === 'image/jpeg'
            ? (d = await e.embedJpg(a))
            : o.type === 'image/png' && (d = await e.embedPng(a));
          const { width: u, height: b } = d.scale(1);
          e.addPage([u, b]).drawImage(d, { x: 0, y: 0, width: u, height: b });
        }
        const i = await e.save({ useObjectStreams: !0 });
        (typeof downloadFile == 'function' && downloadFile(i, 'images-converted.pdf'),
          typeof showSuccess == 'function' && showSuccess('Images converted to PDF successfully!'));
      } catch (e) {
        (console.error(e),
          typeof showError == 'function' && showError('Error converting images: ' + e.message));
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
