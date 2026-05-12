import { setupToolUI } from '../utils/pdfToolsSetup.js';

(function() {
    setupToolUI({
        toolId: 'add-blank-page',
        title: 'Add Blank Page',
        description: 'Insert blank pages anywhere in your PDF',
        icon: '📄',
        actionText: '➕ Add Blank Page',
        isMultiFile: false,
        settingsHtml: `
                <div class="options-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="option-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <span class="option-label" style="font-weight: 600; font-size: 0.95rem; color: var(--text); margin-bottom: 0.25rem;">Insert Position</span>
                        
                        <div class="input-row" style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                            <span>Insert</span>
                            <input type="number" id="blank-count" class="number-input" style="width: 70px; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--card); color: var(--text); font-family: inherit; font-size: 1rem; text-align: center;" value="1" min="1" max="10">
                            <span>blank page(s)</span>
                        </div>
                        
                        <div class="input-row" style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                            <select id="pos-type" class="select-input" style="padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--card); color: var(--text); font-family: inherit; font-size: 1rem; cursor: pointer;">
                                <option value="after" selected>After</option>
                                <option value="before">Before</option>
                            </select>
                            <span>page</span>
                            <input type="number" id="target-page" class="number-input" style="width: 70px; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--card); color: var(--text); font-family: inherit; font-size: 1rem; text-align: center;" value="1" min="1">
                        </div>
                        
                        <div class="shortcuts" style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <button type="button" id="btn-beginning" class="btn-shortcut" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;">Beginning</button>
                            <button type="button" id="btn-end" class="btn-shortcut" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;">End</button>
                        </div>
                    </div>

                    <div class="option-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <span class="option-label" style="font-weight: 600; font-size: 0.95rem; color: var(--text); margin-bottom: 0.25rem;">Page Size</span>
                        <div class="radio-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem;">
                                <input type="radio" name="page-size" value="same" style="accent-color: var(--primary); width: 1.1rem; height: 1.1rem; cursor: pointer;" checked> Same as document
                            </label>
                            <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem;">
                                <input type="radio" name="page-size" value="a4" style="accent-color: var(--primary); width: 1.1rem; height: 1.1rem; cursor: pointer;"> A4 (210×297mm)
                            </label>
                            <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text); font-size: 0.95rem;">
                                <input type="radio" name="page-size" value="letter" style="accent-color: var(--primary); width: 1.1rem; height: 1.1rem; cursor: pointer;"> Letter (216×279mm)
                            </label>
                        </div>
                    </div>
                </div>
        `,
        onInit: () => {
            document.getElementById('btn-beginning')?.addEventListener('click', () => {
                const pos = document.getElementById('pos-type');
                if (pos) pos.value = 'before';
                const tp = document.getElementById('target-page');
                if (tp) tp.value = 1;
            });
            document.getElementById('btn-end')?.addEventListener('click', () => {
                const pos = document.getElementById('pos-type');
                if (pos) pos.value = 'after';
                const tp = document.getElementById('target-page');
                if (tp) tp.value = 999999;
            });
        },
        onApply: async ({ actualBytes, currentFileName }) => {
            const count = parseInt(document.getElementById('blank-count').value, 10);
            const targetPageRaw = parseInt(document.getElementById('target-page').value, 10);
            const posType = document.getElementById('pos-type').value;
            const sizeType = document.querySelector('input[name="page-size"]:checked').value;

            if (isNaN(count) || count < 1 || count > 10) throw new Error("Please enter a valid number of pages to insert (1-10).");

            if (typeof window.showProgress === 'function') window.showProgress(5);

            // We must calculate dimensions before sending to worker because it requires totalPages
            const pdfDoc = await (await import('pdf-lib')).PDFDocument.load(actualBytes, { ignoreEncryption: true });
            const totalPages = pdfDoc.getPageCount();
            
            let targetPage = isNaN(targetPageRaw) ? totalPages : Math.min(Math.max(1, targetPageRaw), totalPages);

            let insertIndex = posType === 'before' ? targetPage - 1 : targetPage;
            let dims = [595.28, 841.89];
            if (sizeType === 'same') {
                const refPageIdx = Math.min(Math.max(0, insertIndex > 0 ? insertIndex - 1 : 0), totalPages - 1);
                const refPage = pdfDoc.getPage(refPageIdx);
                const { width, height } = refPage.getSize();
                dims = [width, height];
            } else if (sizeType === 'a4') {
                dims = [595.28, 841.89];
            } else if (sizeType === 'letter') {
                dims = [612.00, 792.00];
            }

            const modifiedPdfBytes = await window.runPdfWorkerTask('add-blank-page', {
                fileBytes: actualBytes,
                count,
                insertIndex,
                dims
            }, [actualBytes.buffer], (prog) => {
                if (typeof window.showProgress === 'function') window.showProgress(prog);
            });
            
            if (typeof downloadFile === 'function') downloadFile(modifiedPdfBytes, currentFileName + '_blank_added.pdf');
            if (typeof showSuccess === 'function') showSuccess('Blank pages added successfully!');
        }
    });
})();
