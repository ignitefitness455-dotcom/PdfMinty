import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'compress',
        title: 'Compress PDF',
        description: 'Reduce file size by optimizing PDF structure or compressing images',
        icon: '🗜️',
        actionText: '🗜️ Compress PDF',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            let resultBytes;
            if (typeof window.runPdfWorkerTask === 'function') {
                const payload = { fileBytes: new Uint8Array(actualBytes) };
                resultBytes = await window.runPdfWorkerTask('compress', payload, [payload.fileBytes.buffer]);
            } else {
                throw new Error("Worker not found");
            }
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_compressed.pdf');
            if (typeof showSuccess === 'function') showSuccess('PDF compressed successfully!');

        }
    });
})();
