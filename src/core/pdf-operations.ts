import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { PDFSanitizer } from './PDFSanitizer';
import { PDF_PAGE_SIZES, WATERMARK_DEFAULTS, PAGE_NUMBER_DEFAULTS } from '../config/constants';

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
    const padding = WATERMARK_DEFAULTS.PADDING;
    const maxBoundX = Math.max(padding, width - textWidth - padding);
    const maxBoundY = Math.max(padding, height - watermarkSize - padding);
    const clampedX = Math.max(padding, Math.min(x, maxBoundX));
    const clampedY = Math.max(padding, Math.min(y, maxBoundY));

    page.drawText(watermarkText, {
      x: clampedX,
      y: clampedY,
      font: helveticaBold,
      size: watermarkSize,
      color: rgb(WATERMARK_DEFAULTS.COLOR.r, WATERMARK_DEFAULTS.COLOR.g, WATERMARK_DEFAULTS.COLOR.b),
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
    const size = PAGE_NUMBER_DEFAULTS.FONT_SIZE;
    const margin = PAGE_NUMBER_DEFAULTS.MARGIN;
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

    page.drawText(labelText, { x, y, font: helvetica, size, color: rgb(PAGE_NUMBER_DEFAULTS.COLOR.r, PAGE_NUMBER_DEFAULTS.COLOR.g, PAGE_NUMBER_DEFAULTS.COLOR.b) });
  });
  return pdfDoc.save();
}

