import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { PDFSanitizer } from './PDFSanitizer';
import { PDF_PAGE_SIZES, WATERMARK_DEFAULTS, PAGE_NUMBER_DEFAULTS } from '../config/constants';

export async function loadPDF(bytes: Uint8Array, options?: any) {
  const skipEncryptionCheck = options?.ignoreEncryption === true;
  const sanitized = PDFSanitizer.sanitize(bytes, { skipEncryptionCheck });
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

const hasNonLatin = (text: string) => /[^\u0000-\u007F]/.test(text);

async function getWatermarkFont(pdfDoc: PDFDocument, text: string) {
  if (hasNonLatin(text)) {
    try {
      // Load Noto Sans subset (Bengali + Latin) — ~150KB
      // Host this in your /public folder
      const fontBytes = await fetch('/fonts/NotoSans-subset.ttf')
        .then(r => r.arrayBuffer());
      return await pdfDoc.embedFont(fontBytes);
    } catch (e) {
      console.error("Failed to fetch NotoSans Unicode font, falling back to HelveticaBold:", e);
    }
  }
  return await pdfDoc.embedFont(StandardFonts.HelveticaBold);
}

export async function watermarkPDF(payload: WatermarkPayload) {
  const { fileBytes, watermarkText, watermarkOpacity, watermarkSize, watermarkRotation } = payload;
  if (!watermarkText || watermarkText.trim() === '') {
    throw new Error('Watermark text cannot be empty.');
  }

  const pdfDoc = await loadPDF(fileBytes);
  const pages = pdfDoc.getPages();
  const watermarkFont = await getWatermarkFont(pdfDoc, watermarkText);

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    
    let textWidth = watermarkText.length * (watermarkSize * 0.6);
    try {
      textWidth = watermarkFont.widthOfTextAtSize(watermarkText, watermarkSize);
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
      font: watermarkFont,
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
function resolveInsertIndex(
  position: 'start' | 'end' | 'after' | 'custom',
  customPage: number,  // 1-based, user-provided
  totalPages: number
): number {
  switch (position) {
    case 'start':  return 0;
    case 'end':    return totalPages;
    case 'after':  return Math.min(customPage, totalPages); // insert after page N
    case 'custom': return Math.min(Math.max(customPage - 1, 0), totalPages);
    default:       return totalPages;
  }
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

  const customPageNum = typeof blankPageAt === 'number'
    ? blankPageAt
    : parseInt(blankPageAt || '1', 10);

  const insertionIndex = resolveInsertIndex(
    blankPagePos,
    isNaN(customPageNum) ? 1 : customPageNum,
    pageCount
  );

  pdfDoc.insertPage(insertionIndex, [w, h]);
  return pdfDoc.save();
}

function createCanvas(width: number, height: number): any {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  throw new Error('Canvas creation fallback is not available in web worker context without OffscreenCanvas support.');
}

function canvasToBlob(canvas: any, type: string, quality?: number): Promise<Blob> {
  if (typeof canvas.convertToBlob === 'function') {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob conversion returned null.'));
        }
      }, type, quality);
    } else {
      reject(new Error('Canvas toBlob is not supported in this environment.'));
    }
  });
}

