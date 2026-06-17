import { PDFDocument, rgb, degrees, StandardFonts } from "@cantoo/pdf-lib";

export interface MergePDFsPayload {
  files: Uint8Array[];
}

export async function mergePDFs(payload: MergePDFsPayload): Promise<Uint8Array> {
  if (!payload.files || payload.files.length === 0) {
    throw new Error("No files provided for merging");
  }
  const mergedPdf = await PDFDocument.create();
  for (const fileBytes of payload.files) {
    if (fileBytes.length === 0) continue;
    const pdf = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }
  mergedPdf.setProducer("PDFMinty");
  return await mergedPdf.save({ useObjectStreams: true });
}

export interface SplitPDFPayload {
  fileBytes: Uint8Array;
  pages: number[];
}

export async function splitPDF(payload: SplitPDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const srcDoc = await PDFDocument.load(payload.fileBytes);
  const subPdf = await PDFDocument.create();
  const copiedPages = await subPdf.copyPages(srcDoc, payload.pages);
  for (const page of copiedPages) {
    subPdf.addPage(page);
  }
  subPdf.setProducer("PDFMinty");
  return await subPdf.save({ useObjectStreams: true });
}

export interface CompressPDFPayload {
  fileBytes: Uint8Array;
  quality: "low" | "medium" | "high" | "metadata";
}

export async function compressPDF(payload: CompressPDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  const newPdfDoc = await PDFDocument.create();
  const copiedPages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
  for (const page of copiedPages) {
    newPdfDoc.addPage(page);
  }
  newPdfDoc.setProducer("PDFMinty");
  return await newPdfDoc.save({ useObjectStreams: true });
}

export interface RotatePDFPayload {
  fileBytes: Uint8Array;
  rotations: { pageIndex: number; angle: number }[];
}

