import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'delete-pages',
        title: 'Delete Pages',
        description: 'Remove unwanted pages from your PDF',
        icon: '🗑️',
        actionText: '🗑️ Delete Pages',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const rangesText = document.getElementById('delete-ranges').value.trim();
            if (!rangesText) throw new Error("Please enter pages to delete.");
            
            const toDelete = new Set();
            for (let part of rangesText.split(',')) {
                part = part.trim();
                if (!part) continue;
                if (part.includes('-')) {
                    const [s, e] = part.split('-').map(Number);
                    if(s && e) for (let i = s; i <= e; i++) toDelete.add(i);
                } else {
                    toDelete.add(Number(part));
                }
            }
            
            const pdfDoc = await (await import('pdf-lib')).PDFDocument.load(actualBytes);
            const totalPages = pdfDoc.getPageCount();
            const validIndices = [];
            for (let i = 0; i < totalPages; i++) {
                if (!toDelete.has(i + 1)) validIndices.push(i);
            }
            if (validIndices.length === 0) throw new Error("Cannot delete all pages.");
            
            const newDoc = await (await import('pdf-lib')).PDFDocument.create();
            const copied = await newDoc.copyPages(pdfDoc, validIndices);
            copied.forEach(p => newDoc.addPage(p));
            
            const resultBytes = await newDoc.save({ useObjectStreams: true });
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_deleted.pdf');
            if (typeof showSuccess === 'function') showSuccess('Pages deleted successfully!');

        }
    });
})();
