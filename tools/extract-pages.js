import { setupToolUI } from '../utils/pdfToolsSetup.js';

export default function renderTool() {
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
            
            if (typeof window.showProgress === 'function') window.showProgress(5);
            
            const resultBytes = await window.runPdfWorkerTask('extract-pages', {
                fileBytes: actualBytes,
                rangesText: rangesText
            }, [actualBytes.buffer], (prog) => {
                if (typeof window.showProgress === 'function') window.showProgress(prog);
            });
            
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_extracted.pdf');
            if (typeof showSuccess === 'function') showSuccess('Pages extracted successfully!');

        }
    });
}
