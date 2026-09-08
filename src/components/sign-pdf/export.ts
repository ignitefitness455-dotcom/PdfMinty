import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import { PlacedField } from './types';

/**
 * Converts Hex color string (#RRGGBB) to pdf-lib rgb() color
 */
function hexToPdfRgb(hex: string) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return rgb(0.07, 0.1, 0.15); // default dark charcoal

  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

/**
 * Converts a base64 Data URL to Uint8Array
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates a PNG data URL for a crisp vector checkmark
 */
function createCheckmarkDataUrl(color = '#059669'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(24, 62);
  ctx.lineTo(48, 88);
  ctx.lineTo(96, 32);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

/**
 * Exports signed PDF by embedding fields into original PDF document
 */
export async function exportSignedPdf(
  originalPdfBytes: Uint8Array,
  placedFields: PlacedField[]
): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const pages = pdfDoc.getPages();
  const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Group fields by pageNumber (1-indexed)
  for (const field of placedFields) {
    const pageIndex = field.pageNumber - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const page = pages[pageIndex];
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Calculate PDF coordinates (PDF origin (0,0) is bottom-left, web is top-left)
    const fieldPdfX = (field.x / 100) * pageWidth;
    const fieldPdfWidth = field.width;
    const fieldPdfHeight = field.height;
    const fieldPdfY = pageHeight - (field.y / 100) * pageHeight - fieldPdfHeight;

    if (field.type === 'signature' || field.type === 'initials') {
      if (!field.value) continue;
      try {
        const imageBytes = dataUrlToUint8Array(field.value);
        let embeddedImage;
        if (field.value.startsWith('data:image/jpeg') || field.value.startsWith('data:image/jpg')) {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        }

        page.drawImage(embeddedImage, {
          x: fieldPdfX,
          y: fieldPdfY,
          width: fieldPdfWidth,
          height: fieldPdfHeight,
        });
      } catch (err) {
        console.error('Failed to embed signature into PDF:', err);
      }
    } else if (field.type === 'checkmark') {
      try {
        const checkmarkDataUrl = createCheckmarkDataUrl(field.color || '#059669');
        const checkmarkBytes = dataUrlToUint8Array(checkmarkDataUrl);
        const embeddedImage = await pdfDoc.embedPng(checkmarkBytes);

        page.drawImage(embeddedImage, {
          x: fieldPdfX,
          y: fieldPdfY,
          width: fieldPdfWidth,
          height: fieldPdfHeight,
        });
      } catch (err) {
        console.error('Failed to embed checkmark into PDF:', err);
      }
    } else if (field.type === 'text' || field.type === 'date') {
      if (!field.value) continue;
      const fontSize = field.fontSize || (field.type === 'date' ? 12 : 14);
      const textColor = hexToPdfRgb(field.color || '#111827');

      // Vertically center text in field bounding box
      const textY = fieldPdfY + Math.max(2, (fieldPdfHeight - fontSize) / 2);

      page.drawText(field.value, {
        x: fieldPdfX + 4,
        y: textY,
        size: fontSize,
        font: standardFont,
        color: textColor,
      });
    }
  }

  const modifiedBytes = await pdfDoc.save();
  return new Blob([modifiedBytes], { type: 'application/pdf' });
}
