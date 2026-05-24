/**
 * src/tools/watermark/index.js
 */
import { createUI } from './ui.js';
import { runTask } from '../../core/worker-pool.js';
import { downloadFile } from '../../utils/download.js';
import { showProgress, hideProgress } from '../../ui/components/ProgressBar.js';
import { showError, showSuccess } from '../../ui/components/Toast.js';
import { trackToolUsage } from '../../core/analytics.js';

let container = null;
let abortController = null;

export function init(targetContainer, { locale = 'en' } = {}) {
  container = targetContainer || document.getElementById('app');
  abortController = new window.AbortController();
  createUI(container, { locale, onProcess: handleProcess, onCancel: handleCancel });
}

export function destroy() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  if (container) {
    container.innerHTML = '';
  }
  container = null;
}

async function handleProcess(fileBytes, options) {
  const startTime = window.performance.now();

  try {
    showProgress(10, 'Adding watermark to PDF...');

    const payload = {
      fileBytes,
      text: options.text,
      colorRgb: options.colorRgb,
      opacity: options.opacity,
      textSize: options.textSize,
      rotationDeg: options.rotationDeg,
      position: options.position
    };

    const resultBytes = await runTask('watermark', payload, {
      transferables: [payload.fileBytes.buffer],
      onProgress: (data) => {
        showProgress(data.percent || data.progress, data.label);
      },
      signal: abortController.signal,
    });

    showProgress(100, 'Complete!');
    setTimeout(hideProgress, 800);

    downloadFile(resultBytes, options.fileName + '_watermarked.pdf');
    showSuccess('Watermark added successfully!');

    // Analytics
    const processingTime = window.performance.now() - startTime;
    trackToolUsage('watermark', processingTime, fileBytes.byteLength, 0, true);

  } catch (err) {
    hideProgress();
    showError(err.message || 'Watermarking failed');

    const processingTime = window.performance.now() - startTime;
    trackToolUsage('watermark', processingTime, fileBytes.byteLength, 0, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
