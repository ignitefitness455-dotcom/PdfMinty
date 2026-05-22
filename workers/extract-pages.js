import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeExtractPages(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const toExtract = new Set();
  for (let part of payload.rangesText.split(',')) {
    part = part.trim();
    if (!part) continue;
    if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number);
      if (s && e) {
        for (let i = s; i <= e; i++) toExtract.add(i);
      }
    } else if (!isNaN(Number(part))) {
      toExtract.add(Number(part));
    }
  }

  const indices = Array.from(toExtract)
    .sort((a, b) => a - b)
    .map((p) => p - 1)
    .filter((i) => i >= 0 && i < totalPages);
  if (indices.length === 0) throw new Error('No valid pages to extract');

  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(pdfDoc, indices);
  for (let i = 0; i < copied.length; i++) {
    newDoc.addPage(copied[i]);
    if (i % 50 === 0)
      postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (i / copied.length) * 80)),
      });
  }

  postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await newDoc.save({ useObjectStreams: true });
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.onmessage = async function (e) {
    const { id, payload } = e.data;
    try {
      const postMessage = (msg) => self.postMessage(msg);
      const result = await executeExtractPages(payload, postMessage);
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
