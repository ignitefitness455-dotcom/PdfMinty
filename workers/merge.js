import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeMerge(payload, postMessage) {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < payload.files.length; i++) {
    let fileBytes = payload.files[i]; // Uint8Array
    let pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    
    postMessage({ 
      id: payload.id, 
      status: 'progress', 
      progress: Math.round(((i) / payload.files.length) * 40),
      type: 'progress',
      operation: 'merge',
      percent: Math.round(((i) / payload.files.length) * 40),
      label: `Loading file ${i + 1} of ${payload.files.length}`
    });

    const pageIndices = pdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
    
    for (let j = 0; j < copiedPages.length; j++) {
      mergedPdf.addPage(copiedPages[j]);
      if (copiedPages.length > 20 && j % 10 === 0) {
        let percent = 40 + Math.round(((i + (j / copiedPages.length)) / payload.files.length) * 50);
        postMessage({
          id: payload.id,
          status: 'progress',
          progress: percent,
          type: 'progress',
          operation: 'merge',
          percent: percent,
          label: `Merging page ${j + 1} of ${copiedPages.length} in file ${i + 1}`
        });
      }
    }

    postMessage({
      id: payload.id,
      status: 'progress',
      progress: Math.min(95, Math.round(((i + 1) / payload.files.length) * 90)),
      type: 'progress',
      operation: 'merge',
      percent: Math.min(95, Math.round(((i + 1) / payload.files.length) * 90)),
      label: `Merged file ${i + 1} of ${payload.files.length}`
    });
  }

  postMessage({ id: payload.id, status: 'progress', progress: 98, type: 'progress', operation: 'merge', percent: 98, label: 'Saving merged PDF...' });
  return await mergedPdf.save({ useObjectStreams: true });
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.onmessage = async function (e) {
    const { id, payload } = e.data;
    try {
      const postMessage = (msg) => self.postMessage(msg);
      const result = await executeMerge(payload, postMessage);
      if (result instanceof Uint8Array) {
        self.postMessage({ id, status: 'success', result }, [result.buffer]);
      } else {
        self.postMessage({ id, status: 'success', result });
      }
    } catch (err) {
      self.postMessage({
        id,
        status: 'error',
        error: {
          errorType: err.name || 'Error',
          message: err.message,
          stack: err.stack,
        },
      });
    }
  };
}
