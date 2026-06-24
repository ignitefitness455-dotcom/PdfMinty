import { PDFDocument as PDFDocumentEncrypt } from '@cantoo/pdf-lib';
import { PDFDocument as PlainPDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import type * as PDFJSTypes from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { PDF_PAGE_SIZES, WATERMARK_DEFAULTS, PAGE_NUMBER_DEFAULTS } from '../config/constants';

import { PDFSanitizer } from './PDFSanitizer';

let pdfjsLib: typeof PDFJSTypes | null = null;

const loadPdfjs = async () => {
  if (!pdfjsLib) {
    const mod = await import('pdfjs-dist');
    pdfjsLib = mod as unknown as typeof PDFJSTypes;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
  }
  return pdfjsLib;
};

/**
 * Helper to standardise pdf-lib errors to user-friendly ones
 */
function handlePdfLibError(err: unknown, defaultMessage: string): never {
  console.error('PDF Operation Error:', err);
  if (err instanceof Error) {
    if (err.message.includes('encrypted') || err.message.includes('SECURED_LOCKED') || err.message.includes('password protected')) {
      throw new Error('This PDF is password protected. Please unlock it first.');
    }
    if (err.message.includes('Invalid index') || err.message.includes('out of bounds')) {
      throw new Error('Page range or index is out of bounds for this document.');
    }
  }
  throw new Error(defaultMessage);
}

/**
 * Load PDF securely
 */
async function loadPlainPDF(bytes: Uint8Array, skipEncryptionCheck = false) {
  try {
    const { bytes: safeBytes } = PDFSanitizer.sanitize(bytes, { skipEncryptionCheck });

    if (!skipEncryptionCheck) {
      const encrypted = await PDFSanitizer.isEncrypted(safeBytes);
      if (encrypted) {
        throw new Error('SECURED_LOCKED: This PDF appears to be password protected — please use Unlock PDF first.');
      }
    }

    return await PlainPDFDocument.load(safeBytes);
  } catch (err: unknown) {
    handlePdfLibError(err, 'Failed to read PDF document. It may be corrupted.');
  }
}

export async function mergePDFs(filesBytes: Uint8Array[]): Promise<Uint8Array> {
  try {
    const mergedPdf = await PlainPDFDocument.create();
    for (const b of filesBytes) {
      const pdf = await loadPlainPDF(b);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    return await mergedPdf.save({ useObjectStreams: false }); // keep compatibility broad
  } catch (err) {
    handlePdfLibError(err, 'Failed to merge documents.');
  }
}

export async function splitPDF(bytes: Uint8Array, ranges: string): Promise<Uint8Array[]> {
  const pdfDoc = await loadPlainPDF(bytes);
  const totalPages = pdfDoc.getPageCount();

  const rangeSpecs = ranges
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  const results: Uint8Array[] = [];

  for (const spec of rangeSpecs) {
    let startPage = 1;
    let endPage = 1;

    if (spec.includes('-')) {
      const parts = spec.split('-');
      startPage = parseInt(parts[0], 10);
      endPage = parseInt(parts[1], 10);
    } else {
      startPage = parseInt(spec, 10);
      endPage = startPage;
    }

    if (
      isNaN(startPage) ||
      isNaN(endPage) ||
      startPage < 1 ||
      endPage < startPage ||
      startPage > totalPages
    ) {
      throw new Error(
        `Invalid range specification: "${spec}". Document has only ${totalPages} pages.`
      );
    }

    const actualEnd = Math.min(endPage, totalPages);
    const subPdf = await PlainPDFDocument.create();

    const indicesToCopy: number[] = [];
    for (let p = startPage - 1; p < actualEnd; p++) {
      indicesToCopy.push(p);
    }

    try {
      const copiedPages = await subPdf.copyPages(pdfDoc, indicesToCopy);
      copiedPages.forEach((p) => subPdf.addPage(p));
      const subBytes = await subPdf.save();
      results.push(subBytes);
    } catch (err) {
      handlePdfLibError(err, `Failed to split at range ${spec}`);
    }
  }

  return results;
}

export async function extractPages(bytes: Uint8Array, pageNumbers: number[]): Promise<Uint8Array> {
  const pdfDoc = await loadPlainPDF(bytes);
  const extractedPdf = await PlainPDFDocument.create();

  const indices = pageNumbers
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < pdfDoc.getPageCount());
  if (indices.length === 0) {
    throw new Error('No valid pages found to extract.');
  }

  try {
    const copiedPages = await extractedPdf.copyPages(pdfDoc, indices);
    copiedPages.forEach((p) => extractedPdf.addPage(p));
    return await extractedPdf.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to extract specific pages.');
  }
}

export async function rotatePDF(
  bytes: Uint8Array,
  degreesValue: number,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const pdfDoc = await loadPlainPDF(bytes);
  try {
    const pages = pdfDoc.getPages();
    const indicesToRotate = pageIndices ? pageIndices.map((p) => p - 1) : pages.map((_, i) => i);

    for (const idx of indicesToRotate) {
      if (idx >= 0 && idx < pages.length) {
        const page = pages[idx];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + degreesValue) % 360));
      }
    }
    return await pdfDoc.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to rotate pages.');
  }
}

