import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'split',
        title: 'Split PDF',
        description: 'Extract pages or split your PDF into multiple files',
        icon: '✂️',
        actionText: '✂️ Split PDF',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            const rangesText = document.getElementById('split-ranges').value.trim();
            if(!rangesText) throw new Error("Enter ranges to split.");
            
            let ranges = [];
            for(let p of rangesText.split(',')) {
                p = p.trim();
                if(p.includes('-')) {
                   const [s, e] = p.split('-').map(Number);
                   if(s && e) ranges.push({start: s, end: e});
                } else if(!isNaN(Number(p))) {
                   ranges.push({start: Number(p), end: Number(p)});
                }
            }
            if(ranges.length === 0) throw new Error("Invalid ranges.");
            
            if (typeof window.runPdfWorkerTask === 'function') {
                const payload = { fileBytes: new Uint8Array(actualBytes), ranges, fileName: currentFileName };
                const results = await window.runPdfWorkerTask('split', payload, [payload.fileBytes.buffer]);
                
                if (results.length === 1) {
                    if (typeof downloadFile === 'function') downloadFile(results[0].bytes, results[0].name);
                } else {
                    const JSZip = (await import('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js')).default || window.JSZip;
                    const zip = new JSZip();
                    results.forEach(r => zip.file(r.name, r.bytes));
                    const zipBlob = await zip.generateAsync({type:"blob"});
                    const a = document.createElement('a'); a.href = URL.createObjectURL(zipBlob);
                    a.download = currentFileName + '_split.zip'; a.click();
                }
            } else {
                throw new Error("Worker not found");
            }
            if (typeof showSuccess === 'function') showSuccess('PDF split successfully!');

        }
    });
})();
