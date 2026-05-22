import { ICONS } from "../src/ui/icons.js";
import { downloadFile } from '../src/utils/fileUtils.js';
import { setupToolUI } from '../src/utils/pdfToolsSetup.js';

/**
 * Initializes and renders the tool UI and logic.
 * @returns {void}
 */
export function init() {
  setupToolUI({
    toolId: 'rotate',
    title: 'Rotate PDF',
    description: 'Rotate all pages in your PDF document',
    icon: ICONS.rotate || '📄',
    actionText: '↻ Rotate PDF',
    isMultiFile: false,
    instructions: [
      'Upload your target PDF document.',
      'Choose the rotation direction or enter a custom degree.',
      'Click ↻ Rotate PDF to apply the rotation to all pages.',
      'Download the corrected document.'
    ],
    settingsHtml: `
      <div class="setting-group full-width" style="margin-bottom: 1.5rem;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Rotation Angle</label>
          <select id="rotate-direction" class="select-input" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: var(--surface); color: var(--text);" onchange="document.getElementById('custom-degree-container').style.display = this.value === 'custom' ? 'block' : 'none'">
              <option value="90">Rotate Right (90° Clockwise)</option>
              <option value="-90">Rotate Left (90° Counter-Clockwise)</option>
              <option value="180">Rotate 180° (Upside Down)</option>
              <option value="custom">Custom Degree</option>
          </select>
      </div>
      <div id="custom-degree-container" class="setting-group full-width" style="margin-bottom: 1.5rem; display: none;">
          <label class="input-label" style="margin-bottom: 0.5rem; color: var(--text);">Custom Degree</label>
          <input type="number" id="custom-degree" class="input-field" value="45" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: var(--surface); color: var(--text);" />
      </div>
    `,
    onApply: async ({ actualBytes, currentFileName }) => {
      const mode = document.getElementById('rotate-direction').value;
      let degree;
      if (mode === 'custom') {
        degree = parseFloat(document.getElementById('custom-degree').value) || 0;
      } else {
        degree = parseFloat(mode) || 90;
      }

      if (typeof window.UI !== 'undefined' && window.UI.showProgress) {
        window.UI.showProgress(10);
      } else if (typeof window.showProgress === 'function') {
        window.showProgress(10);
      }

      try {
        const { PDFDocument, degrees } = await import('pdf-lib');
        let resultBytes;

        if (degree % 90 === 0) {
          const pdfDoc = await PDFDocument.load(actualBytes, { ignoreEncryption: true });
          const pages = pdfDoc.getPages();
  
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const currentRotation = page.getRotation().angle;
            // Normalize to strictly 0, 90, 180, 270 to prevent viewer compatibility issues
            const finalAngle = ((currentRotation + degree) % 360 + 360) % 360;
            page.setRotation(degrees(finalAngle));
            
            if (i % 5 === 0) {
              const prog = Math.min(95, Math.round(10 + (i / pages.length) * 80));
              if (typeof window.UI !== 'undefined' && window.UI.showProgress) {
                window.UI.showProgress(prog);
              } else if (typeof window.showProgress === 'function') {
                window.showProgress(prog);
              }
            }
          }
          resultBytes = await pdfDoc.save({ useObjectStreams: true });
        } else {
          const srcDoc = await PDFDocument.load(actualBytes, { ignoreEncryption: true });
          const srcPages = srcDoc.getPages();
          const newPdfDoc = await PDFDocument.create();
          
          for (let i = 0; i < srcPages.length; i++) {
            let ep = null;
            try {
              const [embedded] = await newPdfDoc.embedPages([srcPages[i]]);
              ep = embedded;
            } catch (embedError) {
              // Usually fails if the page has no contents (is completely empty)
              console.warn("Could not embed page " + i, embedError);
            }
            
            const reqPage = srcPages[i];
            const width = reqPage.getSize().width;
            const height = reqPage.getSize().height;
            
            const rad = ((degree % 360) * Math.PI) / 180;
            const newWidth = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
            const newHeight = Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));
            
            const newPage = newPdfDoc.addPage([newWidth, newHeight]);
            
            if (ep) {
              const xOffset = newWidth / 2 - ((width / 2) * Math.cos(rad) - (height / 2) * Math.sin(rad));
              const yOffset = newHeight / 2 - ((width / 2) * Math.sin(rad) + (height / 2) * Math.cos(rad));
              
              newPage.drawPage(ep, {
                x: xOffset,
                y: yOffset,
                rotate: degrees(degree)
              });
            }
            
            if (i % 5 === 0) {
              const prog = Math.min(95, Math.round(10 + (i / srcPages.length) * 80));
              if (typeof window.UI !== 'undefined' && window.UI.showProgress) {
                window.UI.showProgress(prog);
              } else if (typeof window.showProgress === 'function') {
                window.showProgress(prog);
              }
            }
          }
          resultBytes = await newPdfDoc.save({ useObjectStreams: true });
        }

        if (typeof window.UI !== 'undefined' && window.UI.showProgress) {
          window.UI.showProgress(100);
        } else if (typeof window.showProgress === 'function') {
          window.showProgress(100);
        }

        downloadFile(resultBytes, currentFileName + '_rotated.pdf');

        if (typeof window.UI !== 'undefined' && window.UI.showSuccess) {
            window.UI.showSuccess('PDF rotated successfully!');
        } else if (typeof window.showSuccess === 'function') {
            window.showSuccess('PDF rotated successfully!');
        }
      } catch (error) {
        console.error(error);
        if (typeof window.UI !== 'undefined' && window.UI.showError) {
          window.UI.showError('Failed to rotate PDF. ' + error.message);
        } else if (typeof window.showError === 'function') {
          window.showError('Failed to rotate PDF. ' + error.message);
        }
      }
    },
  });
}

export function destroy() {
  // Cleanup logic here if necessary
}
