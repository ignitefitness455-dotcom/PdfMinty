importScripts('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
    const { id, task, payload } = e.data;
    try {
        let result;
        if (task === 'merge') {
            result = await executeMerge(payload);
        } else if (task === 'split') {
            result = await executeSplit(payload);
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
    const { PDFDocument } = PDFLib;
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
    const { PDFDocument } = PDFLib;
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