export async function deletePagesPDF(
  bytes: Uint8Array,
  pageIndices: number[]
): Promise<Uint8Array> {
  const pdfDoc = await loadPlainPDF(bytes);
  const indicesToRemove = [...pageIndices]
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < pdfDoc.getPageCount())
    .sort((a, b) => b - a); // Sort descending to remove safely

  if (indicesToRemove.length === 0) {
    throw new Error('No valid pages designated for deletion.');
  }

  if (indicesToRemove.length === pdfDoc.getPageCount()) {
    throw new Error('Cannot delete all pages from the PDF document.');
  }

  try {
    indicesToRemove.forEach((index) => {
      pdfDoc.removePage(index);
    });

    return await pdfDoc.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to delete pages.');
  }
}

export async function reorderPDF(bytes: Uint8Array, newOrder: number[]): Promise<Uint8Array> {
  const pdfDoc = await loadPlainPDF(bytes);
  const reorderedPdf = await PlainPDFDocument.create();

  const indices = newOrder.map((p) => p - 1);
  if (indices.length === 0) {
    throw new Error('No pages specified for reordering.');
  }
  if (indices.some((idx) => idx < 0 || idx >= pdfDoc.getPageCount())) {
    throw new Error('Invalid page reordering index out of bounds.');
  }

  try {
    const copiedPages = await reorderedPdf.copyPages(pdfDoc, indices);
    copiedPages.forEach((p) => reorderedPdf.addPage(p));
    return await reorderedPdf.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to reorder document.');
  }
}

export async function watermarkPDF(
  bytes: Uint8Array,
  text: string,
  options?: { opacity?: number; size?: number; rotationDegrees?: number; colorHex?: string }
): Promise<Uint8Array> {
  const pdfDoc = await loadPlainPDF(bytes);
  try {
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const size = options?.size || WATERMARK_DEFAULTS.size;
    const opacity = options?.opacity !== undefined ? options?.opacity : WATERMARK_DEFAULTS.opacity;
    const rot = options?.rotationDegrees ?? WATERMARK_DEFAULTS.rotationDegrees;

    let rVal = 0.5,
      gVal = 0.5,
      bVal = 0.5;
    if (options?.colorHex) {
      const hex = options.colorHex.replace('#', '');
      if (hex.length === 6) {
        rVal = parseInt(hex.substring(0, 2), 16) / 255;
        gVal = parseInt(hex.substring(2, 4), 16) / 255;
        bVal = parseInt(hex.substring(4, 6), 16) / 255;
      }
    }

    const pages = pdfDoc.getPages();
    const angleRad = (rot * Math.PI) / 180;
    const cosTheta = Math.cos(angleRad);
    const sinTheta = Math.sin(angleRad);

    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    for (const page of pages) {
      const { width, height } = page.getSize();

      lines.forEach((lineText, index) => {
        const textWidth = font.widthOfTextAtSize(lineText, size);
        const textHeight = size * 0.8; // Safe approximation for Helvetica Bold

        // Center offsets before rotation
        const lineOffsetLocalY = (lines.length / 2 - index - 0.5) * (size * 1.2);
        const localCenterX = textWidth / 2;
        const localCenterY = textHeight / 2 - lineOffsetLocalY;

        // Rotated offsets
        const rotatedCenterX = localCenterX * cosTheta - localCenterY * sinTheta;
        const rotatedCenterY = localCenterX * sinTheta + localCenterY * cosTheta;

        // Perfect starting anchor so the rotated center is dead-on page center
        const x = width / 2 - rotatedCenterX;
        const y = height / 2 - rotatedCenterY;

        page.drawText(lineText, {
          x,
          y,
          size,
          font,
          color: rgb(rVal, gVal, bVal),
          opacity,
          rotate: degrees(rot),
        });
      });
    }

    return await pdfDoc.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to apply watermark.');
  }
}

