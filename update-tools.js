const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');

    // Make sure we only touch single-file ones (like compress, split, rotate, etc.)
    // And don't touch merge.js or image-to-pdf.js
    if (file === 'merge.js' || file === 'image-to-pdf.js') return;

    let modified = false;

    if (content.includes('class="file-info"')) {
        // Replace old file-info HTML
        content = content.replace(
            /<div class="file-info">[\s\S]*?<span id="file-name-display"[\s\S]*?<\/div>/,
`<div class="file-info" style="display: flex; gap: 1rem; align-items: center; text-align: left;">
                    <img id="file-preview-img" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJIMmE2IDYgMCAwIDAtNiA2djEyYTYgNiAwIDAgMCA2IDRoMTJhNiA2IDAgMCAwIDYtNlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=" />
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden;">
                        <span id="file-name-display" class="file-name" style="font-weight: 700; margin: 0;"></span>
                        <span id="file-size-display" class="file-size-badge" style="width: fit-content;"></span>
                    </div>
                    <button id="remove-file-btn" class="remove-btn" title="Remove file" style="align-self: center; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; transition: all 0.2s;">✕</button>
                </div>`
        );

        // Inject thumbnail generation into handleFiles
        if (!content.includes("renderPdfThumbnail")) {
            content = content.replace(
                /fileNameDisplay\.textContent\s*=\s*file\.name;[\s\S]*?dropZone\.classList\.add\('hidden'\);/g,
                `fileNameDisplay.textContent = file.name;
            if (typeof formatBytes === 'function' && fileSizeDisplay) fileSizeDisplay.textContent = formatBytes(file.size);
            
            if (typeof renderPdfThumbnail === 'function') {
                const imgEl = document.getElementById('file-preview-img');
                if (imgEl) renderPdfThumbnail(file, imgEl);
            }
            
            dropZone.classList.add('hidden');`
            );
        }
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(path.join(toolsDir, file), content, 'utf-8');
        console.log('Updated ' + file);
    }
});
