/**
 * src/tools/split/index.js
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
    showProgress(10, 'Extracting selected page range...');

    const payload = {
      fileBytes,
      ranges: options.ranges
    };

    const resultBytes = await runTask('split', payload, {
      transferables: [payload.fileBytes.buffer],
      onProgress: (data) => {
        showProgress(data.percent || data.progress, data.label);
      },
      signal: abortController.signal,
    });

    showProgress(100, 'Complete!');
    setTimeout(hideProgress, 800);

    downloadFile(resultBytes, options.fileName + '_split.pdf');
    showSuccess('PDF split successfully!');

    // Analytics
    const processingTime = window.performance.now() - startTime;
    trackToolUsage('split', processingTime, fileBytes.byteLength, 0, true);

  } catch (err) {
    hideProgress();
    showError(err.message || 'Splitting failed');

    const processingTime = window.performance.now() - startTime;
    trackToolUsage('split', processingTime, fileBytes.byteLength, 0, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
