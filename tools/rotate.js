import { setupToolUI } from '../utils/pdfToolsSetup.js';

export default function renderTool() {
    setupToolUI({
        toolId: 'rotate',
        title: 'Rotate PDF',
        description: 'Rotate all pages in your PDF document',
        icon: '↻',
        actionText: '↻ Rotate PDF',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const direction = document.getElementById('rotate-direction').value;
            const degree = direction === 'right' ? 90 : -90;
            
            if (typeof window.showProgress === 'function') window.showProgress(5);
            
            const resultBytes = await window.runPdfWorkerTask('rotate', {
                fileBytes: actualBytes,
                degree: degree
            }, [actualBytes.buffer], (prog) => {
                if (typeof window.showProgress === 'function') window.showProgress(prog);
            });
            
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_rotated.pdf');
            if (typeof showSuccess === 'function') showSuccess('PDF rotated successfully!');

        }
    });
}
