/**
 * Modern progress overlay with ETA
 */
let overlay = null;
let startTime = null;

export function showProgress(percent, label = '') {
  if (!overlay) {
    startTime = Date.now();
    overlay = document.createElement('div');
    overlay.id = 'modern-progress-overlay';
    overlay.innerHTML = `
      <div class="progress-glass-card">
        <div class="cube-wrapper">
          <div class="cube-folding">
            <span class="leaf1"></span><span class="leaf2"></span>
            <span class="leaf3"></span><span class="leaf4"></span>
          </div>
        </div>
        <p class="progress-msg-text" id="progress-msg">${label || 'Processing...'}</p>
        <div class="modern-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
          <div class="modern-progress-fill" id="progress-fill"></div>
        </div>
        <p class="progress-pct" id="progress-pct">0%</p>
        <p class="progress-eta" id="progress-eta"></p>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.style.backdropFilter = 'blur(10px)';
    });
  }

  const cleanPercent = Math.min(100, Math.max(0, percent));
  const fill = overlay.querySelector('#progress-fill');
  const pct = overlay.querySelector('#progress-pct');
  const msg = overlay.querySelector('#progress-msg');
  const eta = overlay.querySelector('#progress-eta');

  if (fill) fill.style.transform = `scaleX(${cleanPercent / 100})`;
  if (pct) pct.textContent = `${Math.round(cleanPercent)}%`;
  if (msg && label) msg.textContent = label;

  // ETA calculation
  if (cleanPercent > 0 && cleanPercent < 100 && startTime) {
    const elapsed = Date.now() - startTime;
    const totalEstimated = elapsed / (cleanPercent / 100);
    const remaining = Math.max(0, totalEstimated - elapsed);
    const seconds = Math.ceil(remaining / 1000);

    if (seconds < 2) {
      if (eta) eta.textContent = 'Almost done...';
    } else if (seconds < 60) {
      if (eta) eta.textContent = `ETA: ${seconds}s`;
    } else {
      const m = Math.floor(seconds / 60);
      const s = (seconds % 60).toString().padStart(2, '0');
      if (eta) eta.textContent = `ETA: ${m}:${s}`;
    }
  }

  if (cleanPercent >= 100) {
    if (msg) msg.textContent = 'Done! 🎉';
    if (eta) eta.textContent = '';
  }
}

export function hideProgress() {
  if (!overlay) return;
  overlay.style.opacity = '0';
  overlay.style.backdropFilter = 'blur(0px)';
  setTimeout(() => {
    if (overlay) {
      overlay.remove();
      overlay = null;
      startTime = null;
    }
  }, 400);
}
