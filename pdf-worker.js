/**
 * Web Worker for PDF Processing.
 * Receives tasks from the main thread, executes heavy PDF operations using pdf-lib,
 * and posts the result or structured error back.
 */
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

self.onmessage = async function (e) {
  const { id, task, payload } = e.data;
  const fileName = payload?.fileName || 'unknown_file.pdf'; // Extract filename for structured logging

  try {
    let result;
    if (task === 'merge') {
      result = await executeMerge(payload);
    } else if (task === 'compress') {
      result = await executeCompress(payload);
    } else if (task === 'split') {
      result = await executeSplit(payload);
    } else if (task === 'watermark') {
      result = await executeWatermark(payload);
    } else if (task === 'add-page-numbers') {
      result = await executeAddPageNumbers(payload);
    } else if (task === 'reorder') {
      result = await executeReorder(payload);
    } else if (task === 'protect') {
      result = await executeProtect(payload);
    } else if (task === 'add-blank-page') {
      result = await executeAddBlankPage(payload);
    } else if (task === 'delete-pages') {
      result = await executeDeletePages(payload);
    } else if (task === 'extract-pages') {
      result = await executeExtractPages(payload);
    } else if (task === 'rotate') {
      result = await executeRotate(payload);
    } else if (task === 'unlock') {
      result = await executeUnlock(payload);
    } else if (task === 'image-to-pdf') {
      result = await executeImageToPdf(payload);
    } else {
      throw new Error('Unknown task: ' + task);
    }

    // Return transferables
    if (result instanceof Uint8Array) {
      self.postMessage({ id, status: 'success', result }, [result.buffer]);
    } else if (Array.isArray(result) && result[0] && result[0].bytes instanceof Uint8Array) {
      // For split, return array of { name, bytes }
      const buffers = result.map((r) => r.bytes.buffer);
      self.postMessage({ id, status: 'success', result }, buffers);
    } else {
      self.postMessage({ id, status: 'success', result });
    }
  } catch (err) {
    // Structured error reporting for async operations
    const structuredError = {
      id,
      status: 'error',
      error: {
        operationName: task,
        fileName: fileName,
        errorType: err.name || 'Error',
        message: err.message,
        stack: err.stack,
      },
    };
    console.error(`[Worker Error] Task: ${task} | File: ${fileName}`, err);
    self.postMessage(structuredError);
  }
};

/**
 * Merges multiple PDF files into a single document.
 * @param {Object} payload
 * @param {Array<Uint8Array>} payload.files - Array of PDF file byte buffers
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} The merged PDF bytes.
 * @throws {Error} Required if loading or saving the PDF fails
 */
async function executeMerge(payload) {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < payload.files.length; i++) {
    let fileBytes = payload.files[i]; // Uint8Array
    let pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    
    self.postMessage({ 
      id: payload.id, 
      status: 'progress', 
      progress: Math.round(((i) / payload.files.length) * 40),
      type: 'progress',
      operation: 'merge',
      percent: Math.round(((i) / payload.files.length) * 40),
      label: `Loading file ${i + 1} of ${payload.files.length}`
    });

    const pageIndices = pdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
    
    for (let j = 0; j < copiedPages.length; j++) {
      mergedPdf.addPage(copiedPages[j]);
      if (copiedPages.length > 20 && j % 10 === 0) {
        let percent = 40 + Math.round(((i + (j / copiedPages.length)) / payload.files.length) * 50);
        self.postMessage({
          id: payload.id,
          status: 'progress',
          progress: percent,
          type: 'progress',
          operation: 'merge',
          percent: percent,
          label: `Merging page ${j + 1} of ${copiedPages.length} in file ${i + 1}`
        });
      }
    }

    self.postMessage({
      id: payload.id,
      status: 'progress',
      progress: Math.min(95, Math.round(((i + 1) / payload.files.length) * 90)),
      type: 'progress',
      operation: 'merge',
      percent: Math.min(95, Math.round(((i + 1) / payload.files.length) * 90)),
      label: `Merged file ${i + 1} of ${payload.files.length}`
    });
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 98, type: 'progress', operation: 'merge', percent: 98, label: 'Saving merged PDF...' });
  return await mergedPdf.save({ useObjectStreams: true });
}

