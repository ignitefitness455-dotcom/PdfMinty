import { setupToolUI } from '../utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'merge',
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into a single document',
    icon: window.PdfMinty.ICONS.merge || '📄',
    actionText: '🔗 Merge PDFs',
    isMultiFile: true,
    onApply: async ({ filesArray }) => {
      if (filesArray.length < 2) {
        if (typeof showError === 'function') showError('Please add at least 2 PDFs to merge.');
        throw new Error('Need more files');
      }

      let mergedPdfBytes;
      if (typeof window.runPdfWorkerTask === 'function') {
        const payload = { files: [] };
        for (let i = 0; i < filesArray.length; i++) {
          let ab;
          if (filesArray[i].id && window.pdfDB) {
            try {
              ab = await window.pdfDB.getFile(filesArray[i].id);
            } catch (err) {
              console.error(err);
            }
          }
          if (!ab) ab = await filesArray[i].fileObj.arrayBuffer();
          payload.files.push(new Uint8Array(ab));
        }
        const transferables = payload.files.map((arr) => arr.buffer);
        mergedPdfBytes = await window.runPdfWorkerTask('merge', payload, transferables);
      } else {
        const { PDFDocument } = await import('pdf-lib');
        const mergedPdf = await PDFDocument.create();
        for (let i = 0; i < filesArray.length; i++) {
          let fileBytes;
          if (filesArray[i].id && window.pdfDB) {
            try {
              fileBytes = await window.pdfDB.getFile(filesArray[i].id);
            } catch (err) {
              console.error(err);
            }
          }
          if (!fileBytes) fileBytes = await filesArray[i].fileObj.arrayBuffer();
          let pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          for (let j = 0; j < copiedPages.length; j++) {
            mergedPdf.addPage(copiedPages[j]);
          }
        }
        mergedPdfBytes = await mergedPdf.save({ useObjectStreams: true });
      }

      if (typeof downloadFile === 'function') {
        downloadFile(mergedPdfBytes, 'merged-document.pdf');
      }
      if (typeof showSuccess === 'function') showSuccess('PDFs merged successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
