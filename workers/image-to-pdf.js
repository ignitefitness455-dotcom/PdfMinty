import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeImageToPdf(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < payload.files.length; i++) {
    const fileData = payload.files[i];
    let image;

    if (fileData.type === 'image/jpeg') {
      image = await pdfDoc.embedJpg(fileData.bytes);
    } else if (fileData.type === 'image/png') {
      image = await pdfDoc.embedPng(fileData.bytes);
    } else {
      continue;
    }

    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });

    postMessage({
      id: payload.id,
      status: 'progress',
      progress: Math.min(95, Math.round(10 + ((i + 1) / payload.files.length) * 80)),
    });
  }

  postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await pdfDoc.save({ useObjectStreams: true });
}
