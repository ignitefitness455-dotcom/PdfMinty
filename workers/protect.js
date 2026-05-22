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
