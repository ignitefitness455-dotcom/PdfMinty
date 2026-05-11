import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'image-to-pdf',
        title: 'Image to PDF',
        description: 'Convert JPG or PNG images into a PDF document',
        icon: '🖼️',
        actionText: '🖼️ Convert to PDF',
        isMultiFile: true,
        onApply: async ({ filesArray }) => {
            if (filesArray.length === 0) return;
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.create();
            
            for (let i = 0; i < filesArray.length; i++) {
                const file = filesArray[i].fileObj;
                const fileBytes = await file.arrayBuffer();
                let image;
                
                if (file.type === 'image/jpeg') {
                    image = await pdfDoc.embedJpg(fileBytes);
                } else if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(fileBytes);
                } else {
                    continue;
                }
                
                const { width, height } = image.scale(1);
                const page = pdfDoc.addPage([width, height]);
                page.drawImage(image, { x: 0, y: 0, width, height });
            }

            const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
            
            if (typeof downloadFile === 'function') {
                downloadFile(pdfBytes, 'images-converted.pdf');
            }
            if (typeof showSuccess === 'function') showSuccess('Images converted to PDF successfully!');
        }
    });
})();
