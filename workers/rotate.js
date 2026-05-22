import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeRotate(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const deg = payload.degree || 90;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + deg));
    if (i % 50 === 0)
      postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (i / pages.length) * 80)),
      });
  }

  postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await pdfDoc.save({ useObjectStreams: true });
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.onmessage = async function (e) {
    const { id, payload } = e.data;
    try {
      const postMessage = (msg) => self.postMessage(msg);
      const result = await executeRotate(payload, postMessage);
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
