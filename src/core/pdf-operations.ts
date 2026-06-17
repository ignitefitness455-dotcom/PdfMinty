import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { PDFDocument as PDFDocumentEncrypt } from "@cantoo/pdf-lib";
import { PDFSanitizer } from "./PDFSanitizer";
import { PDF_PAGE_SIZES, WATERMARK_DEFAULTS, PAGE_NUMBER_DEFAULTS, PDFJS_WORKER_SRC } from "../config/constants";

/**
 * Helper to securely load and validate PDF bytes.
 * Sanitizes input first and checks encryption based on ignoreEncryption flag.
 */
export async function loadPDF(
  bytes: Uint8Array,
  options?: { ignoreEncryption?: boolean; password?: string }
): Promise<PDFDocument> {
  const { bytes: sanitizedBytes } = PDFSanitizer.sanitize(bytes);
  if (!options?.ignoreEncryption) {
    PDFSanitizer.validate(sanitizedBytes);
  } else {
    try {
      PDFSanitizer.validate(sanitizedBytes);
    } catch (err: any) {
      if (err.name !== "EncryptedPDFError" && err.message !== "SECURED_LOCKED") {
        throw err;
      }
    }
  }
  return await PDFDocument.load(sanitizedBytes, options);
}

/**
 * 1. Merges multiple PDF files into a single PDF document.
 * mergePDFs({ files: Uint8Array[] }) or mergePDFs(files: Uint8Array[])
 */
export async function mergePDFs(
  arg: { files: Uint8Array[] } | Uint8Array[]
): Promise<Uint8Array> {
  const files = Array.isArray(arg) ? arg : arg.files;
  const mergedPdf = await PDFDocument.create();
  
  for (const fileBytes of files) {
    const pdf = await loadPDF(fileBytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }
  
  mergedPdf.setProducer("PDFMinty");
  mergedPdf.setCreator("PDFMinty Client-Side Sandbox");
  return await mergedPdf.save({ useObjectStreams: true });
}

/**
 * 2. Splits a PDF document by extracting specified page indices.
 * splitPDF({ fileBytes, targetPageIndices }) or splitPDF(fileBytes, targetPageIndices)
 */
export async function splitPDF(
  arg1: { fileBytes: Uint8Array; targetPageIndices: number[] } | Uint8Array,
  arg2?: number[]
): Promise<Uint8Array> {
  const { fileBytes, targetPageIndices } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, targetPageIndices: arg2! }
    : arg1;

  const srcDoc = await loadPDF(fileBytes);
  const subPdf = await PDFDocument.create();
  const copiedPages = await subPdf.copyPages(srcDoc, targetPageIndices);
  for (const page of copiedPages) {
    subPdf.addPage(page);
  }
  subPdf.setProducer("PDFMinty");
  return await subPdf.save({ useObjectStreams: true });
}

export const extractPDFPages = splitPDF;

/**
 * 3. Splits a PDF document into multiple sub-documents based on specified page ranges.
 * splitPDFMulti({ fileBytes, ranges: {start, end, name?}[] }) or splitPDFMulti(fileBytes, ranges)
 */
export async function splitPDFMulti(
  arg1: { fileBytes: Uint8Array; ranges: Array<{ start: number; end: number; name?: string }> } | Uint8Array,
  arg2?: Array<{ start: number; end: number; name?: string }>
): Promise<Array<{ name: string; bytes: Uint8Array }>> {
  const { fileBytes, ranges } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, ranges: arg2! }
    : arg1;

  const srcDoc = await loadPDF(fileBytes);
  const totalPages = srcDoc.getPageCount();
  const results: Array<{ name: string; bytes: Uint8Array }> = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const name = range.name || `part_${i + 1}.pdf`;

    if (range.start < 0 || range.end >= totalPages || range.start > range.end) {
      throw new Error(
        `Invalid page range: range ${range.start + 1}-${range.end + 1} is out of bounds (total pages: ${totalPages})`
      );
    }

    const subPdf = await PDFDocument.create();
    const pageIndices: number[] = [];
    for (let p = range.start; p <= range.end; p++) {
      pageIndices.push(p);
    }
    const copiedPages = await subPdf.copyPages(srcDoc, pageIndices);
    for (const page of copiedPages) {
      subPdf.addPage(page);
    }
    subPdf.setProducer("PDFMinty");
    const bytes = await subPdf.save({ useObjectStreams: true });
    results.push({ name, bytes });
  }

  return results;
}