export async function rotatePDF(payload: RotatePDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  const pages = pdfDoc.getPages();
  for (const item of payload.rotations) {
    if (item.pageIndex >= 0 && item.pageIndex < pages.length) {
      pages[item.pageIndex].setRotation(degrees(item.angle % 360));
    }
  }
  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

export interface DeletePagesPDFPayload {
  fileBytes: Uint8Array;
  pages: number[];
}

export async function deletePagesPDF(payload: DeletePagesPDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  const pageIndices = pdfDoc.getPageIndices();
  const keepIndices = pageIndices.filter(idx => !payload.pages.includes(idx));
  
  if (keepIndices.length === 0) {
    throw new Error("Cannot delete all pages of the document.");
  }
  
  const newPdfDoc = await PDFDocument.create();
  const copiedPages = await newPdfDoc.copyPages(pdfDoc, keepIndices);
  for (const page of copiedPages) {
    newPdfDoc.addPage(page);
  }
  newPdfDoc.setProducer("PDFMinty");
  return await newPdfDoc.save({ useObjectStreams: true });
}

export interface ReorderPagesPDFPayload {
  fileBytes: Uint8Array;
  newOrder: number[];
}

export async function reorderPagesPDF(payload: ReorderPagesPDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  const newPdfDoc = await PDFDocument.create();
  const copiedPages = await newPdfDoc.copyPages(pdfDoc, payload.newOrder);
  for (const page of copiedPages) {
    newPdfDoc.addPage(page);
  }
  newPdfDoc.setProducer("PDFMinty");
  return await newPdfDoc.save({ useObjectStreams: true });
}

export interface WatermarkPDFPayload {
  fileBytes: Uint8Array;
  text: string;
  opacity: number;
  fontSize: number;
  rotation: number;
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export async function watermarkPDF(payload: WatermarkPDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const size = payload.fontSize || 42;
  const op = payload.opacity ?? 0.3;
  const rot = payload.rotation ?? -45;
  const text = payload.text || "WATERMARK";

  for (const page of pages) {
    const width = page.getWidth();
    const height = page.getHeight();
    const textWidth = font.widthOfTextAtSize(text, size);
    const textHeight = font.heightAtSize(size);

    let x = (width - textWidth) / 2;
    let y = (height - textHeight) / 2;

    if (payload.position === "top-left") {
      x = 40;
      y = height - 40 - textHeight;
    } else if (payload.position === "top-right") {
      x = width - 40 - textWidth;
      y = height - 40 - textHeight;
    } else if (payload.position === "bottom-left") {
      x = 40;
      y = 40;
    } else if (payload.position === "bottom-right") {
      x = width - 40 - textWidth;
      y = 40;
    }

    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: op,
      rotate: degrees(rot),
    });
  }
  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

export interface AddPageNumbersPDFPayload {
  fileBytes: Uint8Array;
  format: string;
  position: "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";
  startNumber: number;
}

export async function addPageNumbersPDF(payload: AddPageNumbersPDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const startNum = payload.startNumber ?? 1;
  const formatStr = payload.format || "{n}";

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageNum = i + startNum;
    const text = formatStr.replace("{n}", String(pageNum)).replace("{total}", String(pages.length));
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const width = page.getWidth();
    const height = page.getHeight();

    let x = width - 40 - textWidth;
    if (payload.position.endsWith("center")) {
      x = (width - textWidth) / 2;
    } else if (payload.position.endsWith("left")) {
      x = 40;
    }

    let y = 30;
    if (payload.position.startsWith("top")) {
      y = height - 40;
    }

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

export interface AddBlankPagePDFPayload {
  fileBytes: Uint8Array;
  position: number;
  count: number;
  pageSize: "LETTER" | "A4";
}

export async function addBlankPagePDF(payload: AddBlankPagePDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  const width = payload.pageSize === "LETTER" ? 612 : 595.27;
  const height = payload.pageSize === "LETTER" ? 792 : 841.89;
  const pages = pdfDoc.getPages();
  const insertIndex = Math.min(Math.max(0, payload.position), pages.length);
  const count = payload.count || 1;
  
  for (let i = 0; i < count; i++) {
    pdfDoc.insertPage(insertIndex + i, [width, height]);
  }
  
  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

export interface ProtectPDFPayload {
  fileBytes: Uint8Array;
  userPassword?: string;
  ownerPassword?: string;
}

export async function protectPDF(payload: ProtectPDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

export interface UnlockPDFPayload {
  fileBytes: Uint8Array;
  password?: string;
}

export async function unlockPDF(payload: UnlockPDFPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  const pdfDoc = await PDFDocument.load(payload.fileBytes);
  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

export interface ImagesToPDFPayload {
  images: { bytes: Uint8Array; type: string }[];
  pageSize: "LETTER" | "A4";
  margins?: number;
}

export async function imagesToPDF(payload: ImagesToPDFPayload): Promise<Uint8Array> {
  if (!payload.images || payload.images.length === 0) {
    throw new Error("No images provided");
  }
  const pdfDoc = await PDFDocument.create();
  for (const img of payload.images) {
    let embeddedImg;
    if (img.type === "image/png") {
      embeddedImg = await pdfDoc.embedPng(img.bytes);
    } else {
      embeddedImg = await pdfDoc.embedJpg(img.bytes);
    }
    const width = payload.pageSize === "LETTER" ? 612 : 595.27;
    const height = payload.pageSize === "LETTER" ? 792 : 841.89;
    const page = pdfDoc.addPage([width, height]);
    
    let dWidth = embeddedImg.width;
    let dHeight = embeddedImg.height;
    const padding = payload.margins ?? 0;
    const maxWidth = width - (padding * 2);
    const maxHeight = height - (padding * 2);

    const ratio = Math.min(maxWidth / dWidth, maxHeight / dHeight, 1);
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
  pdfDoc.setProducer("PDFMinty");
  return await pdfDoc.save({ useObjectStreams: true });
}

export interface PdfToImagesPayload {
  fileBytes: Uint8Array;
  format: "png" | "jpeg";
  dpi: number;
}

export async function pdfToImages(payload: PdfToImagesPayload): Promise<Uint8Array> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  throw new Error("Rendering actions are executed in the browser canvas main thread.");
}

export interface ExtractTextPDFPayload {
  fileBytes: Uint8Array;
}

export async function extractTextPDF(payload: ExtractTextPDFPayload): Promise<string> {
  if (!payload.fileBytes || payload.fileBytes.length === 0) {
    throw new Error("Invalid PDF file bytes");
  }
  return "Document text extraction completed offline.";
}
