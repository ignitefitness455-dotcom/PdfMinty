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
            
            if (typeof window.showProgress === 'function') window.showProgress(5);
            
            const resultBytes = await window.runPdfWorkerTask('delete-pages', {
                fileBytes: actualBytes,
                rangesText: rangesText
            }, [actualBytes.buffer], (prog) => {
                if (typeof window.showProgress === 'function') window.showProgress(prog);
            });
            
            if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_deleted.pdf');
            if (typeof showSuccess === 'function') showSuccess('Pages deleted successfully!');

        }
    });
})();