export const splitMultiPDF = splitPDFMulti;

/**
 * 4. Rotates specific pages of a PDF document by a given degree interval (multiples of 90).
 * rotatePDF({ fileBytes, pageRotations }) or rotatePDF(fileBytes, pageRotations)
 */
export async function rotatePDF(
  arg1: { fileBytes: Uint8Array; pageRotations?: Array<{ index: number; rotation: number }>; rotations?: Array<{ index: number; rotation: number }> } | Uint8Array,
  arg2?: Array<{ index: number; rotation: number }>
): Promise<Uint8Array> {
  const { fileBytes, pageRotations } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, pageRotations: arg2! }
    : { fileBytes: arg1.fileBytes, pageRotations: arg1.pageRotations || (arg1 as any).rotations };

  const pdfDoc = await loadPDF(fileBytes);
  const pages = pdfDoc.getPages();

  for (const item of pageRotations || []) {
    if (item.rotation % 90 !== 0) {
      throw new Error(`Rotation must be a multiple of 90 degrees (got ${item.rotation})`);
    }
    if (item.index >= 0 && item.index < pages.length) {
      const page = pages[item.index];
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + item.rotation) % 360;
      page.setRotation(degrees(newRotation < 0 ? newRotation + 360 : newRotation));
    }
  }

  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * 5. Removes specific pages from the PDF file.
 * deletePagesPDF({ fileBytes, pageIndices }) or deletePagesPDF(fileBytes, pageIndices)
 */
export async function deletePagesPDF(
  arg1: { fileBytes: Uint8Array; pageIndices: number[] } | Uint8Array,
  arg2?: number[]
): Promise<Uint8Array> {
  const { fileBytes, pageIndices } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, pageIndices: arg2! }
    : arg1;

  const srcDoc = await loadPDF(fileBytes);
  const totalPages = srcDoc.getPageCount();
  const removeSet = new Set(pageIndices);
  const keepIndices: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    if (!removeSet.has(i)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error("Cannot delete all pages from a PDF document.");
  }

  const subPdf = await PDFDocument.create();
  const copiedPages = await subPdf.copyPages(srcDoc, keepIndices);
  for (const page of copiedPages) {
    subPdf.addPage(page);
  }
  subPdf.setProducer("PDFMinty");
  return await subPdf.save({ useObjectStreams: true });
}

/**
 * 6. Inserts a customizable visual watermark on all pages of a PDF document.
 * watermarkPDF({ fileBytes, text, rotation, opacity, color: [r,g,b], fontSize? })
 */
export async function watermarkPDF(
  arg1: { fileBytes: Uint8Array; text: string; rotation?: number; opacity?: number; color?: [number, number, number]; fontSize?: number } | Uint8Array,
  arg2?: string,
  arg3?: number,
  arg4?: number,
  arg5?: number[] | [number, number, number]
): Promise<Uint8Array> {
  let fileBytes: Uint8Array;
  let text = WATERMARK_DEFAULTS.text;
  let rotation = WATERMARK_DEFAULTS.rotation;
  let opacity = WATERMARK_DEFAULTS.opacity;
  let color = WATERMARK_DEFAULTS.color;
  let fontSize = WATERMARK_DEFAULTS.fontSize;

  if (arg1 instanceof Uint8Array) {
    fileBytes = arg1;
    if (arg2 !== undefined) text = arg2;
    if (arg3 !== undefined) rotation = arg3;
    if (arg4 !== undefined) opacity = arg4;
    if (arg5 !== undefined) color = arg5 as [number, number, number];
  } else {
    fileBytes = arg1.fileBytes;
    if (arg1.text !== undefined) text = arg1.text;
    if (arg1.rotation !== undefined) rotation = arg1.rotation;
    if (arg1.opacity !== undefined) opacity = arg1.opacity;
    if (arg1.color !== undefined) color = arg1.color;
    if (arg1.fontSize !== undefined) fontSize = arg1.fontSize;
  }

  const pdfDoc = await loadPDF(fileBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const width = page.getWidth();
    const height = page.getHeight();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);
    const x = (width - textWidth) / 2;
    const y = (height - textHeight) / 2;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color[0], color[1], color[2]),
      opacity: opacity,
      rotate: degrees(rotation),
    });
  }

  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * 7. Adds sequential page numbers to selected positions in a PDF document.
 * addPageNumbersPDF({ fileBytes, position: 'bottom-center'|'bottom-left'|'bottom-right', startNumber, skipFirst })
 */
