import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeUnlock(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { password: payload.password });

  postMessage({ id: payload.id, status: 'progress', progress: 50 });
  return await pdfDoc.save({ useObjectStreams: true }); // By default, save doesn't encrypt unless options provided
}
