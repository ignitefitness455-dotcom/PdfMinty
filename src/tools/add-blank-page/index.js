/**
 * src/tools/add-blank-page/index.js
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
    showProgress(10, 'Preparing blank page insertion...');

    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();

    const count = options.count;
    const targetPageRaw = options.targetPage;
    const posType = options.posType;
    const sizeType = options.sizeType;

    let targetPage = isNaN(targetPageRaw)
      ? totalPages
      : Math.min(Math.max(1, targetPageRaw), totalPages);

    let insertIndex = posType === 'before' ? targetPage - 1 : targetPage;
    let dims = [595.28, 841.89];
    if (sizeType === 'same') {
      const refPageIdx = Math.min(
        Math.max(0, insertIndex > 0 ? insertIndex - 1 : 0),
        totalPages - 1,
      );
      const refPage = pdfDoc.getPage(refPageIdx);
      const { width, height } = refPage.getSize();
      dims = [width, height];
    } else if (sizeType === 'a4') {
      dims = [595.28, 841.89];
    } else if (sizeType === 'letter') {
      dims = [612.0, 792.0];
    }

    const payload = {
      fileBytes,
      count,
      insertIndex,
      dims
    };

    const resultBytes = await runTask('add-blank-page', payload, {
      transferables: [payload.fileBytes.buffer],
      onProgress: (data) => {
        showProgress(data.percent || data.progress, data.label);
      },
      signal: abortController.signal,
    });

    showProgress(100, 'Complete!');
    setTimeout(hideProgress, 800);

    downloadFile(resultBytes, options.fileName + '_blank_added.pdf');
    showSuccess('Blank pages added successfully!');

    // Analytics
    const processingTime = window.performance.now() - startTime;
    trackToolUsage('add-blank-page', processingTime, fileBytes.byteLength, 0, true);

  } catch (err) {
    hideProgress();
    showError(err.message || 'Page insertion failed');

    const processingTime = window.performance.now() - startTime;
    trackToolUsage('add-blank-page', processingTime, fileBytes.byteLength, 0, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
