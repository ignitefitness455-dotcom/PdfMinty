export function renderToolBase({ title, description, icon, dropText, extraWorkspaceHtml, actionText }) {
    return `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>${title}</h1>
                <p>${description}</p>
            </div>
            <div id="drop-zone" tabindex="0" role="button" aria-label="File upload zone: ${dropText || 'Drag & drop a PDF here, or click to select'}" style="border: 2px dashed var(--primary); padding: 4rem 2rem; text-align: center; border-radius: 0.5rem; cursor: pointer; background: var(--card); transition: border-color 0.2s;">
                <input type="file" id="file-input" aria-hidden="true" tabindex="-1" accept=".pdf" style="display: none;" ${title.includes('Merge') ? 'multiple' : ''} />
                <div style="font-size: 3rem; margin-bottom: 1rem;" aria-hidden="true">${icon}</div>
                <p style="font-size: 1.25rem; margin: 0;">${dropText || 'Drag & drop a PDF here, or click to select'}</p>
            </div>
            <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 1rem;">🔒 No upload. No servers. 100% private.</p>
            <div id="workspace" class="workspace hidden">
                ${extraWorkspaceHtml}
                <div class="actions">
                    <button id="btn-apply" class="btn-action">${actionText}</button>
                </div>
            </div>
        </div>
    `;
}

export function setupToolLogic({ onFiles, onRemove, onApply }) {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const workspace = document.getElementById('workspace');
    const removeBtn = document.getElementById('remove-file-btn');
    const btnApply = document.getElementById('btn-apply');
    
    if (typeof window.initDropZone === 'function') {
        window.initDropZone('drop-zone', 'file-input', onFiles, '.pdf');
    } else {
        dropZone?.addEventListener('click', () => fileInput.click());
        dropZone?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput?.click();
            }
        });
        fileInput?.addEventListener('change', (e) => onFiles(e.target.files));
    }
    
    // Some tools might custom handle back buttons:
    document.getElementById('btn-back')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = ''; // handled globally but safe fallback
    });
    
    removeBtn?.addEventListener('click', () => {
        if(fileInput) fileInput.value = '';
        if(workspace) workspace.classList.add('hidden');
        if(dropZone) dropZone.classList.remove('hidden');
        if (typeof onRemove === 'function') onRemove();
    });
    
    btnApply?.addEventListener('click', onApply);
}

export const singleFilePreviewHtml = `
    <div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left; background: var(--bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05);">
        <img id="file-preview-img" loading="lazy" alt="PDF Preview" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
            <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></span>
            <div style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem;">
                <span id="page-count-display" class="page-count-badge" style="display: none; background: rgba(6, 182, 212, 0.1); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; white-space: nowrap;"></span>
                <span id="file-size-display" class="file-size-badge" style="width: fit-content; font-size: 0.875rem; color: var(--muted);"></span>
            </div>
        </div>
        <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; transition: all 0.2s;">✕</button>
    </div>
`;
