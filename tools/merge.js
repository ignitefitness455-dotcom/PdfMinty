import { ICONS } from "../src/ui/icons.js";
import { downloadFile } from '../src/utils/fileUtils.js';
import { runPdfWorkerTask } from '../src/core/WorkerManager.js';
import { db } from '../src/core/Database.js';
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
    icon: ICONS.merge || '📄',
    actionText: '🔗 Merge PDFs',
    isMultiFile: true,
    instructions: [
      'Click or drag and drop to select multiple PDF files.',
      'Add more files using the ➕ Add More button if needed.',
      'Click the 🔗 Merge PDFs button to combine all files.',
      'The merged PDF will begin downloading automatically.'
    ],
    onApply: async ({ filesArray }) => {
      if (filesArray.length < 2) {
        if (typeof window.showError === 'function') window.showError('Please add at least 2 PDFs to merge.');
        throw new Error('Need more files');
      }

      let mergedPdfBytes;
      if (typeof runPdfWorkerTask !== 'undefined') {
        const payload = { files: [] };
        for (let i = 0; i < filesArray.length; i++) {
          let ab;
          if (filesArray[i].id && db) {
            try {
              ab = await db.getFile(filesArray[i].id);
            } catch (err) {
              console.error(err);
            }
          }
          if (!ab) {
            ab = await new Promise((resolve, reject) => {
              if (filesArray[i].fileObj.arrayBuffer) {
                filesArray[i].fileObj.arrayBuffer().then(resolve).catch(reject);
              } else {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(filesArray[i].fileObj);
              }
            });
          }
          payload.files.push(new Uint8Array(ab));
        }
        const transferables = payload.files.map((arr) => arr.buffer);
        mergedPdfBytes = await runPdfWorkerTask('merge', payload, transferables);
      } else {
        const { PDFDocument } = await import('pdf-lib');
        const mergedPdf = await PDFDocument.create();
        for (let i = 0; i < filesArray.length; i++) {
          let fileBytes;
          if (filesArray[i].id && db) {
            try {
              fileBytes = await db.getFile(filesArray[i].id);
            } catch (err) {
              console.error(err);
            }
          }
          if (!fileBytes) {
            fileBytes = await new Promise((resolve, reject) => {
              if (filesArray[i].fileObj.arrayBuffer) {
                filesArray[i].fileObj.arrayBuffer().then(resolve).catch(reject);
              } else {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(filesArray[i].fileObj);
              }
            });
          }
          let pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          for (let j = 0; j < copiedPages.length; j++) {
            mergedPdf.addPage(copiedPages[j]);
          }
        }
        mergedPdfBytes = await mergedPdf.save({ useObjectStreams: true });
      }

      if (typeof window.downloadFile === 'function') {
        downloadFile(mergedPdfBytes, 'merged-document.pdf');
      }
      if (typeof window.showSuccess === 'function') window.showSuccess('PDFs merged successfully!');
    },
  });
}


export function destroy() {
  // Cleanup logic here if necessary
}
