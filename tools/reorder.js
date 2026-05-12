import { setupToolUI } from '../utils/pdfToolsSetup.js';

export default function renderTool() {
    setupToolUI({
        toolId: 'reorder',
        title: 'Reorder PDF',
        description: 'Change the order of pages in your PDF',
        icon: '🔄',
        actionText: '🔄 Reorder PDF',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const realInput = document.getElementById('page-order') || document.querySelector('input[type="text"]');
            if(!realInput || !realInput.value) throw new Error("Enter page order.");
            
            let newOrder = [];
            for (let p of realInput.value.trim().split(',')) {
                let pStr = p.trim();
                if(pStr.includes('-')) {
                    const [s, e] = pStr.split('-').map(Number);
                    if(s <= e) { for(let i=s; i<=e; i++) newOrder.push(i); }
                    else { for(let i=s; i>=e; i--) newOrder.push(i); }
                } else if(pStr) newOrder.push(Number(pStr));
            }
            
            const pdfDoc = await (await import('pdf-lib')).PDFDocument.load(actualBytes);
            const totalPages = pdfDoc.getPageCount();

            if(newOrder.length !== totalPages) throw new Error("You must include all pages exactly once.");
            
            let resultBytes;
            if (typeof window.runPdfWorkerTask === 'function') {
                const payload = { fileBytes: new Uint8Array(actualBytes), newOrder };
                resultBytes = await window.runPdfWorkerTask('reorder', payload, [payload.fileBytes.buffer]);
            } else {
                throw new Error("Worker not found");
            }
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_reordered.pdf');
            if (typeof showSuccess === 'function') showSuccess('PDF reordered successfully!');

        }
    });
}
