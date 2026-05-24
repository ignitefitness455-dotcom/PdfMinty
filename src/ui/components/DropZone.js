/**
 * Reusable drag-and-drop file zone
 */
export function createDropZone(container, { onDrop, accept = '*', multiple = true, maxFiles = 10 } = {}) {
  const zone = document.createElement('div');
  zone.id = 'drop-zone';
  zone.className = 'drop-zone-enhanced';
  zone.innerHTML = `
    <div class="drop-content">
      <div class="drop-icon-large">📁</div>
      <p class="drop-text-large">Drag & drop your files here</p>
      <p>or <span class="drop-browse">browse files</span></p>
      <input type="file" id="file-input" ${multiple ? 'multiple' : ''} accept="${accept}" hidden>
    </div>
    <div class="drop-overlay">
      <div class="drop-icon-large">📥</div>
      <p class="drop-text-large">Drop files here</p>
    </div>
  `;

  container.appendChild(zone);

  const input = zone.querySelector('#file-input');
  const browseBtn = zone.querySelector('.drop-browse');

  // Click to browse
  browseBtn.addEventListener('click', () => input.click());
  zone.addEventListener('click', (e) => {
    if (e.target === zone || e.target.closest('.drop-content')) {
      input.click();
    }
  });

  // File input change
  input.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFiles(Array.from(e.target.files));
    }
  });

  // Drag events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    zone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    zone.addEventListener(eventName, () => zone.classList.add('drag-active'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    zone.addEventListener(eventName, (e) => {
      if (e.target === zone || !zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-active');
      }
    }, false);
  });

  zone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  });

  function handleFiles(files) {
    if (!multiple && files.length > 1) {
      files = [files[0]];
    }
    if (files.length > maxFiles) {
      files = files.slice(0, maxFiles);
    }
    if (onDrop) onDrop(files);
  }

  return {
    element: zone,
    reset: () => { input.value = ''; },
    getFiles: () => input.files,
  };
}
