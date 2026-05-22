import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeAddPageNumbers(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { position, format, size, margin, colorRgb } = payload;

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const { width, height } = page.getSize();
    const pageNum = index + 1;

    let text = String(pageNum);
    if (format === 'page_1') text = `Page ${pageNum}`;
    else if (format === '1_of_n') text = `${pageNum} of ${totalPages}`;
    else if (format === 'page_1_of_n') text = `Page ${pageNum} of ${totalPages}`;
    else if (format === '-1-') text = `- ${pageNum} -`;

    const textWidth = font.widthOfTextAtSize(text, size);

    let x, y;

    if (position.includes('left')) x = margin;
    else if (position.includes('right')) x = width - margin - textWidth;
    else x = width / 2 - textWidth / 2; // center

    if (position.includes('top')) y = height - margin - size;
    else y = margin; // bottom

    page.drawText(text, {
      x: x,
      y: y,
      size: size,
      font: font,
      color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
    });

    if (index % 50 === 0)
      postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (index / pages.length) * 80)),
      });
  }

  postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await pdfDoc.save({ useObjectStreams: true });
}
