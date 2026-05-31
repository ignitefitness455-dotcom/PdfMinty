import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { PDFSanitizer } from './PDFSanitizer';

export async function loadPDF(bytes: Uint8Array, options?: any) {
  const sanitized = PDFSanitizer.sanitize(bytes);
  return await PDFDocument.load(sanitized.bytes, options);
}

export interface MergePayload {
  files: Uint8Array[];
}
export async function mergePDFs({ files }: MergePayload) {
  const mergedPdf = await PDFDocument.create();
  for (const fileBytes of files) {
    const pdfDoc = await loadPDF(fileBytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return mergedPdf.save();
}

export interface SplitPayload {
  fileBytes: Uint8Array;
  targetPageIndices: number[];
}
export async function splitPDF({ fileBytes, targetPageIndices }: SplitPayload) {
  const srcDoc = await loadPDF(fileBytes);
  const splitPdf = await PDFDocument.create();
  const copiedPages = await splitPdf.copyPages(srcDoc, targetPageIndices);
  copiedPages.forEach(p => splitPdf.addPage(p));
  return splitPdf.save();
}

export interface SplitMultiPayload {
  fileBytes: Uint8Array;
  ranges: { start: number; end: number; name?: string }[];
}
export async function splitPDFMulti({ fileBytes, ranges }: SplitMultiPayload) {
  const srcDoc = await loadPDF(fileBytes);
  const totalPages = srcDoc.getPageCount();
  const results: { name: string; bytes: Uint8Array }[] = [];

  for (const range of ranges) {
    if (range.start < 0 || range.end >= totalPages || range.start > range.end) {
      throw new Error(`Invalid range: ${range.start + 1} to ${range.end + 1}`);
    }
    const indices = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i);
    const splitPdf = await PDFDocument.create();
    const copiedPages = await splitPdf.copyPages(srcDoc, indices);
    copiedPages.forEach(p => splitPdf.addPage(p));
    const bytes = await splitPdf.save();
    results.push({ name: range.name || `split-${range.start + 1}-${range.end + 1}.pdf`, bytes });
  }
  return results;
}

export interface RotatePayload {
  fileBytes: Uint8Array;
  pageRotations: { index: number; rotation: 0 | 90 | 180 | 270 }[];
}
export async function rotatePDF({ fileBytes, pageRotations }: RotatePayload) {
  const pdfDoc = await loadPDF(fileBytes);
  const pages = pdfDoc.getPages();
  pageRotations.forEach((item) => {
    if (item.index < pages.length) {
      // Normalize rotation input to valid multiples of 90 degrees
      const normalizedValue = Math.round(item.rotation / 90) * 90;
      const cleanRot = ((normalizedValue % 360) + 360) % 360;
      if (cleanRot === 90 || cleanRot === 180 || cleanRot === 270 || cleanRot === 0) {
        const existing = pages[item.index].getRotation().angle;
        const target = (existing + cleanRot) % 360;
        pages[item.index].setRotation(degrees(target));
      }
    }
  });
  return pdfDoc.save();
}

export interface DeletePagesPayload {
  fileBytes: Uint8Array;
  pagesToDelete: number[];
}
export async function deletePagesPDF({ fileBytes, pagesToDelete }: DeletePagesPayload) {
  const pdfDoc = await loadPDF(fileBytes);
  const currentPages = pdfDoc.getPageCount();
  if (pagesToDelete.length >= currentPages) {
    throw new Error('Absolute protection rule: Cannot delete all pages in a document.');
  }
  const sorted = [...pagesToDelete].sort((a, b) => b - a);
  sorted.forEach((idx) => pdfDoc.removePage(idx));
  return pdfDoc.save();
}

export interface WatermarkPayload {
  fileBytes: Uint8Array;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkSize: number;
  watermarkRotation: number;
}
export async function watermarkPDF(payload: WatermarkPayload) {
  const { fileBytes, watermarkText, watermarkOpacity, watermarkSize, watermarkRotation } = payload;
  if (!watermarkText || watermarkText.trim() === '') {
    throw new Error('Watermark text cannot be empty.');
  }

  // Check for non-Latin / non-WinAnsi characters (e.g. CJK, Bangla, Cyrillic, Emojis)
  // WinAnsiEncoding covers standard printable ASCII and Western European extensions
  const hasNonLatin = /[^\x1f-\x7e\xa0-\xff]/.test(watermarkText);

  const pdfDoc = await loadPDF(fileBytes);
  const pages = pdfDoc.getPages();
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    
    let textWidth = watermarkText.length * (watermarkSize * 0.6);
    try {
      if (!hasNonLatin) {
        textWidth = helveticaBold.widthOfTextAtSize(watermarkText, watermarkSize);
      }
    } catch {
      // Silently fall back to rough estimate
    }

    const angleRad = (watermarkRotation * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const x = cx - (textWidth / 2) * Math.cos(angleRad) + (watermarkSize / 2) * Math.sin(angleRad);
    const y = cy - (textWidth / 2) * Math.sin(angleRad) - (watermarkSize / 2) * Math.cos(angleRad);

    // Safeguard-boundaries clamping with padding
    const padding = 20;
    const maxBoundX = Math.max(padding, width - textWidth - padding);
    const maxBoundY = Math.max(padding, height - watermarkSize - padding);
    const clampedX = Math.max(padding, Math.min(x, maxBoundX));
    const clampedY = Math.max(padding, Math.min(y, maxBoundY));

    page.drawText(watermarkText, {
      x: clampedX,
      y: clampedY,
      font: helveticaBold,
      size: watermarkSize,
      color: rgb(0.62, 0.68, 0.75),
      opacity: Math.max(0.05, Math.min(1, watermarkOpacity)),
      rotate: degrees(watermarkRotation),
    });
  });
  return pdfDoc.save();
}