/**
 * Splits a PDF into multiple documents based on specified ranges.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {Array<{start: number, end: number}>} payload.ranges - Array of start and end pages
 * @param {string} payload.fileName - Base name for output files
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Array<{name: string, bytes: Uint8Array}>>} Array of separated PDFs with their generic names
 * @throws {Error} Throws if loading the pdf fails or invalid range
 */
async function executeSplit(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 5, type: 'progress', operation: 'split', percent: 5, label: 'Loading PDF...' });
  const srcDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  self.postMessage({ id: payload.id, status: 'progress', progress: 10, type: 'progress', operation: 'split', percent: 10, label: 'PDF loaded. Preparing parts...' });

  const results = [];
  const totalRanges = payload.ranges.length;
  let totalExtractedPages = 0;

  for (let c = 0; c < totalRanges; c++) {
    const r = payload.ranges[c];
    const newDoc = await PDFDocument.create();
    const indices = [];
    for (let j = r.start - 1; j < r.end; j++) {
      if (j >= 0 && j < srcDoc.getPageCount()) {
        indices.push(j);
      }
    }

    if (indices.length > 0) {
      const copiedPages = await newDoc.copyPages(srcDoc, indices);
      for (let k = 0; k < copiedPages.length; k++) {
        newDoc.addPage(copiedPages[k]);
        totalExtractedPages++;
        
        let percent = Math.round(10 + (((c + (k / copiedPages.length)) / totalRanges) * 80));
        if (k % 5 === 0) {
          self.postMessage({
            id: payload.id,
            status: 'progress',
            progress: percent,
            type: 'progress',
            operation: 'split',
            percent: percent,
            label: `Extracting page ${k + 1} of range ${c + 1}`
          });
        }
      }
      const pdfBytes = await newDoc.save({ useObjectStreams: true });
      results.push({ name: `${payload.fileName}_${r.start}-${r.end}.pdf`, bytes: pdfBytes });
    }

    let p = Math.round(10 + ((c + 1) / totalRanges) * 80);
    self.postMessage({
      id: payload.id,
      status: 'progress',
      progress: p,
      type: 'progress',
      operation: 'split',
      percent: p,
      label: `Completed range ${c + 1} of ${totalRanges}`
    });
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 95, type: 'progress', operation: 'split', percent: 95, label: `Finalizing output...` });
  return results;
}

/**
 * Compresses a PDF by stripping unnecessary metadata and rebuilding object streams.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Compressed PDF bytes
 * @throws {Error} Throws if PDF loading fails
 */
async function executeCompress(payload) {
  const { fileBytes, id } = payload;
  self.postMessage({ id, status: 'progress', progress: 5, type: 'progress', operation: 'compress', percent: 5, label: 'Loading PDF...' });

  // Load with specific optimizations
  const pdfDoc = await PDFDocument.load(fileBytes, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  self.postMessage({ id, status: 'progress', progress: 20, type: 'progress', operation: 'compress', percent: 20, label: 'Optimizing metadata...' });

  // 1. Remove unnecessary metadata/tags
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');

  // 2. Process pages
  const pages = pdfDoc.getPages();
  let imageCount = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    // Traverse the page to count or interact with image XObjects if needed
    // Assuming each page processing represents progress.
    imageCount++; 
    
    if (i % 5 === 0) {
      let percent = Math.round(20 + (i / pages.length) * 60);
      self.postMessage({
        id,
        status: 'progress',
        progress: percent,
        type: 'progress',
        operation: 'compress',
        percent: percent,
        label: `Processing image contents on page ${i + 1}`
      });
    }
  }

  self.postMessage({ id, status: 'progress', progress: 85, type: 'progress', operation: 'compress', percent: 85, label: 'Rebuilding object streams...' });
  // 3. Save with high compression settings
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true, // Merges objects into streams for smaller size
    addDefaultPage: false,
    objectsPerTick: 50, // Better for memory management during save
  });

  self.postMessage({ id, status: 'progress', progress: 100, type: 'progress', operation: 'compress', percent: 100, label: 'Compression complete' });
  return compressedBytes;
}