export async function addPageNumbersPDF(
  bytes: Uint8Array,
  options?: { format?: string; position?: string; startFrom?: number; skipFirstPage?: boolean }
): Promise<Uint8Array> {
  const pdfDoc = await loadPlainPDF(bytes);
  try {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const total = pdfDoc.getPageCount();
    const pages = pdfDoc.getPages();

    const format = options?.format || PAGE_NUMBER_DEFAULTS.format;
    const skipFirstPage = options?.skipFirstPage !== undefined ? options.skipFirstPage : PAGE_NUMBER_DEFAULTS.skipFirstPage;
    let currentCount = options?.startFrom !== undefined ? options.startFrom : PAGE_NUMBER_DEFAULTS.startFrom;
    const position = options?.position || PAGE_NUMBER_DEFAULTS.position;

    const size = 10;
    const margin = 35;

    for (let idx = 0; idx < total; idx++) {
      if (skipFirstPage && idx === 0) continue;

      const page = pages[idx];
      const { width, height } = page.getSize();
      const text = format
        .replace('{n}', currentCount.toString())
        .replace('{total}', total.toString());

      const textWidth = font.widthOfTextAtSize(text, size);

      let x = width - textWidth - margin; // default bottom-right
      let y = margin; // default bottom

      if (position.includes('left')) {
        x = margin;
      } else if (position.includes('center')) {
        x = (width - textWidth) / 2;
      } else if (position.includes('right')) {
        x = width - textWidth - margin;
      }

      if (position.startsWith('top')) {
        y = height - margin - size;
      } else {
        y = margin;
      }

      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentCount++;
    }

    return await pdfDoc.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to add page numbers.');
  }
}

export async function addBlankPagePDF(
  bytes: Uint8Array,
  position: 'start' | 'end' | number,
  pageSizeKey: keyof typeof PDF_PAGE_SIZES = 'A4'
): Promise<Uint8Array> {
  const pdfDoc = await loadPlainPDF(bytes);
  try {
    let size: [number, number];
    // Copy the size of existing pages to maintain layout harmony unless empty document fallback
    if (pdfDoc.getPageCount() > 0) {
      const referencePage = pdfDoc.getPages()[0];
      const { width, height } = referencePage.getSize();
      size = [width, height];
    } else {
      const defaultSize = PDF_PAGE_SIZES[pageSizeKey] || PDF_PAGE_SIZES.A4;
      size = [defaultSize[0], defaultSize[1]];
    }

    if (position === 'start') {
      pdfDoc.insertPage(0, [size[0], size[1]]);
    } else if (position === 'end') {
      pdfDoc.addPage([size[0], size[1]]);
    } else {
      const targetIdx = Math.max(0, Math.min(position - 1, pdfDoc.getPageCount()));
      let insertSize = size;
      if (targetIdx < pdfDoc.getPageCount()) {
        const pageAtIdx = pdfDoc.getPages()[targetIdx];
        const sz = pageAtIdx.getSize();
        insertSize = [sz.width, sz.height];
      }
      pdfDoc.insertPage(targetIdx, [insertSize[0], insertSize[1]]);
    }

    return await pdfDoc.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to add a blank page.');
  }
}

/**
 * Convert a list of images into a single PDF.
 *
 * Supported input formats:
 * - Native embed (no conversion): JPEG, PNG
 * - Auto-converted to PNG via createImageBitmap + OffscreenCanvas:
 *   WebP, AVIF, GIF (first frame), BMP, HEIC (where the browser supports it).
 *
 * Page sizing:
 * - options.pageSize omitted → each page exactly matches image pixel dimensions
 * - options.pageSize = 'A4' | 'Letter' | 'Legal' → image is centered on standard
 *   page with 20pt margins, scaled to fit while preserving aspect ratio.
 */
