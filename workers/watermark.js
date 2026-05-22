import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeWatermark(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { text, colorRgb, opacity, textSize, rotationDeg, position } = payload;
  const angle = rotationDeg * (Math.PI / 180);

  for (let k = 0; k < pages.length; k++) {
    const page = pages[k];
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, textSize);
    const textHeight = font.heightAtSize(textSize);

    // Calculate the center X
    const centerX = width / 2;

    // Calculate the center Y based on position
    let centerY = height / 2;
    if (position === 'top') {
      centerY = height - textHeight * 2;
    } else if (position === 'bottom') {
      centerY = textHeight * 2;
    }

    // Draw text rotated, roughly centered at (centerX, centerY)
    page.drawText(text, {
      x: centerX - (textWidth / 2) * Math.cos(angle) + (textHeight / 2) * Math.sin(angle),
      y: centerY - (textWidth / 2) * Math.sin(angle) - (textHeight / 2) * Math.cos(angle),
      size: textSize,
      font: font,
      color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
      opacity: opacity,
      rotate: degrees(rotationDeg),
    });

    if (k % 50 === 0)
      postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (k / pages.length) * 80)),
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
      const result = await executeWatermark(payload, postMessage);
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
