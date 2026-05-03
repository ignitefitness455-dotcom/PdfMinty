const fs = require('fs');
const path = require('path');

/**
 * Optimizes PDF processing tool scripts in a given directory by adding 
 * compression flags, breaking up large synchronous loops, and adding 
 * garbage collection hints.
 * 
 * @param {string} toolsDir - The absolute path to the directory containing tool scripts.
 */
function optimizeTools(toolsDir) {
    if (!fs.existsSync(toolsDir)) {
        console.warn(`[make-strong-final] Directory not found: ${toolsDir}`);
        return;
    }

    const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'));

    files.forEach(file => {
        let content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
        let modified = false;

        // 1. Add { useObjectStreams: true } everywhere to reduce output file size
        // Replace `.save()` with `.save({ useObjectStreams: true })`
        if (content.match(/\.save\(\)/g)) {
            content = content.replace(/\.save\(\)/g, '.save({ useObjectStreams: true })');
            modified = true;
        }

        // 2. Memory optimization in Merge PDF (set intermediate arrays to null)
        if (file === 'merge.js' && !content.includes('fileBytes = null')) {
            content = content.replace(
                /copiedPages\.forEach\((.*?)\s*=>\s*(.*?)\.addPage\((.*?)\)\);/g,
                `for (let copyIdx = 0; copyIdx < copiedPages.length; copyIdx++) {
                    $2.addPage(copiedPages[copyIdx]);
                    if (copyIdx % 50 === 0) await new Promise(r => setTimeout(r, 0));
                }
                
                // GC Hint for Heavy Processing
                fileBytes = null;
                pdf = null;`
            );
            modified = true;
        } else {
            // Replace `copiedPages.forEach(p => newDoc.addPage(p))` with async loop globally to prevent UI freeze
            if (content.match(/copiedPages\.forEach\((.*?)\s*=>\s*(.*?)\.addPage\((.*?)\)\);/)) {
                content = content.replace(
                    /copiedPages\.forEach\((.*?)\s*=>\s*(.*?)\.addPage\((.*?)\)\);/g,
                    `for (let copyIdx = 0; copyIdx < copiedPages.length; copyIdx++) {
                    $2.addPage(copiedPages[copyIdx]);
                    if (copyIdx % 50 === 0) await new Promise(r => setTimeout(r, 0));
                }`
                );
                modified = true;
            }
        }

        // 3. General garbage collection hint after file download
        if (content.includes('downloadFile(')) {
            // Only add if not already added to avoid duplication
            if (!content.includes('originalPdfBytes = null; // GC Hint')) {
                content = content.replace(
                    /(downloadFile\(.*?\);)/g,
                    `$1\n                originalPdfBytes = null; // GC Hint`
                );
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(path.join(toolsDir, file), content, 'utf-8');
            console.log('Optimized File: ' + file);
        }
    });
}

module.exports = {
    optimizeTools
};