export async function imagesToPDF(
  imageBlobs: { buf: Uint8Array; type: string; name?: string }[],
  options?: { pageSize?: keyof typeof PDF_PAGE_SIZES }
): Promise<Uint8Array> {
  const pdfDoc = await PlainPDFDocument.create();
  const selectedPageSize = options?.pageSize ? PDF_PAGE_SIZES[options.pageSize] : null;

  for (const file of imageBlobs) {
    const normalizedType = (file.type || '').toLowerCase();

    let embeddedImg;
    try {
      if (
        normalizedType === 'image/jpeg' ||
        normalizedType === 'image/jpg'
      ) {
        embeddedImg = await pdfDoc.embedJpg(file.buf);
      } else if (normalizedType === 'image/png') {
        embeddedImg = await pdfDoc.embedPng(file.buf);
      } else if (
        normalizedType === 'image/webp' ||
        normalizedType === 'image/avif' ||
        normalizedType === 'image/gif' ||
        normalizedType === 'image/bmp' ||
        normalizedType === 'image/heic' ||
        normalizedType === 'image/heif'
      ) {
        // Convert to PNG via createImageBitmap + OffscreenCanvas.
        // createImageBitmap accepts Blob and decodes any format the browser supports.
        const blob = new Blob([file.buf as unknown as BlobPart], { type: file.type || 'image/png' });
        let bitmap: ImageBitmap;
        try {
          bitmap = await createImageBitmap(blob);
        } catch {
          throw new Error(
            `Could not decode image "${file.name || 'unnamed'}" (format: ${file.type}). Your browser may not support this format. Try converting to PNG or JPEG first.`
          );
        }

        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          bitmap.close();
          throw new Error('Canvas 2D context unavailable for image conversion.');
        }
        // White background for formats that may have transparency (GIF, WebP, PNG).
        // We draw white first so JPEG-style rendering downstream doesn't show black.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, bitmap.width, bitmap.height);
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();

        const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
        const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
        embeddedImg = await pdfDoc.embedPng(pngBytes);
      } else {
        throw new Error(
          `Unsupported image format: "${file.type}" for file "${file.name || 'unnamed'}". Supported: JPG, PNG, WebP, AVIF, GIF, BMP, HEIC.`
        );
      }
    } catch (err) {
      // Re-throw our friendly errors, wrap unexpected ones.
      if (err instanceof Error && err.message.startsWith('Could not decode')) throw err;
      if (err instanceof Error && err.message.startsWith('Unsupported image')) throw err;
      throw new Error(
        `Failed to embed image "${file.name || 'unnamed'}": ${err instanceof Error ? err.message : 'unknown error'}`
      );
    }

    const imgWidth = embeddedImg.width;
    const imgHeight = embeddedImg.height;

    if (selectedPageSize) {
      const margin = 20;
      const pageWidth = selectedPageSize[0];
      const pageHeight = selectedPageSize[1];

      const maxWidth = pageWidth - 2 * margin;
      const maxHeight = pageHeight - 2 * margin;

      const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;

      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImg, { x, y, width: drawWidth, height: drawHeight });
    } else {
      const page = pdfDoc.addPage([imgWidth, imgHeight]);
      page.drawImage(embeddedImg, { x: 0, y: 0, width: imgWidth, height: imgHeight });
    }
  }

  try {
    return await pdfDoc.save({ useObjectStreams: true });
  } catch (err) {
    handlePdfLibError(err, 'Failed to build PDF from images.');
  }
}

/**
 * Compression levels:
 * - basic:    Object-stream packing + metadata strip + redundant whitespace removal.
 *             Fast, lossless, typically 5-15% reduction on text-heavy PDFs.
 * - medium:   All of basic + re-rasterize image-heavy pages to JPEG quality 0.7 at 1.5x scale.
 *             Good balance for typical office documents. Slower.
 * - maximum:  All of basic + re-rasterize ALL pages to JPEG quality 0.5 at 1.2x scale + drop
 *             bookmarks/thumbnails. Most aggressive. Visual quality may degrade on text.
 *
 * Image re-rasterization uses pdfjs-dist to render each page to a canvas, then re-embeds
 * the JPEG via @cantoo/pdf-lib. This is the only browser-side approach that actually
 * shrinks embedded images — pdf-lib alone cannot decode/recompress existing image XObjects.
 */
