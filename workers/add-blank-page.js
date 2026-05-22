import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeAddBlankPage(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });

  for (let i = 0; i < payload.count; i++) {
    pdfDoc.insertPage(payload.insertIndex + i, payload.dims);
  }

  postMessage({ id: payload.id, status: 'progress', progress: 80 });
  return await pdfDoc.save({ useObjectStreams: true });
}
