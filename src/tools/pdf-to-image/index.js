/**
 * src/tools/pdf-to-image/index.js
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
    showProgress(15, 'Preparing conversion rendering...');

    if (typeof window.pdfjsLib === 'undefined') {
       const { loadExternalScript } = await import('../../utils/fileUtils.js');
       await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
       window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const { format, dpi } = options;
    const { PDFDocument } = await import('pdf-lib');
    const scale = dpi === '300' ? 3.0 : dpi === '150' ? 1.5 : 1.0;

    const pdf = await window.pdfjsLib.getDocument({ data: fileBytes }).promise;
    const totalPages = pdf.numPages;

    const jsZipInstance = await (await import('jszip')).default();
    const zip = new jsZipInstance();

    for (let i = 1; i <= totalPages; i++) {
       if (abortController.signal.aborted) {
          throw new Error('Task aborted');
       }
       showProgress(15 + (i / totalPages) * 70, `Rendering page ${i} of ${totalPages}...`);
       
       const page = await pdf.getPage(i);
       const viewport = page.getViewport({ scale });
       const canvas = document.createElement('canvas');
       canvas.width = viewport.width;
       canvas.height = viewport.height;
       
       const context = canvas.getContext('2d');
       await page.render({ canvasContext: context, viewport }).promise;

       const mime = format === 'png' ? 'image/png' : 'image/jpeg';
       const imgBlob = await new Promise((r) => canvas.toBlob(r, mime, 0.95));
       const imgArrBuf = await imgBlob.arrayBuffer();
       
       zip.file(`${options.fileName}_page_${i}.${format}`, imgArrBuf);
    }

    showProgress(90, 'Packing images into ZIP archive...');
    const zipBytes = await zip.generateAsync({ type: 'uint8array' });

    showProgress(100, 'Complete!');
    setTimeout(hideProgress, 800);

    downloadFile(zipBytes, options.fileName + '_images.zip');
    showSuccess('PDF pages exported successfully!');

    // Analytics
    const processingTime = window.performance.now() - startTime;
    trackToolUsage('pdf-to-image', processingTime, fileBytes.byteLength, totalPages, true);

  } catch (err) {
    hideProgress();
    showError(err.message || 'Conversion failed');

    const processingTime = window.performance.now() - startTime;
    trackToolUsage('pdf-to-image', processingTime, fileBytes.byteLength, 0, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