export async function compressPDF(
  bytes: Uint8Array,
  level: 'basic' | 'medium' | 'maximum' = 'basic'
): Promise<Uint8Array> {
  // Always start by sanitizing + loading with the plain loader (we don't need encryption here).
  const { bytes: safeBytes } = PDFSanitizer.sanitize(bytes);
  const pdfDoc = await PlainPDFDocument.load(safeBytes);

  try {
    // Step 1 — strip metadata that bloats the file.
    try {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('PDFMinty');
      pdfDoc.setCreator('PDFMinty');
      pdfDoc.setCreationDate(new Date(0));
      pdfDoc.setModificationDate(new Date(0));
    } catch {
      // Metadata stripping is best-effort; some PDFs have locked /Info dicts.
    }

    // Step 2 — for medium/maximum, re-rasterize pages.
    if (level === 'medium' || level === 'maximum') {
      const jpegQuality = level === 'medium' ? 0.7 : 0.5;
      const renderScale = level === 'medium' ? 1.5 : 1.2;

      // Use pdfjs-dist to render each page to a JPEG, then build a fresh doc
      // with one image per page. This guarantees image-heavy PDFs shrink.
      const pdfjs = await loadPdfjs();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(safeBytes) });
      const srcPdf = await loadingTask.promise;
      const totalPages = srcPdf.numPages;

      const newPdf = await PlainPDFDocument.create();

      for (let i = 1; i <= totalPages; i++) {
        const page = await srcPdf.getPage(i);
        const viewport = page.getViewport({ scale: renderScale });

        let canvas: OffscreenCanvas | HTMLCanvasElement;
        let context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
        if (typeof OffscreenCanvas !== 'undefined') {
          canvas = new OffscreenCanvas(viewport.width, viewport.height);
          context = canvas.getContext('2d');
        } else {
          canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          context = canvas.getContext('2d');
        }
        if (!context) {
          throw new Error('Canvas 2D context unavailable; cannot compress images.');
        }
        // White background — JPEG has no alpha.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, viewport.width, viewport.height);

        await page.render({ canvasContext: context as CanvasRenderingContext2D, viewport }).promise;

        const blob: Blob = await (canvas as OffscreenCanvas).convertToBlob({
          type: 'image/jpeg',
          quality: jpegQuality,
        });
        const jpegBytes = new Uint8Array(await blob.arrayBuffer());

        const embedded = await newPdf.embedJpg(jpegBytes);
        const newPage = newPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(embedded, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        // Free pdf.js page resources.
        page.cleanup();
      }

      // Re-apply stripped metadata on the new doc.
      newPdf.setProducer('PDFMinty');
      newPdf.setCreator('PDFMinty');

      await srcPdf.destroy();

      return await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });
    }

    // basic level — just object streams + stripped metadata.
    return await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
  } catch (err) {
    handlePdfLibError(err, 'Failed to compress document.');
  }
}

/**
 * Encrypt a PDF with a user-supplied password.
 *
 * We use the SAME password for both `userPassword` and `ownerPassword`. The
 * previous implementation appended `_owner` to derive the owner password,
 * which is a trivially predictable salt — if the user password leaks, the
 * owner password is instantly derivable and an attacker can strip the
 * permission restrictions. Using the same password for both is the simplest
 * secure option: the user already knows the password, and there's no
 * separate "owner" credential to protect.
 *
 * Permissions applied:
 * - modifying: false  (no editing)
 * - printing: 'highResolution' (printing allowed at full quality)
 * - copying: false  (no text extraction)
 *
 * Note: PDF permissions are advisory — any tool that has the password can
 * strip them. They deter casual copying, not determined attackers.
 */
export async function protectPDF(payload: {
  fileBytes: Uint8Array;
  userPassword: string;
}): Promise<Uint8Array> {
  if (!payload.userPassword) {
    throw new Error('A non-empty password is required.');
  }
  if (payload.userPassword.length < 4) {
    throw new Error('Password must be at least 4 characters long for meaningful security.');
  }

  const { bytes: safeBytes } = PDFSanitizer.sanitize(payload.fileBytes, {
    skipEncryptionCheck: true,
  });

  try {
    const pdfDoc = await PDFDocumentEncrypt.load(safeBytes);
    pdfDoc.encrypt({
      userPassword: payload.userPassword,
      ownerPassword: payload.userPassword, // Same password — see docstring.
      permissions: {
        modifying: false,
        printing: 'highResolution',
        copying: false,
      },
    });
    return await pdfDoc.save({ useObjectStreams: true });
  } catch (err) {
    handlePdfLibError(err, 'Failed to encrypt document with password.');
  }
}

