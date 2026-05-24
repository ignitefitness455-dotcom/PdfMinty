/**
 * src/tools/image-to-pdf/index.js
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

async function handleProcess(files, options) {
  const startTime = window.performance.now();

  try {
    showProgress(10, 'Formatting images...');

    const imagePayloads = [];
    const transferables = [];

    for (const fileObj of files) {
      imagePayloads.push({
        bytes: fileObj.bytes,
        name: fileObj.name,
        type: fileObj.type
      });
      transferables.push(fileObj.bytes.buffer);
    }

    const payload = {
      images: imagePayloads,
      pageSize: options.pageSize,
      margin: options.margin,
      orientation: options.orientation,
    };

    const resultBytes = await runTask('image-to-pdf', payload, {
      transferables,
      onProgress: (data) => {
        showProgress(data.percent || data.progress, data.label);
      },
      signal: abortController.signal,
    });

    showProgress(100, 'Complete!');
    setTimeout(hideProgress, 800);

    downloadFile(resultBytes, options.fileName + '_converted.pdf');
    showSuccess('Images converted successfully!');

    // Analytics
    const processingTime = window.performance.now() - startTime;
    trackToolUsage('image-to-pdf', processingTime, 0, files.length, true);

  } catch (err) {
    hideProgress();
    showError(err.message || 'Conversion failed');

    const processingTime = window.performance.now() - startTime;
    trackToolUsage('image-to-pdf', processingTime, 0, files.length, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
