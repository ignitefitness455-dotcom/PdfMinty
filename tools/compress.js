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
    toolId: 'compress',
    title: 'Compress PDF',
    description: 'Reduce file size by converting pages to optimized JPEG images',
    icon: ICONS.compress || '📄',
    actionText: '🗜️ Compress PDF',
    isMultiFile: false,
    instructions: [
      'Upload the PDF file you wish to compress.',
      'Wait for the file to load and be read.',
      'Click 🗜️ Compress PDF to reduce the file size.',
      'The optimized PDF will be downloaded automatically.'
    ],
    settingsHtml: `
       <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Compression Level</label>
          <select id="compressionLevel" class="input-field" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: var(--surface); color: var(--text);">
              <option value="high">High (Smaller size, lower quality)</option>
              <option value="medium" selected>Medium (Good balance)</option>
              <option value="low">Low (Larger size, higher quality)</option>
          </select>
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      
      if (typeof window.pdfjsLib === 'undefined') {
         const { loadExternalScript } = await import('../src/utils/fileUtils.js');
         await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
         window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      
      const compLevel = document.getElementById('compressionLevel').value;
      
      let scale = 1.5;
      let quality = 0.7;
      
      if (compLevel === 'high') {
         scale = 1.0;
         quality = 0.5;
      } else if (compLevel === 'low') {
         scale = 2.0;
         quality = 0.85;
      }

      showProgress(10);

      const { PDFDocument } = await import('pdf-lib');
      const pdf = await window.pdfjsLib.getDocument({ data: actualBytes }).promise;
      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
        const arrayBuffer = await blob.arrayBuffer();
        
        const image = await newPdfDoc.embedJpg(arrayBuffer);
        
        // original page dimensions
        const origViewport = page.getViewport({ scale: 1.0 });
        const newPage = newPdfDoc.addPage([origViewport.width, origViewport.height]);
        
        newPage.drawImage(image, {
           x: 0,
           y: 0,
           width: origViewport.width,
           height: origViewport.height,
        });

        showProgress(10 + (i / pdf.numPages) * 70);
      }

      const resultBytes = await newPdfDoc.save();

      downloadFile(resultBytes, currentFileName + '_compressed.pdf');
      
      showProgress(100);
      showSuccess('PDF compressed successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
