import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'extract-pages',
        title: 'Extract Pages',
        description: 'Get specific pages from your PDF as a new document',
        icon: '📑',
        actionText: '📑 Extract Pages',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const rangesText = document.getElementById('extract-ranges').value.trim();
            if (!rangesText) throw new Error("Please enter pages to extract.");
            
            const pdfDoc = await (await import('pdf-lib')).PDFDocument.load(actualBytes);
            const totalPages = pdfDoc.getPageCount();

            const toExtract = new Set();
            for (let part of rangesText.split(',')) {
                part = part.trim();
                if (!part) continue;
                if (part.includes('-')) {
                    const [s, e] = part.split('-').map(Number);
                    if(s && e) for (let i = s; i <= e; i++) toExtract.add(i);
                } else if (!isNaN(Number(part))) {
                    toExtract.add(Number(part));
                }
            }
            const indices = Array.from(toExtract).sort((a,b)=>a-b).map(p => p - 1).filter(i => i >= 0 && i < totalPages);
            if(indices.length === 0) throw new Error("No valid pages to extract");
            
            const newDoc = await (await import('pdf-lib')).PDFDocument.create();
            const copied = await newDoc.copyPages(pdfDoc, indices);
            copied.forEach(p => newDoc.addPage(p));
            
            const resultBytes = await newDoc.save({ useObjectStreams: true });
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_extracted.pdf');
            if (typeof showSuccess === 'function') showSuccess('Pages extracted successfully!');

        }
    });
})();
