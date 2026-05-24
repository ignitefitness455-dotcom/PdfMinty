/**
 * src/tools/crop-resize/index.js
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
  const MM_TO_PT = 2.835;

  try {
    showProgress(10, 'Parsing crop and resize configurations...');

    const { mode } = options;
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(fileBytes);

    if (mode === 'crop') {
      const { top, right, bottom, left, applyTo } = options;
      const pages = pdfDoc.getPages();
      const pagesToProcess = applyTo === 'all' ? pages : [pages[0]];

      for (let i = 0; i < pagesToProcess.length; i++) {
        if (abortController.signal.aborted) throw new Error('Task aborted');
        const page = pagesToProcess[i];
        const box = page.getCropBox() || page.getMediaBox();
        const newX = box.x + left * MM_TO_PT;
        const newY = box.y + bottom * MM_TO_PT;
        const newWidth = box.width - (left + right) * MM_TO_PT;
        const newHeight = box.height - (top + bottom) * MM_TO_PT;
        if (newWidth <= 0 || newHeight <= 0) {
          throw new Error('Crop margins are too large for the page dimensions.');
        }
        page.setCropBox(newX, newY, newWidth, newHeight);
      }
      
      showProgress(85, 'Saving cropped PDF document...');
      const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
      showProgress(100, 'Complete!');
      setTimeout(hideProgress, 800);

      downloadFile(modifiedPdfBytes, `${options.fileName}-cropped.pdf`);
      showSuccess('PDF cropped successfully!');
      
      // Analytics
      trackToolUsage('crop-resize', window.performance.now() - startTime, fileBytes.byteLength, pagesToProcess.length, true);

    } else {
      const { targetW_mm, targetH_mm, scaleMode } = options;
      const targetW = targetW_mm * MM_TO_PT;
      const targetH = targetH_mm * MM_TO_PT;

      const newDoc = await PDFDocument.create();
      const srcPages = pdfDoc.getPages();
      const embeddedPages = await newDoc.embedPages(srcPages);

      for (let i = 0; i < srcPages.length; i++) {
        if (abortController.signal.aborted) throw new Error('Task aborted');
        const origPage = srcPages[i];
        const embeddedPage = embeddedPages[i];
        const { width: origW, height: origH } = origPage.getSize();

        const newPage = newDoc.addPage([targetW, targetH]);

        if (scaleMode === 'fit') {
          const scale = Math.min(targetW / origW, targetH / origH);
          const drawW = origW * scale;
          const drawH = origH * scale;
          const tx = (targetW - drawW) / 2;
          const ty = (targetH - drawH) / 2;
          newPage.drawPage(embeddedPage, { x: tx, y: ty, width: drawW, height: drawH });
        } else if (scaleMode === 'stretch') {
          newPage.drawPage(embeddedPage, { x: 0, y: 0, width: targetW, height: targetH });
        } else if (scaleMode === 'keep') {
          const tx = (targetW - origW) / 2;
          const ty = (targetH - origH) / 2;
          newPage.drawPage(embeddedPage, { x: tx, y: ty, width: origW, height: origH });
        }

        if (i % 5 === 0) {
          showProgress(10 + (i / srcPages.length) * 70, `Resizing page ${i + 1}...`);
        }
      }

      showProgress(90, 'Saving resized PDF layout...');
      const modifiedPdfBytes = await newDoc.save({ useObjectStreams: true });
      showProgress(100, 'Complete!');
      setTimeout(hideProgress, 800);

      downloadFile(modifiedPdfBytes, `${options.fileName}-resized.pdf`);
      showSuccess('PDF resized successfully!');

      // Analytics
      trackToolUsage('crop-resize', window.performance.now() - startTime, fileBytes.byteLength, srcPages.length, true);
    }

  } catch (err) {
    hideProgress();
    showError(err.message || 'Crop/Resize task failed');
    trackToolUsage('crop-resize', window.performance.now() - startTime, fileBytes.byteLength, 0, false, err.message);
  }
}

function handleCancel() {
  if (abortController) {
    abortController.abort();
    abortController = new window.AbortController();
  }
  hideProgress();
}
