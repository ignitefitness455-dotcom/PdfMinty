import { setupToolUI } from '../utils/pdfToolsSetup.js';
import { setupBackButton } from './shared.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'pdf-to-image',
    title: 'PDF to Image',
    description: 'Convert each page of your PDF into a JPG image',
    icon: window.PdfMinty.ICONS.pdf_to_image || '📄',
    actionText: '🖼️ Convert to JPG',
    isMultiFile: false,
    onInit: () => {
      // Bug 5 fix: set up back button with history API
      setupBackButton();
    },
    onApply: async ({ actualBytes, currentFileName }) => {
      if (typeof window.pdfjsLib === 'undefined') throw new Error('PDF.js not loaded');

      // Bug 3 fix: validate MIME type / magic bytes before attempting to load
      if (actualBytes instanceof Uint8Array && actualBytes.length >= 4) {
        const magic = String.fromCharCode(actualBytes[0], actualBytes[1], actualBytes[2], actualBytes[3]);
        if (magic !== '%PDF') {
          throw new Error('Invalid file format. Please upload a valid PDF document.');
        }
      }

      // Bug 3 fix: ensure PDF loading is fully awaited before iterating pages
      const pdf = await window.pdfjsLib.getDocument({ data: actualBytes }).promise;

      if (!pdf || pdf.numPages === 0) {
        throw new Error('The PDF appears to be empty or could not be read.');
      }

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Bug 4 fix: track how many pages were successfully rendered
      let renderedPages = 0;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // Bug 4 fix: await the render promise before converting to blob
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        // Bug 4 fix: await the blob conversion to ensure it completes before adding to zip
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error(`Failed to render page ${i} to image.`));
            },
            'image/jpeg',
            0.9
          );
        });

        zip.file(`page_${i}.jpg`, blob);
        renderedPages++;

        if (typeof window.showProgress === 'function') window.showProgress((i / pdf.numPages) * 90);
      }

      // Bug 4 fix: validate that at least one page was rendered before reporting success
      if (renderedPages === 0) {
        throw new Error('No pages could be converted to images.');
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Bug 4 fix: validate zip blob size > 0 before triggering download
      if (!zipBlob || zipBlob.size === 0) {
        throw new Error('Failed to create image archive: output is empty.');
      }

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFileName + '_images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke the object URL after a short delay to free memory
      setTimeout(() => URL.revokeObjectURL(url), 100);

      if (typeof showSuccess === 'function') showSuccess('PDF converted to images!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
