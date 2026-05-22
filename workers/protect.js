import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeProtect(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes); // Cannot use ignoreEncryption inside protect because we want to preserve or just load
  const resultBytes = await pdfDoc.save({
    useObjectStreams: true,
    userPassword: payload.password,
    ownerPassword: payload.password,
    permissions: { printing: 'highResolution', modifying: false, copying: false },
  });
  postMessage({ id: payload.id, status: 'progress', progress: 100 });
  return resultBytes;
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.onmessage = async function (e) {
    const { id, payload } = e.data;
    try {
      const postMessage = (msg) => self.postMessage(msg);
      const result = await executeProtect(payload, postMessage);
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
