import { PDFDocument as PDFDocumentEncrypt } from '@cantoo/pdf-lib';
import { PDFDocument as PlainPDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
// @ts-expect-error - Vite will bundle the worker from the package and return its URL path
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { PDF_PAGE_SIZES, WATERMARK_DEFAULTS, PAGE_NUMBER_DEFAULTS } from '../config/constants';

import { PDFSanitizer } from './PDFSanitizer';

let pdfjsLib: any = null;

const loadPdfjs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
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
    if (err.message.includes('encrypted')) {
      throw new Error('This PDF is password protected. Please unlock it first.');
    }
    if (err.message.includes('Invalid index')) {
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
  try {
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
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 2 - text.length * size * 0.28,
        y: height / 2,
        size,
        font,
        color: rgb(rVal, gVal, bVal),
        opacity,
        rotate: degrees(rot),
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
    const skipFirstPage = options?.skipFirstPage || PAGE_NUMBER_DEFAULTS.skipFirstPage;
    let currentCount = options?.startFrom || PAGE_NUMBER_DEFAULTS.startFrom;

    for (let idx = 0; idx < total; idx++) {
      if (skipFirstPage && idx === 0) continue;

      const page = pages[idx];
      const { width } = page.getSize();
      const text = format
        .replace('{n}', currentCount.toString())
        .replace('{total}', total.toString());

      page.drawText(text, {
        x: width - 120, // Simplified bottom-right logic
        y: 20,
        size: 10,
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
    const size = PDF_PAGE_SIZES[pageSizeKey] || PDF_PAGE_SIZES.A4;

    if (position === 'start') {
      pdfDoc.insertPage(0, [size[0], size[1]]);
    } else if (position === 'end') {
      pdfDoc.addPage([size[0], size[1]]);
    } else {
      const targetIdx = Math.max(0, Math.min(position - 1, pdfDoc.getPageCount()));
      pdfDoc.insertPage(targetIdx, [size[0], size[1]]);
    }

    return await pdfDoc.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to add a blank page.');
  }
}

export async function imagesToPDF(
  imageBlobs: { buf: Uint8Array; type: string }[],
  options?: { pageSize?: keyof typeof PDF_PAGE_SIZES }
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PlainPDFDocument.create();

    for (const file of imageBlobs) {
      let embeddedImg;
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        embeddedImg = await pdfDoc.embedJpg(file.buf);
      } else if (file.type === 'image/png') {
        embeddedImg = await pdfDoc.embedPng(file.buf);
      } else {
        throw new Error(`Unsupported image format: ${file.type}. Please use JPG or PNG.`);
      }

      const dims = embeddedImg.scale(1.0);
      const page = pdfDoc.addPage([dims.width, dims.height]);
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: dims.width,
        height: dims.height,
      });
    }

    return await pdfDoc.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to build PDF from images.');
  }
}

export async function compressPDF(
  bytes: Uint8Array,
  level: 'basic' | 'maximum' = 'basic'
): Promise<Uint8Array> {
  const pdfDoc = await loadPlainPDF(bytes);
  try {
    if (level === 'maximum') {
      // More aggressive: compress object streams + hint objects per tick
      return await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });
    }
    // Basic: object stream compression only (faster)
    return await pdfDoc.save({ useObjectStreams: true });
  } catch (err) {
    handlePdfLibError(err, 'Failed to compress document streams.');
    throw err;
  }
}

export async function protectPDF(payload: {
  fileBytes: Uint8Array;
  userPassword: string;
}): Promise<Uint8Array> {
  try {
    // skip encryption check parsing normally, since we WANT to allow protecting a clean doc
    const { bytes: safeBytes } = PDFSanitizer.sanitize(payload.fileBytes, {
      skipEncryptionCheck: true,
    });

    // MUST use PDFDocumentEncrypt here for encryption
    const pdfDoc = await PDFDocumentEncrypt.load(safeBytes);

    pdfDoc.encrypt({
      userPassword: payload.userPassword,
      ownerPassword: payload.userPassword + '_owner',
      permissions: {
        modifying: false,
        printing: 'highResolution',
        copying: false,
      },
    });

    return await pdfDoc.save();
  } catch (err) {
    handlePdfLibError(err, 'Failed to encrypt document with password.');
  }
}

export async function unlockPDF(payload: {
  fileBytes: Uint8Array;
  password: string;
}): Promise<Uint8Array> {
  try {
    const { bytes: safeBytes } = PDFSanitizer.sanitize(payload.fileBytes, {
      skipEncryptionCheck: true,
    });

    // MUST use PDFDocumentEncrypt here, not plain PDFDocument — plain pdf-lib cannot decrypt. See project history.
    const pdfDoc = await PDFDocumentEncrypt.load(safeBytes, {
      password: payload.password,
      ignoreEncryption: true, // Decrypt mode
    });

    return await pdfDoc.save(); // save it stripped of encryption
  } catch (err) {
    console.error('Unlock Error:', err);
    throw new Error(
      'Failed to decrypt document. The password might be incorrect or the format is unsupported.'
    );
  }
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

      let canvas, context;
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
        await page.render({ canvasContext: context as any, viewport }).promise;
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
  } catch (err: any) {
    console.error('Export images failed:', err);
    throw new Error(
      err?.message ||
        'Error occurred during PDF parsing. Encrypted documents are not supported for canvas extraction.'
    );
  }
}
