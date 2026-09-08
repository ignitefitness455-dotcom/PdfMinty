/**
 * Trims excess transparent padding from a canvas context
 */
export function trimCanvas(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If completely empty canvas
  if (maxX < minX || maxY < minY) {
    return canvas.toDataURL('image/png');
  }

  // Add slight padding around signature
  const padding = 12;
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropW = Math.min(width - cropX, maxX - minX + padding * 2);
  const cropH = Math.min(height - cropY, maxY - minY + padding * 2);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropW;
  croppedCanvas.height = cropH;
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) return canvas.toDataURL('image/png');

  croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return croppedCanvas.toDataURL('image/png');
}

/**
 * Removes white / light paper background from an uploaded signature image
 */
export function removeBackgroundFromImage(
  dataUrl: string,
  threshold = 220
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        // Luminance formula
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness > threshold) {
          // Smooth transparency fade near threshold
          const diff = brightness - threshold;
          const maxDiff = 255 - threshold;
          const alphaFactor = 1 - diff / maxDiff;
          d[i + 3] = Math.floor(d[i + 3] * Math.max(0, Math.min(1, alphaFactor)));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(trimCanvas(canvas));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Generates a transparent PNG data URL from typed text with a given cursive font
 */
export function createTypedSignature(
  text: string,
  fontFamily: string,
  color: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `64px ${fontFamily}, cursive, sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return trimCanvas(canvas);
}