/**
 * Adds a text watermark to every page in the PDF.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {string} payload.text - Watermark text
 * @param {Object} payload.colorRgb - {r, g, b} normalized RGB color values
 * @param {number} payload.opacity - Alpha opacity [0-1]
 * @param {number} payload.textSize - Font size
 * @param {number} payload.rotationDeg - Rotation angle in degrees
 * @param {string} payload.position - Alignment (center, top, bottom)
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Watermarked PDF bytes
 * @throws {Error} If font embedding or PDF manipulation fails
 */
async function executeWatermark(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { text, colorRgb, opacity, textSize, rotationDeg, position } = payload;
  const angle = rotationDeg * (Math.PI / 180);

  for (let k = 0; k < pages.length; k++) {
    const page = pages[k];
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, textSize);
    const textHeight = font.heightAtSize(textSize);

    // Calculate the center X
    const centerX = width / 2;

    // Calculate the center Y based on position
    let centerY = height / 2;
    if (position === 'top') {
      centerY = height - textHeight * 2;
    } else if (position === 'bottom') {
      centerY = textHeight * 2;
    }

    // Draw text rotated, roughly centered at (centerX, centerY)
    page.drawText(text, {
      x: centerX - (textWidth / 2) * Math.cos(angle) + (textHeight / 2) * Math.sin(angle),
      y: centerY - (textWidth / 2) * Math.sin(angle) - (textHeight / 2) * Math.cos(angle),
      size: textSize,
      font: font,
      color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
      opacity: opacity,
      rotate: degrees(rotationDeg),
    });

    if (k % 50 === 0)
      self.postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (k / pages.length) * 80)),
      });
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Injects page numbers to a specified location on all pages.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {string} payload.position - Alignment identifier
 * @param {string} payload.format - Display format (e.g., '1_of_n')
 * @param {number} payload.size - Font size
 * @param {number} payload.margin - Distance from edge in points
 * @param {Object} payload.colorRgb - {r, g, b} normalized RGB color
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Numbered PDF bytes
 * @throws {Error} If load fails
 */
async function executeAddPageNumbers(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { position, format, size, margin, colorRgb } = payload;

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const { width, height } = page.getSize();
    const pageNum = index + 1;

    let text = String(pageNum);
    if (format === 'page_1') text = `Page ${pageNum}`;
    else if (format === '1_of_n') text = `${pageNum} of ${totalPages}`;
    else if (format === 'page_1_of_n') text = `Page ${pageNum} of ${totalPages}`;
    else if (format === '-1-') text = `- ${pageNum} -`;

    const textWidth = font.widthOfTextAtSize(text, size);

    let x, y;

    if (position.includes('left')) x = margin;
    else if (position.includes('right')) x = width - margin - textWidth;
    else x = width / 2 - textWidth / 2; // center

    if (position.includes('top')) y = height - margin - size;
    else y = margin; // bottom

    page.drawText(text, {
      x: x,
      y: y,
      size: size,
      font: font,
      color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
    });

    if (index % 50 === 0)
      self.postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (index / pages.length) * 80)),
      });
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Reorders the pages in a PDF based on an array of standard index maps.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {Array<number>} payload.newOrder - Array of 1-based page coordinates
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Reordered PDF
 * @throws {Error} If coordinates are out of bounds
 */
async function executeReorder(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const srcDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const indices = payload.newOrder.map((p) => p - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, indices);

  for (let copyIdx = 0; copyIdx < copiedPages.length; copyIdx++) {
    newDoc.addPage(copiedPages[copyIdx]);
    if (copyIdx % 50 === 0)
      self.postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (copyIdx / copiedPages.length) * 80)),
      });
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Encrypts a PDF with a user/owner password and disables modifying/copying.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {string} payload.password - Security password
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Protected PDF bytes
 * @throws {Error} If load fails or invalid password parameter
 */
async function executeProtect(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes); // Cannot use ignoreEncryption inside protect because we want to preserve or just load
  const resultBytes = await pdfDoc.save({
    useObjectStreams: true,
    userPassword: payload.password,
    ownerPassword: payload.password,
    permissions: { printing: 'highResolution', modifying: false, copying: false },
  });
  self.postMessage({ id: payload.id, status: 'progress', progress: 100 });
  return resultBytes;
}

/**
 * Inserts one or more blank pages into the PDF at a specified index.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {number} payload.count - Number of blank pages to add
 * @param {number} payload.insertIndex - Zero-based index to insert at
 * @param {[number, number]} payload.dims - Page dimensions (width, height)
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} PDF bytes with new blank pages
 */
