import { setupToolUI } from '../utils/pdfToolsSetup.js';

export default function renderTool() {
    setupToolUI({
        toolId: 'pdf-to-image',
        title: 'PDF to Image',
        description: 'Convert each page of your PDF into a JPG image',
        icon: '🖼️',
        actionText: '🖼️ Convert to JPG',
        isMultiFile: false,
        onApply: async ({ actualBytes, currentFileName }) => {

            if (typeof window.pdfjsLib === 'undefined') throw new Error("PDF.js not loaded");
            
            const pdf = await window.pdfjsLib.getDocument({data: actualBytes}).promise;
            
            const JSZip = (await import('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js')).default || window.JSZip;
            const zip = new JSZip();
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width; canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                
                const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
                zip.file(`page_${i}.jpg`, blob);
                if(typeof window.showProgress === 'function') window.showProgress((i / pdf.numPages)*90);
            }
            
            const zipBlob = await zip.generateAsync({type:"blob"});
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a'); a.href = url; a.download = currentFileName + '_images.zip'; a.click();
            if (typeof showSuccess === 'function') showSuccess('PDF converted to images!');

        }
    });
}