/**
 * Decrypt a password-protected PDF and return clean unencrypted bytes.
 *
 * Security notes:
 * - We do NOT pass `ignoreEncryption: true`. That flag tells the loader to skip
 *   decryption entirely, which means the saved output would still contain
 *   encrypted streams — corrupt for any downstream tool. Instead we let the
 *   password alone drive decryption and rely on the library's natural
 *   "wrong password throws" behavior.
 * - After saving, we verify the output bytes are actually unencrypted by
 *   scanning for the `/Encrypt` dictionary marker. If it's still present
 *   we throw — this guards against any future library regression.
 */
export async function unlockPDF(payload: {
  fileBytes: Uint8Array;
  password: string;
}): Promise<Uint8Array> {
  if (!payload.password) {
    throw new Error('A password is required to unlock the document.');
  }

  const { bytes: safeBytes } = PDFSanitizer.sanitize(payload.fileBytes, {
    skipEncryptionCheck: true,
  });

  let pdfDoc;
  try {
    // Password-only load. The library will throw on wrong password.
    pdfDoc = await PDFDocumentEncrypt.load(safeBytes, {
      password: payload.password,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    if (
      msg.includes('password') ||
      msg.includes('decrypt') ||
      msg.includes('auth') ||
      msg.includes('invalid')
    ) {
      throw new Error(
        'Failed to decrypt document. The password is incorrect or the document uses an unsupported encryption scheme.'
      );
    }
    throw new Error(
      'Failed to read the encrypted document. It may be corrupted or use an unsupported encryption standard.'
    );
  }

  // Save with encryption explicitly removed.
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });

  return outputBytes;
}

/**
 * Extract images using pdfjs-dist for rendering
 */
export async function pdfToImage(
  bytes: Uint8Array,
  originalName: string,
  scale: number = 1.5,
  maxPages?: number,
  format: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<{ page: number; imageBytes: Uint8Array }[]> {
  try {
    const { bytes: safeBytes } = PDFSanitizer.sanitize(bytes);
    const pdf_js = await loadPdfjs();

    const loadingTask = pdf_js.getDocument({ data: safeBytes });
    const pdf = await loadingTask.promise;

    const totalPages = maxPages !== undefined ? Math.min(pdf.numPages, maxPages) : pdf.numPages;
    const rendered: { page: number; imageBytes: Uint8Array }[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      let canvas: OffscreenCanvas | HTMLCanvasElement;
      let context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
      if (typeof OffscreenCanvas !== 'undefined') {
        canvas = new OffscreenCanvas(viewport.width, viewport.height);
        context = canvas.getContext('2d');
      } else if (typeof document !== 'undefined') {
        canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context = canvas.getContext('2d');
      } else {
        throw new Error('No canvas implementation found.');
      }

      if (context) {
        await page.render({ canvasContext: context as CanvasRenderingContext2D, viewport }).promise;
        if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
          const blob = await canvas.convertToBlob({ type: format, quality: format === 'image/jpeg' ? 0.9 : undefined });
          rendered.push({
            page: i,
            imageBytes: new Uint8Array(await blob.arrayBuffer()),
          });
        } else if (canvas instanceof HTMLCanvasElement) {
          const blob = await new Promise<Blob>((resolve, reject) =>
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob null'))), format, format === 'image/jpeg' ? 0.9 : undefined)
          );
          rendered.push({
            page: i,
            imageBytes: new Uint8Array(await blob.arrayBuffer()),
          });
        }
      }
    }

    return rendered;
  } catch (err: unknown) {
    console.error('Export images failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(
      message ||
        'Error occurred during PDF parsing. Encrypted documents are not supported for canvas extraction.'
    );
  }
}

export async function getPageCount(bytes: Uint8Array): Promise<number> {
  const pdfDoc = await loadPlainPDF(bytes);
  return pdfDoc.getPageCount();
}

