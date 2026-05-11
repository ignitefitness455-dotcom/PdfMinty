import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'rotate',
        title: 'Rotate PDF',
        description: 'Rotate all pages in your PDF document',
        icon: '↻',
        actionText: '↻ Rotate PDF',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const direction = document.getElementById('rotate-direction').value;
            const pdfDoc = await (await import('pdf-lib')).PDFDocument.load(actualBytes);
            
            const pages = pdfDoc.getPages();
            for (let p of pages) {
                const currentAngle = p.getRotation().angle;
                let newAngle = currentAngle + (direction === 'right' ? 90 : -90);
                p.setRotation({ angle: newAngle });
            }
            
            const resultBytes = await pdfDoc.save({ useObjectStreams: true });
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_rotated.pdf');
            if (typeof showSuccess === 'function') showSuccess('PDF rotated successfully!');

        }
    });
})();
