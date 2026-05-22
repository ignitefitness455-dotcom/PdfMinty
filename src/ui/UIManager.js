import { ToastManager } from '../../utils/ToastManager.js';

export const UI = {
  showError(message) {
    ToastManager.error(message);
  },
  
  showSuccess(message) {
    ToastManager.success(message);
  },

  showProgress(percentOrData, labelText) {
    let overlay = document.getElementById('modern-progress-overlay');
    let percent = percentOrData;
    let label = labelText;

    if (typeof percentOrData === 'object' && percentOrData !== null) {
      percent = percentOrData.percent !== undefined ? percentOrData.percent : percentOrData.progress;
      label = percentOrData.label;
    }

    if (!overlay) {
      window._progressStartTime = Date.now();
      window._progressLastETAUpdate = Date.now();
      overlay = document.createElement('div');
      overlay.id = 'modern-progress-overlay';

      overlay.innerHTML = `
                <div class="progress-glass-card" role="status" aria-live="polite">
                    <div class="cube-wrapper">
                        <div class="cube-folding">
                            <span class="leaf1"></span>
                            <span class="leaf2"></span>
                            <span class="leaf3"></span>
                            <span class="leaf4"></span>
                        </div>
                    </div>
                    <div id="modern-progress-msg" class="progress-msg-text" aria-atomic="true">Minting your PDF...</div>
                    <div class="modern-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                        <div id="modern-progress-bar" class="modern-progress-fill"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--muted); margin-top: 0.5rem;" aria-hidden="true">
                        <span id="modern-progress-pct">0%</span>
                        <span id="modern-progress-eta">Calculating ETA...</span>
                    </div>
                </div>
            `;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.backdropFilter = 'blur(10px)';
      });
    }

    const bar = document.getElementById('modern-progress-bar');
    const msg = document.getElementById('modern-progress-msg');
    const pctText = document.getElementById('modern-progress-pct');
    const etaText = document.getElementById('modern-progress-eta');

    const cleanPercent = Math.min(100, Math.max(0, percent || 0));
    const track = document.querySelector('.modern-progress-track');
    if (track) track.setAttribute('aria-valuenow', Math.round(cleanPercent));
    if (bar) {
      if (bar.classList.contains('modern-progress-fill')) {
        bar.style.transform = `scaleX(${cleanPercent / 100})`;
      } else {
        bar.style.width = `${cleanPercent}%`;
      }
    }
    if (pctText) pctText.textContent = `${Math.round(cleanPercent)}%`;

    if (cleanPercent > 0 && cleanPercent < 100 && window._progressStartTime) {
      const elapsed = Date.now() - window._progressStartTime;
      if (elapsed > 1000) {
        const totalEstimated = elapsed / (cleanPercent / 100);
        const etaMs = Math.max(0, totalEstimated - elapsed);
        if (Date.now() - window._progressLastETAUpdate > 1000) {
          window._progressLastETAUpdate = Date.now();
          const etaSecs = Math.ceil(etaMs / 1000);
          if (etaSecs < 2) {
            etaText.textContent = 'Almost done...';
          } else if (etaSecs < 60) {
            etaText.textContent = `ETA: ${etaSecs}s`;
          } else {
            const m = Math.floor(etaSecs / 60);
            const s = (etaSecs % 60).toString().padStart(2, '0');
            etaText.textContent = `ETA: ${m}:${s}`;
          }
        }
      }
    }

    if (label && msg) {
      msg.textContent = label;
    }

    if (cleanPercent >= 100) {
      if (msg) msg.textContent = 'Done! 🎉';
      if (etaText) etaText.textContent = '';
      setTimeout(() => {
        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.backdropFilter = 'blur(0px)';
          setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            window._progressStartTime = null;
          }, 400);
        }
      }, 800);
    }
  },

  hideProgress() {
    let overlay = document.getElementById('modern-progress-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.backdropFilter = 'blur(0px)';
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        window._progressStartTime = null;
      }, 400);
    }
  }
};

window.UI = UI;
