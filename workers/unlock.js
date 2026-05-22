import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeUnlock(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { password: payload.password });

  postMessage({ id: payload.id, status: 'progress', progress: 50 });
  return await pdfDoc.save({ useObjectStreams: true }); // By default, save doesn't encrypt unless options provided
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.onmessage = async function (e) {
    const { id, payload } = e.data;
    try {
      const postMessage = (msg) => self.postMessage(msg);
      const result = await executeUnlock(payload, postMessage);
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