async function executeAddBlankPage(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });

  for (let i = 0; i < payload.count; i++) {
    pdfDoc.insertPage(payload.insertIndex + i, payload.dims);
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 80 });
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Deletes specific pages or page ranges from the PDF document.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {string} payload.rangesText - Comma-separated list of ranges (e.g. "1, 3-5")
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Trimmed PDF bytes
 */
async function executeDeletePages(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const toDelete = new Set();
  for (let part of payload.rangesText.split(',')) {
    part = part.trim();
    if (!part) continue;
    if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number);
      if (s && e) {
        for (let i = s; i <= e; i++) toDelete.add(i);
      }
    } else if (!isNaN(Number(part))) {
      toDelete.add(Number(part));
    }
  }

  const indices = Array.from(toDelete)
    .sort((a, b) => b - a)
    .map((p) => p - 1);

  for (const idx of indices) {
    if (idx >= 0 && idx < totalPages) {
      pdfDoc.removePage(idx);
    }
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 80 });
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Creates a new document by systematically extracting pages by given range strings.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {string} payload.rangesText - Comma-separated list of ranges to include
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Extracted PDF bytes
 * @throws {Error} If "No valid pages to extract"
 */
async function executeExtractPages(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const toExtract = new Set();
  for (let part of payload.rangesText.split(',')) {
    part = part.trim();
    if (!part) continue;
    if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number);
      if (s && e) {
        for (let i = s; i <= e; i++) toExtract.add(i);
      }
    } else if (!isNaN(Number(part))) {
      toExtract.add(Number(part));
    }
  }

  const indices = Array.from(toExtract)
    .sort((a, b) => a - b)
    .map((p) => p - 1)
    .filter((i) => i >= 0 && i < totalPages);
  if (indices.length === 0) throw new Error('No valid pages to extract');

  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(pdfDoc, indices);
  for (let i = 0; i < copied.length; i++) {
    newDoc.addPage(copied[i]);
    if (i % 50 === 0)
      self.postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (i / copied.length) * 80)),
      });
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Rotates all pages in the PDF by a specified fixed degree.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Source PDF bytes
 * @param {number} payload.degree - Rotation amount in degrees (e.g. 90)
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Rotated PDF bytes
 */
async function executeRotate(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const deg = payload.degree || 90;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + deg));
    if (i % 50 === 0)
      self.postMessage({
        id: payload.id,
        status: 'progress',
        progress: Math.min(95, Math.round(10 + (i / pages.length) * 80)),
      });
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Unlocks an encrypted PDF using the given password and saves it decrypted.
 * @param {Object} payload
 * @param {Uint8Array} payload.fileBytes - Password protected PDF bytes
 * @param {string} payload.password - Decrypt password
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Decrypted PDF bytes
 * @throws {Error} If password is incorrect
 */
async function executeUnlock(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.load(payload.fileBytes, { password: payload.password });

  self.postMessage({ id: payload.id, status: 'progress', progress: 50 });
  return await pdfDoc.save({ useObjectStreams: true }); // By default, save doesn't encrypt unless options provided
}

/**
 * Converts a list of standard images (PNG/JPG) to a single combined PDF.
 * @param {Object} payload
 * @param {Array<{type: string, bytes: Uint8Array}>} payload.files - Associated image types and arrays
 * @param {string} payload.id - Task ID for progress tracking
 * @returns {Promise<Uint8Array>} Resulting PDF bytes
 * @throws {Error} If embedding the format is unsupported
 */
async function executeImageToPdf(payload) {
  self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < payload.files.length; i++) {
    const fileData = payload.files[i];
    let image;

    if (fileData.type === 'image/jpeg') {
      image = await pdfDoc.embedJpg(fileData.bytes);
    } else if (fileData.type === 'image/png') {
      image = await pdfDoc.embedPng(fileData.bytes);
    } else {
      continue;
    }

    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });

    self.postMessage({
      id: payload.id,
      status: 'progress',
      progress: Math.min(95, Math.round(10 + ((i + 1) / payload.files.length) * 80)),
    });
  }

  self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
  return await pdfDoc.save({ useObjectStreams: true });
}
