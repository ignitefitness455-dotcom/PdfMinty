const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'public', 'tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
    
    // Change all texts to "Processing..."
    content = content.replace(/btnApply\.textContent\s*=\s*["'](.*?)["']/g, (match, text) => {
        if (["Merging...", "Adding Numbers...", "Deleting...", "Extracting...", "Converting...", "Reordering...", "Rotating...", "Splitting...", "Checking...", "Adding Watermark...", "Rasterizing & Compressing...", "Deep Compressing...", "Optimizing Structure..."].includes(text)) {
            return `btnApply.textContent = "Processing..."`;
        }
        return match;
    });

    // We don't want to replace btnApply.textContent restoring step, because it uses emojis and original names. Wait, NO. If it was `btnApply.textContent = "Processing...";`, the restoring step is at the end, inside finally:
    // `btnApply.textContent = "🔗 Merge PDFs";` which we want to keep. The prompt says: "It returns to the original state after the task finishes or fails" -> it already does this.

    // Let's replace type checks with validateFile(files).
    // Multiple files: 
    // const validFiles = Array.from(files).filter(f => f.type === 'application/pdf');
    // if (validFiles.length === 0) { showError(...); return; }
    // if (typeof validateFileSize === 'function' && !validateFileSize(validFiles)) return;
    
    content = content.replace(/const validFiles = Array\.from\(files\)\.filter\([^)]*\);[\s\S]*?if \(!validateFileSize\([^)]*\)\) return;/g, `
        const validFiles = Array.from(files);
        if (typeof window.validateFile === 'function' && !window.validateFile(validFiles)) return;
    `);

    // Single file: 
    // const file = files[0];
    // if (file.type !== 'application/pdf') { showError(...); return; }
    // if (typeof validateFileSize === 'function' && !validateFileSize([file])) return;
    
    content = content.replace(/if \(file\.type !== 'application\/pdf'\) \{[\s\S]*?return;\s*\}/g, ``);
    content = content.replace(/if \(typeof validateFileSize === 'function' && !validateFileSize\(\[file\]\)\) return;/g, `if (typeof window.validateFile === 'function' && !window.validateFile([file])) return;`);

    // Catch blocks: all try/catches in standard tool flow already do showError, but let's make sure it's using the new format correctly if we need to.
    
    // Some single files use different syntaxes:
    content = content.replace(/const validFiles = Array\.from\(files\)\.filter\(f => f\.type === 'application\/pdf'\);[\s\S]*?if \(typeof validateFileSize === 'function' && !validateFileSize\(validFiles\)\) return;/g, `
        const validFiles = Array.from(files);
        if (typeof window.validateFile === 'function' && !window.validateFile(validFiles)) return;
    `);

    fs.writeFileSync(path.join(toolsDir, file), content, 'utf-8');
});
console.log("Updated files!");