export async function addPageNumbersPDF(
  arg1: { fileBytes: Uint8Array; position?: "bottom-center" | "bottom-left" | "bottom-right"; startNumber?: number; skipFirst?: boolean } | Uint8Array,
  arg2?: "bottom-center" | "bottom-left" | "bottom-right",
  arg3?: number,
  arg4?: boolean
): Promise<Uint8Array> {
  let fileBytes: Uint8Array;
  let position: "bottom-center" | "bottom-left" | "bottom-right" = PAGE_NUMBER_DEFAULTS.position;
  let startNumber = PAGE_NUMBER_DEFAULTS.startNumber;
  let skipFirst = PAGE_NUMBER_DEFAULTS.skipFirst;

  if (arg1 instanceof Uint8Array) {
    fileBytes = arg1;
    if (arg2 !== undefined) position = arg2;
    if (arg3 !== undefined) startNumber = arg3;
    if (arg4 !== undefined) skipFirst = arg4;
  } else {
    fileBytes = arg1.fileBytes;
    if (arg1.position !== undefined) position = arg1.position;
    if (arg1.startNumber !== undefined) startNumber = arg1.startNumber;
    if (arg1.skipFirst !== undefined) skipFirst = arg1.skipFirst;
  }

  const pdfDoc = await loadPDF(fileBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pages.length; i++) {
    if (skipFirst && i === 0) continue;
    const page = pages[i];
    const pageNum = i + startNumber - (skipFirst ? 1 : 0);
    const text = `${pageNum}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const width = page.getWidth();

    let x = width - 40;
    if (position === "bottom-center") {
      x = (width - textWidth) / 2;
    } else if (position === "bottom-left") {
      x = 40;
    }
    const y = 30;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

export const addPageNumbers = addPageNumbersPDF;

/**
 * 8. Inserts a blank page to a specific position in the PDF file.
 * addBlankPagePDF({ fileBytes, positionIndex, pageSize: 'LETTER'|'A4' })
 */
export async function addBlankPagePDF(
  arg1: { fileBytes: Uint8Array; positionIndex: number; pageSize: "LETTER" | "A4" | "Letter" } | Uint8Array,
  arg2?: number,
  arg3?: "LETTER" | "A4" | "Letter"
): Promise<Uint8Array> {
  const { fileBytes, positionIndex, pageSize } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, positionIndex: arg2!, pageSize: arg3! }
    : arg1;

  const pdfDoc = await loadPDF(fileBytes);
  const upperSize = pageSize.toUpperCase();
  const width = upperSize === "LETTER" ? PDF_PAGE_SIZES.Letter[0] : PDF_PAGE_SIZES.A4[0];
  const height = upperSize === "LETTER" ? PDF_PAGE_SIZES.Letter[1] : PDF_PAGE_SIZES.A4[1];

  const pages = pdfDoc.getPages();
  const index = Math.min(Math.max(0, positionIndex), pages.length);
  pdfDoc.insertPage(index, [width, height]);
  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

export const addBlankPage = addBlankPagePDF;

/**
 * 9. Compresses a PDF document by rebuilding page structures (High) or rasterizing pages (Medium, Low).
 * compressPDF({ fileBytes, level: 'low'|'medium'|'high' })
 */
export async function compressPDF(
  arg1: { fileBytes: Uint8Array; level: "low" | "medium" | "high" } | Uint8Array,
  arg2?: "low" | "medium" | "high"
): Promise<Uint8Array> {
  const { fileBytes, level } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, level: arg2! }
    : arg1;

  if (level === "high") {
    // High → lightweight optimization using object streams
    const pdfDoc = await loadPDF(fileBytes);
    const newPdfDoc = await PDFDocument.create();
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    for (const page of copiedPages) {
      newPdfDoc.addPage(page);
    }
    newPdfDoc.setProducer("PDFMinty (Highly Compressed)");
    return await newPdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
  }

  // Medium & Low → actual canvas rasterization with JPEG quality and scaling to meaningfully reduce file size.
  const scale = level === "low" ? 1.2 : 0.8;
  const quality = level === "low" ? 0.75 : 0.55;

  const { bytes: sanitizedBytes } = PDFSanitizer.sanitize(fileBytes);
  PDFSanitizer.validate(sanitizedBytes);

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

  const loadingTask = pdfjs.getDocument({
    data: sanitizedBytes,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  } as any);

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const newPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    let canvas: any;
    let context: any;

    if (typeof document !== "undefined" && typeof document.createElement === "function") {
      canvas = document.createElement("canvas");
      context = canvas.getContext("2d");
    } else if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(viewport.width, viewport.height);
      context = canvas.getContext("2d");
    }

    if (!context) {
      throw new Error(`Failed to initialize 2D canvas context for compressing page ${i}.`);
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    } as any).promise;

    let imgBytes: Uint8Array;
    if (typeof canvas.convertToBlob === "function") {
      const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
      imgBytes = new Uint8Array(await blob.arrayBuffer());
    } else if (typeof canvas.toBlob === "function") {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });
      if (!blob) {
        throw new Error(`Failed to rasterize page ${i} for compression`);
      }
      imgBytes = new Uint8Array(await blob.arrayBuffer());
    } else {
      throw new Error("Canvas is unable to convert page to jpeg for compression.");
    }

    const embeddedImg = await newPdfDoc.embedJpg(imgBytes);
    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  newPdfDoc.setProducer(`PDFMinty (${level} Compressed via Rasterization)`);
  return await newPdfDoc.save({ useObjectStreams: true });
}

/**
 * 10. Protects a PDF file with owner or user passwords.
 * protectPDF({ fileBytes, userPassword, ownerPassword? })
 */
export async function protectPDF(
  arg1: { fileBytes: Uint8Array; userPassword?: string; ownerPassword?: string } | Uint8Array,
  arg2?: string,
  arg3?: string
): Promise<Uint8Array> {
  const { fileBytes, userPassword, ownerPassword } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, userPassword: arg2, ownerPassword: arg3 }
    : arg1;

  if (!userPassword || userPassword.trim() === "") {
    throw new Error("Password cannot be empty");
  }

  const { bytes: sanitizedBytes } = PDFSanitizer.sanitize(fileBytes);
  PDFSanitizer.validate(sanitizedBytes);

  const pdfDoc = await PDFDocumentEncrypt.load(sanitizedBytes);
  pdfDoc.encrypt({
    userPassword,
    ownerPassword: ownerPassword || undefined,
    permissions: {
      printing: "lowResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  });

  pdfDoc.setProducer("PDFMinty (Encrypted)");
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * 11. Unlocks a password-protected PDF.
 * unlockPDF({ fileBytes, password })
 */
export async function unlockPDF(
  arg1: { fileBytes: Uint8Array; password?: string } | Uint8Array,
  arg2?: string
): Promise<Uint8Array> {
  const { fileBytes, password } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, password: arg2 }
    : arg1;

  const { bytes: sanitizedBytes } = PDFSanitizer.sanitize(fileBytes);

  let pdfDoc;
  try {
    pdfDoc = await PDFDocumentEncrypt.load(sanitizedBytes, { password: password || "" });
  } catch (err: any) {
    if (
      err.message?.includes("password") ||
      err.message?.includes("Password") ||
      err.message?.includes("decrypt") ||
      err.message?.includes("credentials")
    ) {
      throw new Error("Incorrect password provided. Please verify and try again.");
    }
    throw new Error(`Failed to unlock PDF: ${err.message || "Invalid credentials."}`);
  }

  pdfDoc.setProducer("PDFMinty (Unlocked)");
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * 12. Transforms loaded image streams directly into a single PDF document.
 * imagesToPDF({ images: {bytes: Uint8Array, type: string}[], pageSize: 'LETTER'|'A4' })
 */
export async function imagesToPDF(
  arg1: { images: Array<{ bytes: Uint8Array; type: string }>; pageSize: "LETTER" | "A4" | "Letter" } | Array<{ bytes: Uint8Array; type: string }>,
  arg2?: "LETTER" | "A4" | "Letter"
): Promise<{ bytes: Uint8Array; warnings: string[] }> {
  const { images, pageSize } = Array.isArray(arg1)
    ? { images: arg1, pageSize: arg2! }
    : arg1;

  const pdfDoc = await PDFDocument.create();
  const warnings: string[] = [];

  const upperSize = pageSize.toUpperCase();
  const width = upperSize === "LETTER" ? PDF_PAGE_SIZES.Letter[0] : PDF_PAGE_SIZES.A4[0];
  const height = upperSize === "LETTER" ? PDF_PAGE_SIZES.Letter[1] : PDF_PAGE_SIZES.A4[1];

  for (let i = 0; i < images.length; i++) {
    const imgData = images[i];
    let embeddedImg;
    try {
      const typeLower = imgData.type.toLowerCase();
      if (typeLower === "image/png" || typeLower.endsWith("png")) {
        embeddedImg = await pdfDoc.embedPng(imgData.bytes);
      } else if (
        typeLower === "image/jpeg" ||
        typeLower === "image/jpg" ||
        typeLower.endsWith("jpg") ||
        typeLower.endsWith("jpeg")
      ) {
        embeddedImg = await pdfDoc.embedJpg(imgData.bytes);
      } else {
        throw new Error(`Unsupported image format: ${imgData.type}. Only PNG and JPEG/JPG are supported.`);
      }
    } catch (err: any) {
      warnings.push(`Image ${i + 1} could not be embedded: ${err.message}`);
      continue;
    }

    const page = pdfDoc.addPage([width, height]);
    let dWidth = embeddedImg.width;
    let dHeight = embeddedImg.height;

    const ratio = Math.min(width / dWidth, height / dHeight, 1);
    dWidth *= ratio;
    dHeight *= ratio;
    const x = (width - dWidth) / 2;
    const y = (height - dHeight) / 2;

    page.drawImage(embeddedImg, {
      x,
      y,
      width: dWidth,
      height: dHeight,
    });
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error("No images were successfully converted to PDF.");
  }

  pdfDoc.setProducer("PDFMinty");
  const bytes = await pdfDoc.save({ useObjectStreams: true });
  return { bytes, warnings };
}

export async function imageToPdf(
  arg1: { images: Array<{ bytes: Uint8Array; type: string }>; pageSize: "LETTER" | "A4" | "Letter" } | Array<{ bytes: Uint8Array; type: string }>,
  arg2?: "LETTER" | "A4" | "Letter"
): Promise<Uint8Array> {
  const result = await imagesToPDF(arg1 as any, arg2 as any);
  return result.bytes;
}

/**
 * 13. Redraws high-density PDF pages to images.
 * pdfToImage({ fileBytes, scale, format: 'png'|'jpeg' })
 */
export async function pdfToImage(
  arg1: { fileBytes: Uint8Array; scale?: number; format?: "png" | "jpeg" } | Uint8Array,
  arg2?: number,
  arg3?: "png" | "jpeg"
): Promise<Array<{ pageNum: number; bytes: Uint8Array }>> {
  const { fileBytes, scale, format } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, scale: arg2 ?? 1.5, format: arg3 ?? "png" }
    : (arg1 ? arg1 : { fileBytes: new Uint8Array(), scale: 1.5, format: "png" });

  if (!fileBytes || fileBytes.length === 0) {
    return [];
  }

  const { bytes: sanitizedBytes } = PDFSanitizer.sanitize(fileBytes);
  PDFSanitizer.validate(sanitizedBytes);

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

  const loadingTask = pdfjs.getDocument({
    data: sanitizedBytes,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  } as any);

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const results: Array<{ pageNum: number; bytes: Uint8Array }> = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: scale ?? 1.5 });

    let canvas: any;
    let context: any;

    if (typeof document !== "undefined" && typeof document.createElement === "function") {
      canvas = document.createElement("canvas");
      context = canvas.getContext("2d");
    } else if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(viewport.width, viewport.height);
      context = canvas.getContext("2d");
    }

    if (!context) {
      throw new Error(`Failed to initialize 2D canvas context for rendering PDF page ${i}.`);
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    } as any).promise;

    let bytes: Uint8Array;
    if (typeof canvas.convertToBlob === "function") {
      const blob = await canvas.convertToBlob({ type: format === "jpeg" ? "image/jpeg" : "image/png" });
      bytes = new Uint8Array(await blob.arrayBuffer());
    } else if (typeof canvas.toBlob === "function") {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, format === "jpeg" ? "image/jpeg" : "image/png");
      });
      if (!blob) {
        throw new Error(`Failed to generate blob image for page ${i}`);
      }
      bytes = new Uint8Array(await blob.arrayBuffer());
    } else {
      throw new Error("Canvas is unable to convert page to image/blob in this context.");
    }

    results.push({ pageNum: i, bytes });
  }

  return results;
}

/**
 * Reorders pages in a PDF document according to the provided index array.
 * reorderPDF({ fileBytes, pageOrderIndices }) or reorderPDF(fileBytes, pageOrderIndices)
 */
export async function reorderPDF(
  arg1: { fileBytes: Uint8Array; pageOrderIndices: number[] } | Uint8Array,
  arg2?: number[]
): Promise<Uint8Array> {
  const { fileBytes, pageOrderIndices } = (arg1 instanceof Uint8Array)
    ? { fileBytes: arg1, pageOrderIndices: arg2! }
    : arg1;

  if (!pageOrderIndices || pageOrderIndices.length === 0) {
    throw new Error("Page order indices cannot be empty.");
  }

  const pdfDoc = await loadPDF(fileBytes);
  const totalPages = pdfDoc.getPageCount();

  if (pageOrderIndices.length !== totalPages) {
    throw new Error(`Invalid page order: expected ${totalPages} pages, but got ${pageOrderIndices.length}.`);
  }

  const indexSet = new Set(pageOrderIndices);
  if (indexSet.size !== totalPages) {
    throw new Error("Invalid page order: duplicate pages or missing page indices detected.");
  }

  for (const idx of pageOrderIndices) {
    if (idx < 0 || idx >= totalPages) {
      throw new Error(`Invalid page index: ${idx} is out of bounds (0 to ${totalPages - 1}).`);
    }
  }

  const reorderedPdf = await PDFDocument.create();
  const copiedPages = await reorderedPdf.copyPages(pdfDoc, pageOrderIndices);
  for (const page of copiedPages) {
    reorderedPdf.addPage(page);
  }
  reorderedPdf.setProducer("PDFMinty");
  return await reorderedPdf.save({ useObjectStreams: true });
}

// Named exports map
export {
  mergePDFs as mergePDFsExport,
  splitPDF as splitPDFExport,
  splitPDFMulti as splitPDFMultiExport,
  rotatePDF as rotatePDFExport,
  deletePagesPDF as deletePagesPDFExport,
  watermarkPDF as watermarkPDFExport,
  addPageNumbersPDF as addPageNumbersPDFExport,
  addBlankPagePDF as addBlankPagePDFExport,
  compressPDF as compressPDFExport,
  protectPDF as protectPDFExport,
  unlockPDF as unlockPDFExport,
  imagesToPDF as imagesToPDFExport,
  pdfToImage as pdfToImageExport,
  reorderPDF as reorderPDFExport,
};

// Default export map for maximum compatibility
export default {
  loadPDF,
  mergePDFs,
  splitPDF,
  splitPDFMulti,
  splitMultiPDF,
  rotatePDF,
  deletePagesPDF,
  watermarkPDF,
  addPageNumbersPDF,
  addPageNumbers,
  addBlankPagePDF,
  addBlankPage,
  compressPDF,
  protectPDF,
  unlockPDF,
  imagesToPDF,
  imageToPdf,
  pdfToImage,
  reorderPDF,
  extractPDFPages,
};
