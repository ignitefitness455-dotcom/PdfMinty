import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeReorder(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const srcDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const indices = payload.newOrder.map((p) => p - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, indices);

  for (let copyIdx = 0; copyIdx < copiedPages.length; copyIdx++) {
    newDoc.addPage(copiedPages[copyIdx]);
    if (copyIdx % 50 === 0)
      postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (copyIdx / copiedPages.length) * 80)),
      });
  }

  postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await newDoc.save({ useObjectStreams: true });
}