export interface AddBlankPayload {
  fileBytes: Uint8Array;
  blankPageSize: 'A4' | 'Letter' | 'Legal' | 'A3' | 'custom';
  customWidth?: number;
  customHeight?: number;
  blankPagePos: 'start' | 'end' | 'custom' | 'after';
  blankPageAt?: string | number;
}
export async function addBlankPagePDF(payload: AddBlankPayload) {
  const { fileBytes, blankPageSize, customWidth, customHeight, blankPagePos, blankPageAt } = payload;
  const pdfDoc = await loadPDF(fileBytes);
  const pageCount = pdfDoc.getPageCount();

  const sizes: Record<string, readonly [number, number]> = {
    A4: PDF_PAGE_SIZES.A4,
    Letter: PDF_PAGE_SIZES.LETTER,
    Legal: PDF_PAGE_SIZES.LEGAL,
    A3: PDF_PAGE_SIZES.A3,
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
  if (blankPagePos === 'start') {
    insertionIndex = 0;
  } else if (blankPagePos === 'custom') {
    const customIdx = typeof blankPageAt === 'number' ? blankPageAt : parseInt(blankPageAt || '1', 10);
    if (!isNaN(customIdx)) insertionIndex = Math.max(0, Math.min(customIdx - 1, pageCount));
  } else if (blankPagePos === 'after') {
    const customIdx = typeof blankPageAt === 'number' ? blankPageAt : parseInt(blankPageAt || '1', 10);
    if (!isNaN(customIdx)) insertionIndex = Math.max(0, Math.min(customIdx, pageCount));
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
  const sizes: Record<string, readonly [number, number]> = {
    A4: PDF_PAGE_SIZES.A4,
    Letter: PDF_PAGE_SIZES.LETTER,
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

  // Handle quality preset modes for Lossless Metadata & Structural Optimization
  if (quality === 'high') {
    // Aggressive Metadata Pruning: Completely wipe all identifiers
    try { pdfDoc.setTitle(''); } catch (_) {}
    try { pdfDoc.setAuthor(''); } catch (_) {}
    try { pdfDoc.setSubject(''); } catch (_) {}
    try { pdfDoc.setCreator(''); } catch (_) {}
    try { pdfDoc.setProducer('PDFMinty Lossless'); } catch (_) {}
    try { pdfDoc.setCreationDate(new Date('1970-01-01T00:00:00Z')); } catch (_) {}
    try { pdfDoc.setModificationDate(new Date('1970-01-01T00:00:00Z')); } catch (_) {}
  } else if (quality === 'medium') {
    // Recommended Lossless Optimization: Wipe tracks, preserve standard dates and basic structures
    try { pdfDoc.setSubject(''); } catch (_) {}
    try { pdfDoc.setCreator(''); } catch (_) {}
    try { pdfDoc.setProducer('PDFMinty'); } catch (_) {}
    try { pdfDoc.setModificationDate(new Date()); } catch (_) {}
  } else {
    // Standard Stream Compression: Kept simple with minimal modifications
    try { pdfDoc.setProducer('PDFMinty Standard'); } catch (_) {}
    try { pdfDoc.setModificationDate(new Date()); } catch (_) {}
  }

  // Compress structural streams with useObjectStreams
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

  // 1. Generate a modern, beautiful valid PDF warning envelope
  const pDoc = await PDFDocument.create();
  const page = pDoc.addPage([600, 400]);
  const helveticaBold = await pDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pDoc.embedFont(StandardFonts.Helvetica);

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 600,
    height: 400,
    color: rgb(0.97, 0.98, 1.0),
  });

  // Border card
  page.drawRectangle({
    x: 40,
    y: 110,
    width: 520,
    height: 220,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1.5,
  });

  // Locked Banner Title
  page.drawText("🔒 Secured with PdfMinty AES-256", {
    x: 60,
    y: 290,
    size: 20,
    font: helveticaBold,
    color: rgb(0.06, 0.09, 0.16),
  });

  // Subtitle
  page.drawText("This PDF document is protected using military-grade client-side encryption (AES-256-GCM).", {
    x: 60,
    y: 255,
    size: 10,
    font: helvetica,
    color: rgb(0.35, 0.4, 0.5),
  });

  // Explainer Title
  page.drawText("To access and decrypt this document, please follow these steps:", {
    x: 60,
    y: 225,
    size: 11,
    font: helveticaBold,
    color: rgb(0.2, 0.25, 0.35),
  });

  // Step 1
  page.drawText("1. Visit the PdfMinty standard application (https://pdfminty.com).", {
    x: 80,
    y: 200,
    size: 10.5,
    font: helvetica,
    color: rgb(0.3, 0.35, 0.45),
  });

  // Step 2
  page.drawText("2. Select the 'Unlock PDF' tool from the primary dashboard.", {
    x: 80,
    y: 180,
    size: 10.5,
    font: helvetica,
    color: rgb(0.3, 0.35, 0.45),
  });

  // Step 3
  page.drawText("3. Upload/drop this secure envelope PDF and enter your lock password.", {
    x: 80,
    y: 160,
    size: 10.5,
    font: helvetica,
    color: rgb(0.3, 0.35, 0.45),
  });

  // Footer metadata
  page.drawText("4. Download the original decrypted version. Processed entirely client-side.", {
    x: 80,
    y: 140,
    size: 10.5,
    font: helvetica,
    color: rgb(0.3, 0.35, 0.45),
  });

  page.drawText("Privacy Policy: Zero data leaves your device. Content remains completely encrypted offline.", {
    x: 60,
    y: 60,
    size: 9.5,
    font: helvetica,
    color: rgb(0.45, 0.5, 0.6),
  });

  const envelopePdfBytes = await pDoc.save();

  // 2. Encrypt the original PDF raw bytes with AES-GCM
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

  // 3. Construct standard composite file (envelope PDF bytes + crypt footer block)
  // Layout from start: [envelopePdfBytes] ... [saltBytes (16)] [ivBytes (12)] [encryptedBytes (encLen)] [encLen (4)] [magic 'MINTY' (5)]
  const encLen = encryptedBytes.length;
  const footerSize = 16 + 12 + encLen + 4 + 5;
  const footerBytes = new Uint8Array(footerSize);

  footerBytes.set(saltBytes, 0); // Offset 0, length 16
  footerBytes.set(ivBytes, 16);  // Offset 16, length 12
  footerBytes.set(encryptedBytes, 28); // Offset 28, length encLen

  // Set the 32-bit big-endian length of encryptedBytes
  const view = new DataView(footerBytes.buffer, footerBytes.byteOffset + 16 + 12 + encLen, 4);
  view.setUint32(0, encLen, false); // false = big-endian

  // Set magic bytes 'MINTY' at the ultimate offset
  const magicOffset = 16 + 12 + encLen + 4;
  footerBytes[magicOffset]     = 77; // M
  footerBytes[magicOffset + 1] = 73; // I
  footerBytes[magicOffset + 2] = 78; // N
  footerBytes[magicOffset + 3] = 84; // T
  footerBytes[magicOffset + 4] = 89; // Y

  // Concatenate everything cleanly
  const outputBytes = new Uint8Array(envelopePdfBytes.length + footerBytes.length);
  outputBytes.set(envelopePdfBytes, 0);
  outputBytes.set(footerBytes, envelopePdfBytes.length);

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

  const len = fileBytes.length;
  if (len < 16 + 12 + 4 + 5) {
    throw new Error('Invalid protected file format or incorrect password.');
  }

  // Check magic bytes at the extreme trailing edge
  const magicPos = len - 5;
  const isMinty = 
    fileBytes[magicPos] === 77 &&
    fileBytes[magicPos + 1] === 73 &&
    fileBytes[magicPos + 2] === 78 &&
    fileBytes[magicPos + 3] === 84 &&
    fileBytes[magicPos + 4] === 89;

  if (!isMinty) {
    throw new Error('NOT_MINTY_SECURED_LOCK');
  }

  // Retrieve encrypted length from the preceding 4-byte segment
  const view = new DataView(fileBytes.buffer, fileBytes.byteOffset + len - 9, 4);
  const encLen = view.getUint32(0, false);

  const startOfPayload = len - 9 - encLen - 12 - 16;
  if (startOfPayload < 0) {
    throw new Error('Invalid secure envelope structure.');
  }

  const saltBytes = fileBytes.slice(startOfPayload, startOfPayload + 16);
  const ivBytes = fileBytes.slice(startOfPayload + 16, startOfPayload + 28);
  const encryptedBytes = fileBytes.slice(startOfPayload + 28, startOfPayload + 28 + encLen);

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
