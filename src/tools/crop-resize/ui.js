/**
 * src/tools/crop-resize/ui.js
 */
import { createDropZone } from '../../ui/components/DropZone.js';
import { renderPdfThumbnail, formatBytes } from '../../utils/fileUtils.js';

export function createUI(container, { locale = 'en', onProcess, onCancel }) {
  let activeMode = 'crop';

  container.innerHTML = `
    <div class="tool-container">
      <a class="back-link" href="/">← Back</a>
      <div class="tool-header">
        <h1>Crop & Resize PDF</h1>
        <p>Modify margins or rescale page dimensions with standard sheet presets</p>
      </div>

      <div id="dropzone-container"></div>

      <div id="workspace" class="workspace hidden">
        <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05);">
          <img id="file-preview-img" alt="PDF Preview" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
            <span id="file-name-display" style="font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
            <span id="file-size-display" style="font-size: 0.875rem; color: var(--muted);"></span>
          </div>
          <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer;">✕</button>
        </div>

        <div class="tabs-nav" style="display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 1.5rem;">
          <button class="tab-btn active" data-target="crop-tab" style="background: none; border: none; color: var(--text); padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid var(--primary);">Crop</button>
          <button class="tab-btn" data-target="resize-tab" style="background: none; border: none; color: var(--muted); padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent;">Resize</button>
        </div>

        <!-- CROP TAB -->
        <div id="crop-tab" class="tab-pane" style="display: block;">
          <div class="input-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Top Margin (mm)</label>
              <input type="number" id="crop-top" class="text-input" value="0" min="0" step="1" style="width: 100%;">
            </div>
            <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Right Margin (mm)</label>
              <input type="number" id="crop-right" class="text-input" value="0" min="0" step="1" style="width: 100%;">
            </div>
            <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Bottom Margin (mm)</label>
              <input type="number" id="crop-bottom" class="text-input" value="0" min="0" step="1" style="width: 100%;">
            </div>
            <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Left Margin (mm)</label>
              <input type="number" id="crop-left" class="text-input" value="0" min="0" step="1" style="width: 100%;">
            </div>
          </div>

          <div class="radio-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">Apply to</div>
            <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="crop-pages" value="all" checked style="accent-color: var(--primary);"> All pages</label>
            <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="crop-pages" value="first" style="accent-color: var(--primary);"> Current page only (Page 1)</label>
          </div>
        </div>

        <!-- RESIZE TAB -->
        <div id="resize-tab" class="tab-pane" style="display: none;">
          <div class="presets" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
            <button type="button" class="preset-btn btn-secondary" data-w="210" data-h="297" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">A4</button>
            <button type="button" class="preset-btn btn-secondary" data-w="297" data-h="420" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">A3</button>
            <button type="button" class="preset-btn btn-secondary" data-w="215.9" data-h="279.4" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Letter</button>
            <button type="button" class="preset-btn btn-secondary" data-w="215.9" data-h="355.6" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Legal</button>
          </div>

          <div class="input-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Width (mm)</label>
              <input type="number" id="resize-w" class="text-input" value="210" min="10" step="0.1" style="width: 100%;">
            </div>
            <div class="input-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label class="input-label" style="font-weight: 500; font-size: 0.9rem; color: var(--muted);">Height (mm)</label>
              <input type="number" id="resize-h" class="text-input" value="297" min="10" step="0.1" style="width: 100%;">
            </div>
          </div>

          <div class="radio-group" style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">Content Scaling</div>
            <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="resize-scale" value="fit" checked style="accent-color: var(--primary);"> Scale to fit (Maintain aspect ratio)</label>
            <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="resize-scale" value="stretch" style="accent-color: var(--primary);"> Stretch to fill</label>
            <label class="radio-item" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text);"><input type="radio" name="resize-scale" value="keep" style="accent-color: var(--primary);"> Keep original size (Center)</label>
          </div>
        </div>

        <div class="actions" style="display: flex; justify-content: center; margin-top: 2rem;">
          <button id="btn-apply" class="btn-action">✂️ Crop PDF</button>
        </div>
      </div>
    </div>
  `;

  let uploadedFile = null;
  let fileBytes = null;
  const workspace = container.querySelector('#workspace');
  const dropZoneContainer = container.querySelector('#dropzone-container');
  const btnApply = container.querySelector('#btn-apply');

  // Set up Tabs switching
  container.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('active');
        b.style.color = 'var(--muted)';
        b.style.borderBottomColor = 'transparent';
      });
      container.querySelectorAll('.tab-pane').forEach((p) => (p.style.display = 'none'));

      btn.classList.add('active');
      btn.style.color = 'var(--text)';
      btn.style.borderBottomColor = 'var(--primary)';
      container.querySelector('#' + btn.dataset.target).style.display = 'block';

      activeMode = btn.dataset.target === 'crop-tab' ? 'crop' : 'resize';
      btnApply.innerHTML = activeMode === 'crop' ? '✂️ Crop PDF' : '📐 Resize PDF';
    });
  });

  // Set up Presets
  container.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelector('#resize-w').value = btn.dataset.w;
      container.querySelector('#resize-h').value = btn.dataset.h;
    });
  });

  const dropZone = createDropZone(dropZoneContainer, {
    accept: '.pdf',
    multiple: false,
    onDrop: handleNewFile
  });

  async function handleNewFile(files) {
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      const arrayBuffer = await file.arrayBuffer();
      fileBytes = new Uint8Array(arrayBuffer);
      uploadedFile = file;

      container.querySelector('#file-name-display').textContent = file.name;
      container.querySelector('#file-size-display').textContent = formatBytes(file.size);

      const previewImg = container.querySelector('#file-preview-img');
      renderPdfThumbnail(file, previewImg);

      dropZone.element.classList.add('hidden');
      workspace.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      alert('Failed to load file');
    }
  }

  container.querySelector('#remove-file-btn').addEventListener('click', () => {
    uploadedFile = null;
    fileBytes = null;
    workspace.classList.add('hidden');
    dropZone.element.classList.remove('hidden');
    dropZone.reset();
  });

  btnApply.addEventListener('click', () => {
    if (activeMode === 'crop') {
      const top = parseFloat(container.querySelector('#crop-top').value) || 0;
      const right = parseFloat(container.querySelector('#crop-right').value) || 0;
      const bottom = parseFloat(container.querySelector('#crop-bottom').value) || 0;
      const left = parseFloat(container.querySelector('#crop-left').value) || 0;
      const applyTo = container.querySelector('input[name="crop-pages"]:checked').value;

      onProcess(fileBytes, {
        mode: 'crop',
        top,
        right,
        bottom,
        left,
        applyTo,
        fileName: uploadedFile.name.replace(/\.[^/.]+$/, '')
      });
    } else {
      const targetW_mm = parseFloat(container.querySelector('#resize-w').value);
      const targetH_mm = parseFloat(container.querySelector('#resize-h').value);
      const scaleMode = container.querySelector('input[name="resize-scale"]:checked').value;

      if (!targetW_mm || !targetH_mm || targetW_mm <= 0 || targetH_mm <= 0) {
        alert('Please enter valid width and height numbers.');
        return;
      }

      onProcess(fileBytes, {
        mode: 'resize',
        targetW_mm,
        targetH_mm,
        scaleMode,
        fileName: uploadedFile.name.replace(/\.[^/.]+$/, '')
      });
    }
  });
}
