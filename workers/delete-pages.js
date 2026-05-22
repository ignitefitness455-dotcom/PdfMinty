import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeDeletePages(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const toDelete = new Set();
  for (let part of payload.rangesText.split(',')) {
    part = part.trim();
    if (!part) continue;
    if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number);
      if (s && e) {
        for (let i = s; i <= e; i++) toDelete.add(i);
      }
    } else if (!isNaN(Number(part))) {
      toDelete.add(Number(part));
    }
  }

  const indices = Array.from(toDelete)
    .sort((a, b) => b - a)
    .map((p) => p - 1);

  for (const idx of indices) {
    if (idx >= 0 && idx < totalPages) {
      pdfDoc.removePage(idx);
    }
  }

  postMessage({ id: payload.id, status: 'progress', progress: 80 });
  return await pdfDoc.save({ useObjectStreams: true });
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.onmessage = async function (e) {
    const { id, payload } = e.data;
    try {
      const postMessage = (msg) => self.postMessage(msg);
      const result = await executeDeletePages(payload, postMessage);
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
