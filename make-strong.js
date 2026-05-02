const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
    let modified = false;

    // 1. Add { useObjectStreams: true } everywhere
    // match: save() or save( {something} )
    // Just a simple regex that replaces `.save()` with `.save({ useObjectStreams: true })`
    if (content.includes('.save()')) {
        content = content.replace(/\.save\(\)/g, '.save({ useObjectStreams: true })');
        modified = true;
    }

    // 2. Memory optimization in Merge PDF (set intermediate arrays to null)
    if (file === 'merge.js' && !content.includes('fileBytes = null')) {
        content = content.replace(
            /copiedPages\.forEach\(\(page\) => mergedPdf\.addPage\(page\)\);/g,
            `copiedPages.forEach((page) => mergedPdf.addPage(page));
                
                // GC Hint for Heavy Processing
                fileBytes = null;
                pdf = null;`
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(path.join(toolsDir, file), content, 'utf-8');
        console.log('Optimized ' + file);
    }
});
