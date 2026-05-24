/**
 * src/tools/reorder/index.js
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
    showProgress(10, 'Reordering PDF pages...');

    const payload = {
      fileBytes,
      order: options.order
    };

    const resultBytes = await runTask('reorder', payload, {
      transferables: [payload.fileBytes.buffer],
      onProgress: (data) => {
        showProgress(data.percent || data.progress, data.label);
      },
      signal: abortController.signal,
    });

    showProgress(100, 'Complete!');
    setTimeout(hideProgress, 800);

    downloadFile(resultBytes, options.fileName + '_reordered.pdf');
    showSuccess('Pages reordered successfully!');

    // Analytics
    const processingTime = window.performance.now() - startTime;
    trackToolUsage('reorder', processingTime, fileBytes.byteLength, 0, true);

  } catch (err) {
    hideProgress();
    showError(err.message || 'Reorder failed');

    const processingTime = window.performance.now() - startTime;
    trackToolUsage('reorder', processingTime, fileBytes.byteLength, 0, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
