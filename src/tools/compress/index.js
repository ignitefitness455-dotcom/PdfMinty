/**
 * src/tools/compress/index.js
 */
import { createUI } from './ui.js';
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
    showProgress(10, 'Initializing compression engine...');

    if (typeof window.pdfjsLib === 'undefined') {
       const { loadExternalScript } = await import('../../utils/fileUtils.js');
       await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
       window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const { level } = options;
    let scale = 1.5;
    let quality = 0.7;
    
    if (level === 'high') {
       scale = 1.0;
       quality = 0.5;
    } else if (level === 'low') {
       scale = 2.0;
       quality = 0.85;
    }

    const { PDFDocument } = await import('pdf-lib');
    const pdf = await window.pdfjsLib.getDocument({ data: fileBytes }).promise;
    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      if (abortController.signal.aborted) {
        throw new Error('Task aborted');
      }

      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: scale });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

      const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
      const arrayBuffer = await blob.arrayBuffer();
      
      const image = await newPdfDoc.embedJpg(arrayBuffer);
      const origViewport = page.getViewport({ scale: 1.0 });
      const newPage = newPdfDoc.addPage([origViewport.width, origViewport.height]);
      
      newPage.drawImage(image, {
         x: 0,
         y: 0,
         width: origViewport.width,
         height: origViewport.height,
      });

      showProgress(10 + (i / pdf.numPages) * 80, `Optimizing page ${i} of ${pdf.numPages}...`);
    }

    showProgress(95, 'Saving compressed document...');
    const resultBytes = await newPdfDoc.save();

    showProgress(100, 'Complete!');
    setTimeout(hideProgress, 800);

    downloadFile(resultBytes, options.fileName + '_compressed.pdf');
    showSuccess('PDF compressed successfully!');

    // Analytics
    const processingTime = window.performance.now() - startTime;
    trackToolUsage('compress', processingTime, fileBytes.byteLength, pdf.numPages, true);

  } catch (err) {
    hideProgress();
    showError(err.message || 'Compression failed');

    const processingTime = window.performance.now() - startTime;
    trackToolUsage('compress', processingTime, fileBytes.byteLength, 0, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
