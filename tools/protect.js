import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'protect',
        title: 'Protect PDF',
        description: 'Add password protection to your PDF document',
        icon: '🔒',
        actionText: '🔒 Protect PDF',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const password = document.getElementById('pdf-password').value;
            if(!password) throw new Error("Password is required");
            
            const pdfDoc = await (await import('pdf-lib')).PDFDocument.load(actualBytes);
            const resultBytes = await pdfDoc.save({
                useObjectStreams: true,
                userPassword: password,
                ownerPassword: password,
                permissions: { printing: 'highResolution', modifying: false, copying: false }
            });
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_protected.pdf');
            if (typeof showSuccess === 'function') showSuccess('PDF protected successfully!');

        }
    });
})();
