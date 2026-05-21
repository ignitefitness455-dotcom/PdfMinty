export function renderToolBase({
  title,
  description,
  icon,
  dropText,
  extraWorkspaceHtml,
  actionText,
}) {
  return `
        <div class="tool-container">
            <a id="btn-back" class="back-link" href="#">← Back</a>
            <div class="tool-header">
                <h1>${title}</h1>
                <p>${description}</p>
            </div>
            <div id="drop-zone" class="drop-zone" tabindex="0" role="button" aria-label="File upload zone: ${dropText || 'Drag & drop a PDF here, or click to select'}">
                <input type="file" id="file-input" aria-hidden="true" tabindex="-1" accept=".pdf" style="display: none;" ${title.includes('Merge') ? 'multiple' : ''} />
                <div class="tool-hero-icon" aria-hidden="true">${icon}</div>
                <p style="font-size: 1.25rem; margin: 0; font-weight: 500;">${dropText || 'Drag & drop a PDF here, or click to select'}</p>
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

  // Bug 5 fix: use history API instead of hash mutation for back navigation
  document.getElementById('btn-back')?.addEventListener('click', (e) => {
    e.preventDefault();
    const hasInternalHistory = window.history.length > 1 && document.referrer.startsWith(window.location.origin);
    if (hasInternalHistory) {
      window.history.back();
    } else {
      window.history.pushState(null, '', '/');
      if (typeof window.router === 'function') {
        window.router();
      } else {
        window.location.href = '/';
      }
    }
  });

  removeBtn?.addEventListener('click', () => {
    if (fileInput) fileInput.value = '';
    if (workspace) workspace.classList.add('hidden');
    if (dropZone) dropZone.classList.remove('hidden');
    if (typeof onRemove === 'function') onRemove();
  });

  btnApply?.addEventListener('click', onApply);
}

export const singleFilePreviewHtml = `
    <div class="file-info-card">
        <img id="file-preview-img" class="file-preview-img" loading="lazy" alt="PDF Preview" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5uYW1lcy9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
        <div class="file-details">
            <span id="file-name-display" class="file-name"></span>
            <div class="file-badges">
                <span id="page-count-display" class="page-count-badge"></span>
                <span id="file-size-display" class="file-size-badge"></span>
            </div>
        </div>
        <button id="remove-file-btn" class="remove-btn" title="Remove file">✕</button>
    </div>
`;