async function normalizeImageToPng(bytes: Uint8Array, type: string, name: string): Promise<{ bytes: Uint8Array; type: string }> {
  const t = (type || '').toLowerCase();
  const n = (name || '').toLowerCase();
  const isWebP = t === 'image/webp' || n.endsWith('.webp');
  const isGif = t === 'image/gif' || n.endsWith('.gif');
  if (isWebP || isGif) {
    const blob = new Blob([bytes as any], { type: isWebP ? 'image/webp' : 'image/gif' });
    const bitmap = await createImageBitmap(blob);
    const canvas = createCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    const pngBlob = await canvasToBlob(canvas, 'image/png');
    return {
      bytes: new Uint8Array(await pngBlob.arrayBuffer()),
      type: 'image/png'
    };
  }
  return { bytes, type };
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
    const { bytes, type } = await normalizeImageToPng(item.bytes, item.type, item.name);
    const nameLower = item.name.toLowerCase();

    if (type === 'image/png' || nameLower.endsWith('.png') || nameLower.endsWith('.webp') || nameLower.endsWith('.gif')) {
      embeddedImage = await pdfDoc.embedPng(bytes);
    } else if (type === 'image/jpeg' || type === 'image/jpg' || nameLower.match(/\.(jpg|jpeg)$/)) {
      embeddedImage = await pdfDoc.embedJpg(bytes);
    } else {
      throw new Error(`Unsupported image format: ${item.name}. Only PNG, JPEG, and WebP are supported.`);
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

const QUALITY_SETTINGS = {
  high:   { scale: 0.5, jpegQuality: 0.6, dpi: 96  },
  medium: { scale: 0.7, jpegQuality: 0.8, dpi: 150 },
  low:    { scale: 0.9, jpegQuality: 0.92, dpi: 200 },
};

let cachedPdfJs: any = null;
async function getPdfJsLibrary() {
  if (cachedPdfJs) return cachedPdfJs;
  const pdfjs = await import("pdfjs-dist");
  try {
    const workerUrl = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  } catch (err) {
    console.warn("Failed to load local PDF.js worker in operations; falling back to CDN.", err);
    pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs";
  }
  cachedPdfJs = pdfjs;
  return pdfjs;
}

export interface CompressPayload {
  fileBytes: Uint8Array;
  quality: 'low' | 'medium' | 'high' | 'metadata';
}
export async function compressPDF(payload: CompressPayload): Promise<Uint8Array> {
  const { fileBytes, quality } = payload;

  // Clone the bytes to a pristine array to ensure fallback works even if PDF.js detaches/transfers the original buffer
  const backupBytes = fileBytes.slice(0);

  if (quality === 'metadata') {
    const pdfDoc = await loadPDF(backupBytes, { ignoreEncryption: true });
    try { pdfDoc.setTitle(''); } catch (_) {}
    try { pdfDoc.setAuthor(''); } catch (_) {}
    try { pdfDoc.setSubject(''); } catch (_) {}
    try { pdfDoc.setCreator(''); } catch (_) {}
    try { pdfDoc.setProducer('PDFMinty Lossless'); } catch (_) {}
    try { pdfDoc.setCreationDate(new Date('1970-01-01T00:00:00Z')); } catch (_) {}
    try { pdfDoc.setModificationDate(new Date('1970-01-01T00:00:00Z')); } catch (_) {}
    return await pdfDoc.save({ useObjectStreams: true });
  }

  const settings = QUALITY_SETTINGS[quality] || QUALITY_SETTINGS.medium;

  try {
    const pdfjsLib = await getPdfJsLibrary();
    const pdfjsDoc = await pdfjsLib.getDocument({
      data: fileBytes,
      useSystemFonts: true,
    }).promise;

    const newDoc = await PDFDocument.create();

    for (let i = 1; i <= pdfjsDoc.numPages; i++) {
       const page = await pdfjsDoc.getPage(i);
       const viewport = page.getViewport({ scale: settings.scale });

       const canvas = createCanvas(
         Math.floor(viewport.width),
         Math.floor(viewport.height)
       );
       const ctx = canvas.getContext('2d')!;

       await page.render({ canvasContext: ctx as any, viewport }).promise;

       const blob = await canvasToBlob(canvas, 'image/jpeg', settings.jpegQuality);

       const imgBytes = new Uint8Array(await blob.arrayBuffer());
       const jpgImage = await newDoc.embedJpg(imgBytes);

       const origWidth = viewport.width / settings.scale;
       const origHeight = viewport.height / settings.scale;

       const newPage = newDoc.addPage([origWidth, origHeight]);
       newPage.drawImage(jpgImage, {
         x: 0,
         y: 0,
         width: origWidth,
         height: origHeight
       });

       // Memory cleanup for GPU/Canvas buffer release
       canvas.width = 0;
       canvas.height = 0;
     }

     try { newDoc.setProducer('PDFMinty Compressed'); } catch (_) {}
     try { newDoc.setModificationDate(new Date()); } catch (_) {}

     return await newDoc.save({ useObjectStreams: true });
  } catch (err: any) {
    console.error("Raster compression failed, falling back to lossless structural compression:", err);
    // Safe lossless fallback if offscreencanvas rendering is restricted, utilizing authentic backup bytes
    const pdfDoc = await loadPDF(backupBytes, { ignoreEncryption: true });
    try { pdfDoc.setProducer('PDFMinty Fallback'); } catch (_) {}
    return await pdfDoc.save({ useObjectStreams: true });
  }
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
export async function protectPDF(payload: ProtectPayload): Promise<Uint8Array> {
  const { fileBytes, userPassword, ownerPassword } = payload;
  if (!userPassword || userPassword.length < 1) {
    throw new Error('Password cannot be empty.');
  }

  const pdfDoc = await loadPDF(fileBytes, { ignoreEncryption: true });

  // pdf-lib native encryption (ISO 32000 compliant)
  const savedBytes = await pdfDoc.save({
    userPassword: userPassword,
    ownerPassword: ownerPassword ?? userPassword + '_owner',
    permissions: {
      printing: 'lowResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  } as any);

  return savedBytes;
}

export interface UnlockPayload {
  fileBytes: Uint8Array;
  password: string;
}
export async function unlockPDF(payload: UnlockPayload): Promise<Uint8Array> {
  const { fileBytes, password } = payload;
  try {
    const pdfDoc = await loadPDF(fileBytes, { password, ignoreEncryption: true });
    return await pdfDoc.save();
  } catch (err: any) {
    const msg = err?.message || "";
    if (
      msg.toLowerCase().includes("password") ||
      msg.toLowerCase().includes("decrypt") ||
      msg.toLowerCase().includes("encrypt")
    ) {
      throw new Error("Incorrect password or invalid security credentials. Please verify the password and try again.");
    }
    throw err;
  }
}
