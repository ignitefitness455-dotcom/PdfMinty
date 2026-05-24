/**
 * src/tools/merge/index.js
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
    showProgress(10, 'Preparing PDF documents...');

    const filePayloads = [];
    const transferables = [];

    for (const fileObj of files) {
      filePayloads.push({
        bytes: fileObj.bytes,
        name: fileObj.name
      });
      transferables.push(fileObj.bytes.buffer);
    }

    const payload = {
      files: filePayloads,
    };

    const resultBytes = await runTask('merge', payload, {
      transferables,
      onProgress: (data) => {
        showProgress(data.percent || data.progress, data.label);
      },
      signal: abortController.signal,
    });

    showProgress(100, 'Complete!');
    setTimeout(hideProgress, 800);

    downloadFile(resultBytes, options.fileName + '_merged.pdf');
    showSuccess('PDFs merged successfully!');

    // Analytics
    const processingTime = window.performance.now() - startTime;
    trackToolUsage('merge', processingTime, 0, files.length, true);

  } catch (err) {
    hideProgress();
    showError(err.message || 'Merging files failed');

    const processingTime = window.performance.now() - startTime;
    trackToolUsage('merge', processingTime, 0, files.length, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
