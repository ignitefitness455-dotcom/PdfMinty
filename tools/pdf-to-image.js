import { ICONS } from "../src/ui/icons.js";
import { downloadFile, showSuccess, showError, showProgress, hideProgress } from '../utils/globals.js';
import { runPdfWorkerTask } from '../utils/pdfWorker.js';
import { setupToolUI } from '../src/utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'pdf-to-image',
    title: 'PDF to Image',
    description: 'Convert each page of your PDF into a JPG image',
    icon: ICONS.pdf_to_image || '📄',
    actionText: '🖼️ Convert to JPG',
    isMultiFile: false,
    instructions: [
      'Upload the PDF you want to convert.',
      'Click 🖼️ Convert to JPG to extract pages as images.',
      'A ZIP file containing all the individual JPG images will be downloaded automatically.'
    ],
    onApply: async ({ actualBytes, currentFileName }) => {
      if (typeof window.pdfjsLib === 'undefined') {
         const { loadExternalScript } = await import('../src/utils/fileUtils.js');
         await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
         window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const pdf = await window.pdfjsLib.getDocument({ data: actualBytes }).promise;

      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default || JSZipModule;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.9));
        zip.file(`page_${i}.jpg`, blob);
        showProgress((i / pdf.numPages) * 90);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFileName + '_images.zip';
      a.click();
      showSuccess('PDF converted to images!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