export interface PageNumbersPayload {
  fileBytes: Uint8Array;
  pageNumberFormat: 'simple' | 'page-of' | 'page-x-of-y' | 'page-x' | 'x';
  pageNumberPosition: 'bottom-center' | 'top-center' | 'bottom-right' | 'bottom-left' | 'top-left' | 'top-right';
}
export async function addPageNumbersPDF(payload: PageNumbersPayload) {
  const { fileBytes, pageNumberFormat, pageNumberPosition } = payload;
  const pdfDoc = await loadPDF(fileBytes);
  const pages = pdfDoc.getPages();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    let labelText = `${idx + 1}`;
    if (pageNumberFormat === 'page-of' || pageNumberFormat === 'page-x-of-y') {
      labelText = `Page ${idx + 1} of ${pages.length}`;
    } else if (pageNumberFormat === 'page-x' || pageNumberFormat === 'simple') {
      labelText = `Page ${idx + 1}`;
    }
    const size = 10;
    const margin = 25;
    const textWidth = helvetica.widthOfTextAtSize(labelText, size);

    let x = width / 2 - textWidth / 2;
    let y = margin;

    switch (pageNumberPosition) {
      case 'top-left':
        x = margin;
        y = height - margin - size;
        break;
      case 'top-center':
        x = width / 2 - textWidth / 2;
        y = height - margin - size;
        break;
      case 'top-right':
        x = width - margin - textWidth;
        y = height - margin - size;
        break;
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'bottom-right':
        x = width - margin - textWidth;
        y = margin;
        break;
      case 'bottom-center':
      default:
        x = width / 2 - textWidth / 2;
        y = margin;
        break;
    }

    page.drawText(labelText, { x, y, font: helvetica, size, color: rgb(0.3, 0.4, 0.45) });
  });
  return pdfDoc.save();
}

export interface AddBlankPayload {
  fileBytes: Uint8Array;
  blankPageSize: 'A4' | 'Letter' | 'Legal' | 'A3' | 'custom';
  customWidth?: number;
  customHeight?: number;
  blankPagePos: 'start' | 'end' | 'custom';
  blankPageAt?: string;
}
export async function addBlankPagePDF(payload: AddBlankPayload) {
  const { fileBytes, blankPageSize, customWidth, customHeight, blankPagePos, blankPageAt } = payload;
  const pdfDoc = await loadPDF(fileBytes);
  const pageCount = pdfDoc.getPageCount();

  const sizes: Record<string, [number, number]> = {
    A4: [595.27, 841.89],
    Letter: [612, 792],
    Legal: [612, 1008],
    A3: [841.89, 1190.55],
  };

  let w: number;
  let h: number;
  if (blankPageSize === 'custom' && customWidth && customHeight) {
    w = customWidth;
    h = customHeight;
  } else {
    const matched = sizes[blankPageSize] || sizes.A4;
    w = matched[0];
    h = matched[1];
  }

  let insertionIndex = pageCount;
  if (blankPagePos === 'start') insertionIndex = 0;
  else if (blankPagePos === 'custom') {
    const customIdx = parseInt(blankPageAt || '1', 10);
    if (!isNaN(customIdx)) insertionIndex = Math.max(0, Math.min(customIdx - 1, pageCount));
  }

  pdfDoc.insertPage(insertionIndex, [w, h]);
  return pdfDoc.save();
}

