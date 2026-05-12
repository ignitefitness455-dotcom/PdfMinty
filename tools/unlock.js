import { setupToolUI } from '../utils/pdfToolsSetup.js';

export default function renderTool() {
    setupToolUI({
        toolId: 'unlock',
        title: 'Unlock PDF',
        description: 'Remove password protection from your PDF',
        icon: '🔓',
        actionText: '🔓 Unlock PDF',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const password = document.getElementById('pdf-password') ? document.getElementById('pdf-password').value : document.querySelector('input[type="password"]').value;
            
            if (typeof window.showProgress === 'function') window.showProgress(5);
            
            try {
                const resultBytes = await window.runPdfWorkerTask('unlock', {
                    fileBytes: actualBytes,
                    password: password
                }, [actualBytes.buffer], (prog) => {
                    if (typeof window.showProgress === 'function') window.showProgress(prog);
                });
                
                if (typeof downloadFile === 'function') downloadFile(resultBytes, currentFileName + '_unlocked.pdf');
                if (typeof showSuccess === 'function') showSuccess('PDF unlocked successfully!');
            } catch(e) {
                if(e.message && e.message.includes('Incorrect password')) throw e;
                throw new Error("Incorrect password or unable to unlock.", { cause: e });
            }

        }
    });
}
