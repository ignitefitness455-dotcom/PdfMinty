import { setupToolUI } from '../utils/pdfToolsSetup.js';

export default function renderTool() {
    const MM_TO_PT = 2.835;

    setupToolUI({
        toolId: 'crop-resize',
        title: 'Crop & Resize PDF',
        description: 'Adjust margins or change page dimensions',
        icon: '📐',
        actionText: '✂️ Crop PDF',
        isMultiFile: false,
        settingsHtml: `
                <div class="tabs-nav" style="display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 1.5rem;">
                    <button class="tab-btn active" data-target="crop-tab" style="background: none; border: none; color: var(--text); padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid var(--primary);">Crop</button>
                    <button class="tab-btn" data-target="resize-tab" style="background: none; border: none; color: var(--muted); padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent;">Resize</button>
                </div>

                <!-- CROP TAB -->
                <div id="crop-tab" class="tab-pane" style="display: block;">
                    <div class="input-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Top Margin (mm)</label>
                            <input type="number" id="crop-top" class="number-input" value="0" min="0" step="1" style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text);">
                        </div>
                        <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Right Margin (mm)</label>
                            <input type="number" id="crop-right" class="number-input" value="0" min="0" step="1" style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text);">
                        </div>
                        <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Bottom Margin (mm)</label>
                            <input type="number" id="crop-bottom" class="number-input" value="0" min="0" step="1" style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text);">
                        </div>
                        <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Left Margin (mm)</label>
                            <input type="number" id="crop-left" class="number-input" value="0" min="0" step="1" style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text);">
                        </div>
                    </div>

                    <div class="radio-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <div class="radio-title" style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">Apply to</div>
                        <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="crop-pages" value="all" checked style="accent-color: var(--primary);"> All pages</label>
                        <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="crop-pages" value="first" style="accent-color: var(--primary);"> Current page only (Page 1)</label>
                    </div>
                </div>

                <!-- RESIZE TAB -->
                <div id="resize-tab" class="tab-pane" style="display: none;">
                    <div class="presets" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                        <button type="button" class="preset-btn" data-w="210" data-h="297" style="background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">A4</button>
                        <button type="button" class="preset-btn" data-w="297" data-h="420" style="background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">A3</button>
                        <button type="button" class="preset-btn" data-w="215.9" data-h="279.4" style="background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Letter</button>
                        <button type="button" class="preset-btn" data-w="215.9" data-h="355.6" style="background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Legal</button>
                    </div>

                    <div class="input-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Width (mm)</label>
                            <input type="number" id="resize-w" class="number-input" value="210" min="10" step="0.1" style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text);">
                        </div>
                        <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Height (mm)</label>
                            <input type="number" id="resize-h" class="number-input" value="297" min="10" step="0.1" style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: var(--bg); color: var(--text);">
                        </div>
                    </div>

                    <div class="radio-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <div class="radio-title" style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">Content Scaling</div>
                        <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="resize-scale" value="fit" checked style="accent-color: var(--primary);"> Scale to fit (Maintain aspect ratio)</label>
                        <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="resize-scale" value="stretch" style="accent-color: var(--primary);"> Stretch to fill</label>
                        <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="resize-scale" value="keep" style="accent-color: var(--primary);"> Keep original size (Center)</label>
                    </div>
                </div>
        `,
        onInit: () => {
            const btnApply = document.getElementById('btn-apply');
            let activeMode = 'crop';

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tab-btn').forEach(b => {
                        b.style.color = 'var(--muted)';
                        b.style.borderBottomColor = 'transparent';
                    });
                    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
                    
                    btn.style.color = 'var(--text)';
                    btn.style.borderBottomColor = 'var(--primary)';
                    document.getElementById(btn.dataset.target).style.display = 'block';
                    
                    activeMode = btn.dataset.target === 'crop-tab' ? 'crop' : 'resize';
                    if (btnApply) btnApply.innerHTML = activeMode === 'crop' ? '✂️ Crop PDF' : '📐 Resize PDF';
                });
            });

            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('resize-w').value = btn.dataset.w;
                    document.getElementById('resize-h').value = btn.dataset.h;
                });
            });
            window.crActiveMode = () => activeMode;
        },
        onApply: async ({ actualBytes, currentFileName }) => {
            const mode = window.crActiveMode();
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(actualBytes);

            if (mode === 'crop') {
                const top = parseFloat(document.getElementById('crop-top').value) || 0;
                const right = parseFloat(document.getElementById('crop-right').value) || 0;
                const bottom = parseFloat(document.getElementById('crop-bottom').value) || 0;
                const left = parseFloat(document.getElementById('crop-left').value) || 0;
                const applyTo = document.querySelector('input[name="crop-pages"]:checked').value;

                const pages = pdfDoc.getPages();
                const pagesToProcess = applyTo === 'all' ? pages : [pages[0]];

                for (const page of pagesToProcess) {
                    const box = page.getCropBox() || page.getMediaBox();
                    const newX = box.x + (left * MM_TO_PT);
                    const newY = box.y + (bottom * MM_TO_PT);
                    const newWidth = box.width - ((left + right) * MM_TO_PT);
                    const newHeight = box.height - ((top + bottom) * MM_TO_PT);
                    if (newWidth <= 0 || newHeight <= 0) throw new Error("Crop margins are too large for the page dimensions.");
                    page.setCropBox(newX, newY, newWidth, newHeight);
                }
                const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
                if (typeof downloadFile === 'function') downloadFile(modifiedPdfBytes, `${currentFileName}-cropped.pdf`);
                if (typeof showSuccess === 'function') showSuccess('PDF cropped successfully!');
            } else {
                const targetW_mm = parseFloat(document.getElementById('resize-w').value);
                const targetH_mm = parseFloat(document.getElementById('resize-h').value);
                const scaleMode = document.querySelector('input[name="resize-scale"]:checked').value;
                if (!targetW_mm || !targetH_mm || targetW_mm <= 0 || targetH_mm <= 0) throw new Error("Please enter valid width and height.");

                const targetW = targetW_mm * MM_TO_PT;
                const targetH = targetH_mm * MM_TO_PT;

                const newDoc = await PDFDocument.create();
                const srcPages = pdfDoc.getPages();
                const embeddedPages = await newDoc.embedPages(srcPages);

                for (let i = 0; i < srcPages.length; i++) {
                    const origPage = srcPages[i];
                    const embeddedPage = embeddedPages[i];
                    const { width: origW, height: origH } = origPage.getSize();
                    
                    const newPage = newDoc.addPage([targetW, targetH]);
                    
                    if (scaleMode === 'fit') {
                        const scale = Math.min(targetW / origW, targetH / origH);
                        const drawW = origW * scale;
                        const drawH = origH * scale;
                        const tx = (targetW - drawW) / 2;
                        const ty = (targetH - drawH) / 2;
                        newPage.drawPage(embeddedPage, { x: tx, y: ty, width: drawW, height: drawH });
                    } else if (scaleMode === 'stretch') {
                        newPage.drawPage(embeddedPage, { x: 0, y: 0, width: targetW, height: targetH });
                    } else if (scaleMode === 'keep') {
                        const tx = (targetW - origW) / 2;
                        const ty = (targetH - origH) / 2;
                        newPage.drawPage(embeddedPage, { x: tx, y: ty, width: origW, height: origH });
                    }
                }
                const modifiedPdfBytes = await newDoc.save({ useObjectStreams: true });
                if (typeof downloadFile === 'function') downloadFile(modifiedPdfBytes, `${currentFileName}-resized.pdf`);
                if (typeof showSuccess === 'function') showSuccess('PDF resized successfully!');
            }
        }
    });
}
