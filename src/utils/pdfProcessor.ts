import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Reads a File object and converts it to an ArrayBuffer
 */
const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Merges multiple PDF files into a single PDF
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const fileBytes = await fileToArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
}

/**
 * Splits a PDF file into multiple blobs based on page ranges (e.g. "1-2, 3, 4-5")
 */
export async function splitPdf(file: File, ranges: string): Promise<{ name: string; blob: Blob }[]> {
  const fileBytes = await fileToArrayBuffer(file);
  const sourcePdf = await PDFDocument.load(fileBytes);
  const totalPages = sourcePdf.getPageCount();
  
  // Parse ranges like "1-2, 4, 5-7"
  const rangeSpecs = ranges.split(',')
    .map(r => r.trim())
    .filter(r => r.length > 0);
    
  const results: { name: string; blob: Blob }[] = [];
  
  for (let i = 0; i < rangeSpecs.length; i++) {
    const spec = rangeSpecs[i];
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
    
    // Bounds check
    if (isNaN(startPage) || isNaN(endPage) || startPage < 1 || endPage < startPage || startPage > totalPages) {
      throw new Error(`Invalid range specification: "${spec}". Document has only ${totalPages} pages.`);
    }
    
    const actualEnd = Math.min(endPage, totalPages);
    const subPdf = await PDFDocument.create();
    
    const indicesToCopy: number[] = [];
    for (let p = startPage - 1; p < actualEnd; p++) {
      indicesToCopy.push(p);
    }
    
    const copiedPages = await subPdf.copyPages(sourcePdf, indicesToCopy);
    copiedPages.forEach(p => subPdf.addPage(p));
    
    const subPdfBytes = await subPdf.save();
    const partsName = `${file.name.replace(/\.pdf$/i, '')}_part_${startPage}-${actualEnd}.pdf`;
    results.push({
      name: partsName,
      blob: new Blob([subPdfBytes], { type: 'application/pdf' })
    });
  }
  
  return results;
}

/**
 * Rotates specific or all pages of a PDF
 */
export async function rotatePdf(file: File, rotationDegrees: number): Promise<Uint8Array> {
  const fileBytes = await fileToArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(fileBytes);
  
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
  }
  
  return await pdfDoc.save();
}

/**
 * Removes designated pages from PDF
 */
export async function deletePagesFromPdf(file: File, pagesToRemoveOneBased: number[]): Promise<Uint8Array> {
  const fileBytes = await fileToArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(fileBytes);
  
  // Sort descending so indices don't shift during deletion
  const sortedToRemove = [...pagesToRemoveOneBased]
    .map(p => p - 1)
    .filter(idx => idx >= 0 && idx < pdfDoc.getPageCount())
    .sort((a, b) => b - a);
    
  if (sortedToRemove.length === 0) {
    throw new Error('No valid pages designated for deletion.');
  }
  
  if (sortedToRemove.length === pdfDoc.getPageCount()) {
    throw new Error('Cannot delete all pages from the PDF document.');
  }
  
  sortedToRemove.forEach(index => {
    pdfDoc.removePage(index);
  });
  
  return await pdfDoc.save();
}

/**
 * Adds a text watermark to all pages
 */
export async function addWatermarkToPdf(
  file: File, 
  text: string, 
  options: { size?: number; opacity?: number; colorHex?: string } = {}
): Promise<Uint8Array> {
  const fileBytes = await fileToArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(fileBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const size = options.size || 50;
  const opacity = options.opacity !== undefined ? options.opacity : 0.35;
  
  // Simple hex parsing
  let rVal = 0.5, gVal = 0.5, bVal = 0.5;
  if (options.colorHex) {
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
    
    // Draw centered diagonal watermark
    page.drawText(text, {
      x: width / 2 - (text.length * size * 0.28),
      y: height / 2,
      size,
      font,
      color: rgb(rVal, gVal, bVal),
      opacity,
      rotate: degrees(45),
    });
  }
  
  return await pdfDoc.save();
}

/**
 * Adds numbers to footer of all pages
 */
export async function addPageNumbersToPdf(file: File, pattern: string = 'Page {n} of {total}'): Promise<Uint8Array> {
  const fileBytes = await fileToArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(fileBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const total = pdfDoc.getPageCount();
  const pages = pdfDoc.getPages();
  
  for (let idx = 0; idx < total; idx++) {
    const page = pages[idx];
    const { width } = page.getSize();
    const currentNum = idx + 1;
    const text = pattern
      .replace('{n}', currentNum.toString())
      .replace('{total}', total.toString());
      
    page.drawText(text, {
      x: width - 120,
      y: 20,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }
  
  return await pdfDoc.save();
}

/**
 * Inserts a dynamic blank page at desired point
 */
export async function addBlankPageToPdf(file: File, position: 'start' | 'end' | number): Promise<Uint8Array> {
  const fileBytes = await fileToArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(fileBytes);
  
  const [width, height] = [595.276, 841.89] as const; // Standard A4 page size
  
  if (position === 'start') {
    pdfDoc.insertPage(0, [width, height]);
  } else if (position === 'end') {
    pdfDoc.addPage([width, height]);
  } else {
    const targetIdx = Math.max(0, Math.min(position - 1, pdfDoc.getPageCount()));
    pdfDoc.insertPage(targetIdx, [width, height]);
  }
  
  return await pdfDoc.save();
}

/**
 * Encrypts/Protects a PDF file with a password.
 */
export async function protectPdf(file: File, userPassword: string): Promise<Uint8Array> {
  const fileBytes = await fileToArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(fileBytes);
  
  pdfDoc.encrypt({
    userPassword,
    ownerPassword: userPassword + '_owner',
    permissions: {
      modifying: false,
      printing: 'highResolution',
      copying: true,
    },
  });
  
  return await pdfDoc.save();
}

/**
 * Unlocks a password-protected PDF
 */
export async function unlockPdf(file: File, passwordString: string): Promise<Uint8Array> {
  const fileBytes = await fileToArrayBuffer(file);
  // pdf-lib decryption is handled during loader
  const pdfDoc = await PDFDocument.load(fileBytes, {
    password: passwordString,
  });
  
  return await pdfDoc.save();
}

/**
 * Combines multiple images into a single PDF document (one image per page)
 */
export async function imagesToPdf(imageFiles: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  for (const file of imageFiles) {
    const imgBytes = await fileToArrayBuffer(file);
    let embeddedImg;
    
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      embeddedImg = await pdfDoc.embedJpg(imgBytes);
    } else if (file.type === 'image/png') {
      embeddedImg = await pdfDoc.embedPng(imgBytes);
    } else {
      throw new Error(`Unsupported image format: ${file.type}. Please upload JPG or PNG files.`);
    }
    
    const dims = embeddedImg.scale(1.0);
    // Standard page fitting
    const page = pdfDoc.addPage([dims.width, dims.height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: dims.width,
      height: dims.height,
    });
  }
  
  return await pdfDoc.save();
}
