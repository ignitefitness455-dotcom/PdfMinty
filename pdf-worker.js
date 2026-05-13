import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

self.onmessage = async function(e) {
    const { id, task, payload } = e.data;
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
            const buffers = result.map(r => r.bytes.buffer);
            self.postMessage({ id, status: 'success', result }, buffers);
        } else {
            self.postMessage({ id, status: 'success', result });
        }
    } catch (err) {
        self.postMessage({ id, status: 'error', error: err.message, stack: err.stack });
    }
};

async function executeMerge(payload) {
    const mergedPdf = await PDFDocument.create();
    
    for(let i=0; i<payload.files.length; i++) {
        let fileBytes = payload.files[i]; // Uint8Array
        let pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        for (let j = 0; j < copiedPages.length; j++) {
            mergedPdf.addPage(copiedPages[j]);
        }
        
        self.postMessage({ id: payload.id, status: 'progress', progress: Math.min(95, Math.round(((i+1)/payload.files.length)*95)) });
    }
    
    self.postMessage({ id: payload.id, status: 'progress', progress: 98 });
    return await mergedPdf.save({ useObjectStreams: true });
}

async function executeSplit(payload) {
    const srcDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
    self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
    
    const results = [];
    const totalRanges = payload.ranges.length;
    
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
            }
            const pdfBytes = await newDoc.save({ useObjectStreams: true });
            results.push({ name: `${payload.fileName}_${r.start}-${r.end}.pdf`, bytes: pdfBytes });
        }
        
        self.postMessage({ id: payload.id, status: 'progress', progress: Math.round(10 + ((c+1)/totalRanges)*85) });
    }
    
    return results;
}


async function executeCompress(payload) {
    const { fileBytes, id } = payload;
    self.postMessage({ id, status: 'progress', progress: 5 });

    // Load with specific optimizations
    const pdfDoc = await PDFDocument.load(fileBytes, { 
        ignoreEncryption: true,
        updateMetadata: false 
    });
    
    self.postMessage({ id, status: 'progress', progress: 20 });

    // 1. Remove unnecessary metadata/tags
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    // 2. Process pages
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
        // Potential for future image downscaling logic here
        if (i % 20 === 0) {
            self.postMessage({ id, status: 'progress', progress: 20 + Math.round((i / pages.length) * 60) });
        }
    }

    // 3. Save with high compression settings
    const compressedBytes = await pdfDoc.save({
        useObjectStreams: true, // Merges objects into streams for smaller size
        addDefaultPage: false,
        objectsPerTick: 50 // Better for memory management during save
    });

    self.postMessage({ id, status: 'progress', progress: 100 });
    return compressedBytes;
}

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
            centerY = height - (textHeight * 2);
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
        
        if (k % 50 === 0) self.postMessage({ id: payload.id, status: 'progress', progress: Math.min(95, Math.round(10 + (k / pages.length) * 80)) });
    }

    self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
    return await pdfDoc.save({ useObjectStreams: true });
}

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

        if (index % 50 === 0) self.postMessage({ id: payload.id, status: 'progress', progress: Math.min(95, Math.round(10 + (index / pages.length) * 80)) });
    }

    self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
    return await pdfDoc.save({ useObjectStreams: true });
}

async function executeReorder(payload) {
    self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
    const srcDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    
    const indices = payload.newOrder.map(p => p - 1);
    const copiedPages = await newDoc.copyPages(srcDoc, indices);
    
    for (let copyIdx = 0; copyIdx < copiedPages.length; copyIdx++) {
        newDoc.addPage(copiedPages[copyIdx]);
        if (copyIdx % 50 === 0) self.postMessage({ id: payload.id, status: 'progress', progress: Math.min(95, Math.round(10 + (copyIdx / copiedPages.length) * 80)) });
    }

    self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
    return await newDoc.save({ useObjectStreams: true });
}

async function executeProtect(payload) {
    self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
    const pdfDoc = await PDFDocument.load(payload.fileBytes); // Cannot use ignoreEncryption inside protect because we want to preserve or just load
    const resultBytes = await pdfDoc.save({
        useObjectStreams: true,
        userPassword: payload.password,
        ownerPassword: payload.password,
        permissions: { printing: 'highResolution', modifying: false, copying: false }
    });
    self.postMessage({ id: payload.id, status: 'progress', progress: 100 });
    return resultBytes;
}

async function executeAddBlankPage(payload) {
    self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
    const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
    
    for (let i = 0; i < payload.count; i++) {
        pdfDoc.insertPage(payload.insertIndex + i, payload.dims);
    }
    
    self.postMessage({ id: payload.id, status: 'progress', progress: 80 });
    return await pdfDoc.save({ useObjectStreams: true });
}

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
    
    const indices = Array.from(toDelete).sort((a,b) => b - a).map(p => p - 1);
    
    for (const idx of indices) {
        if (idx >= 0 && idx < totalPages) {
            pdfDoc.removePage(idx);
        }
    }
    
    self.postMessage({ id: payload.id, status: 'progress', progress: 80 });
    return await pdfDoc.save({ useObjectStreams: true });
}

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
    
    const indices = Array.from(toExtract).sort((a,b) => a - b).map(p => p - 1).filter(i => i >= 0 && i < totalPages);
    if(indices.length === 0) throw new Error("No valid pages to extract");
    
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(pdfDoc, indices);
    for (let i = 0; i < copied.length; i++) {
        newDoc.addPage(copied[i]);
        if (i % 50 === 0) self.postMessage({ id: payload.id, status: 'progress', progress: Math.min(95, Math.round(10 + (i / copied.length) * 80)) });
    }
    
    self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
    return await newDoc.save({ useObjectStreams: true });
}

async function executeRotate(payload) {
    self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
    const pdfDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const deg = payload.degree || 90;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + deg));
        if (i % 50 === 0) self.postMessage({ id: payload.id, status: 'progress', progress: Math.min(95, Math.round(10 + (i / pages.length) * 80)) });
    }

    self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
    return await pdfDoc.save({ useObjectStreams: true });
}

async function executeUnlock(payload) {
    self.postMessage({ id: payload.id, status: 'progress', progress: 10 });
    const pdfDoc = await PDFDocument.load(payload.fileBytes, { password: payload.password });
    
    self.postMessage({ id: payload.id, status: 'progress', progress: 50 });
    return await pdfDoc.save({ useObjectStreams: true }); // By default, save doesn't encrypt unless options provided
}

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
        
        self.postMessage({ id: payload.id, status: 'progress', progress: Math.min(95, Math.round(10 + ((i + 1) / payload.files.length) * 80)) });
    }

    self.postMessage({ id: payload.id, status: 'progress', progress: 95 });
    return await pdfDoc.save({ useObjectStreams: true });
}
