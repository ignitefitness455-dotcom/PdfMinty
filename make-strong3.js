const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
    let modified = false;

    if (content.includes('downloadFile(')) {
        content = content.replace(
            /(downloadFile\(.*?\);)/g,
            `$1\n                originalPdfBytes = null; // GC Hint`
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(path.join(toolsDir, file), content, 'utf-8');
        console.log('GC Optimized ' + file);
    }
});
