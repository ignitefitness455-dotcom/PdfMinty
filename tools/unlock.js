import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'unlock',
        title: 'Unlock PDF',
        description: 'Remove password protection from your PDF',
        icon: '🔓',
        actionText: '🔓 Unlock PDF',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const password = document.getElementById('pdf-password') ? document.getElementById('pdf-password').value : document.querySelector('input[type="password"]').value;
            
            let pdfDoc;
            try {
                pdfDoc = await (await import('pdf-lib')).PDFDocument.load(actualBytes, { password });
            } catch(e) {
                throw new Error("Incorrect password or unable to unlock.", { cause: e });
            }
            
            const newDoc = await (await import('pdf-lib')).PDFDocument.create();
            const copied = await newDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copied.forEach(p => newDoc.addPage(p));
            
            const resultBytes = await newDoc.save({ useObjectStreams: true });
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_unlocked.pdf');
            if (typeof showSuccess === 'function') showSuccess('PDF unlocked successfully!');

        }
    });
})();