export interface ImgToPdfPayload {
  imageFilesData: { bytes: Uint8Array; type: string; name: string }[];
  pageSize?: 'fit' | 'A4' | 'Letter';
}
export async function imagesToPDF(payload: ImgToPdfPayload) {
  const { imageFilesData, pageSize = 'fit' } = payload;
  if (!imageFilesData || imageFilesData.length === 0) {
    throw new Error('No images provided.');
  }
  const pdfDoc = await PDFDocument.create();
  const sizes: Record<string, [number, number]> = {
    A4: [595.27, 841.89],
    Letter: [612, 792],
  };

  for (const item of imageFilesData) {
    let embeddedImage;
    if (item.type === 'image/png' || item.name.toLowerCase().endsWith('.png')) {
      embeddedImage = await pdfDoc.embedPng(item.bytes);
    } else if (item.type === 'image/jpeg' || item.type === 'image/jpg' || item.name.toLowerCase().match(/\.(jpg|jpeg)$/)) {
      embeddedImage = await pdfDoc.embedJpg(item.bytes);
    } else {
      throw new Error(`Unsupported image format: ${item.name}. Only PNG and JPEG are supported.`);
    }

    let pageWidth = embeddedImage.width;
    let pageHeight = embeddedImage.height;
    let imgX = 0;
    let imgY = 0;
    let imgW = embeddedImage.width;
    let imgH = embeddedImage.height;

    if (pageSize !== 'fit' && sizes[pageSize]) {
      const [pw, ph] = sizes[pageSize];
      pageWidth = pw;
      pageHeight = ph;
      // Scale to fit with padding
      const scale = Math.min((pw - 40) / embeddedImage.width, (ph - 40) / embeddedImage.height);
      imgW = embeddedImage.width * scale;
      imgH = embeddedImage.height * scale;
      imgX = (pw - imgW) / 2;
      imgY = (ph - imgH) / 2;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImage, { x: imgX, y: imgY, width: imgW, height: imgH });
  }
  return pdfDoc.save();
}

export interface CompressPayload {
  fileBytes: Uint8Array;
  quality: 'low' | 'medium' | 'high';
}
export async function compressPDF(payload: CompressPayload) {
  const { fileBytes, quality } = payload;
  const pdfDoc = await loadPDF(fileBytes, { ignoreEncryption: true });

  // Remove metadata for all qualities
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setCreator('');
  pdfDoc.setProducer('PDFMinty');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  return pdfDoc.save({
    useObjectStreams: true,
  });
}

export interface ProtectPayload {
  fileBytes: Uint8Array;
  userPassword: string;
  ownerPassword?: string;
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
  };
}
export async function protectPDF(payload: ProtectPayload) {
  const { fileBytes, userPassword } = payload;
  if (!userPassword || userPassword.length < 1) {
    throw new Error('Password cannot be empty.');
  }

  const enc = new TextEncoder();
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const ivBytes = crypto.getRandomValues(new Uint8Array(12));

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(userPassword),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: ivBytes,
    },
    key,
    fileBytes as any,
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const outputBytes = new Uint8Array(
    saltBytes.length + ivBytes.length + encryptedBytes.length,
  );
  outputBytes.set(saltBytes, 0);
  outputBytes.set(ivBytes, saltBytes.length);
  outputBytes.set(encryptedBytes, saltBytes.length + ivBytes.length);
  return outputBytes;
}

export interface UnlockPayload {
  fileBytes: Uint8Array;
  password: string;
}
export async function unlockPDF(payload: UnlockPayload) {
  const { fileBytes, password } = payload;
  if (!password) {
    throw new Error('Password is required to unlock the PDF.');
  }

  if (fileBytes.length < 28) {
    throw new Error('Invalid protected file format or incorrect password.');
  }

  const saltBytes = fileBytes.slice(0, 16);
  const ivBytes = fileBytes.slice(16, 28);
  const encryptedBytes = fileBytes.slice(28);

  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes,
      },
      key,
      encryptedBytes as any,
    );

    const decryptedBytes = new Uint8Array(decryptedBuffer);

    // Basic PDF header verification
    if (
      decryptedBytes[0] !== 0x25 ||
      decryptedBytes[1] !== 0x50 ||
      decryptedBytes[2] !== 0x44 ||
      decryptedBytes[3] !== 0x46
    ) {
      throw new Error('Decrypted contents do not match standard PDF signatures.');
    }

    return decryptedBytes;
  } catch {
    throw new Error('Incorrect decryption key or corrupted data.');
  }
}
