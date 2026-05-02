const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
    let modified = false;

    // replace copiedPages.forEach(p => newDoc.addPage(p)) or similar with loop
    if (content.match(/copiedPages\.forEach\((.*?) => (.*?)\.addPage\((.*?)\)\);/)) {
        content = content.replace(
            /copiedPages\.forEach\((.*?) => (.*?)\.addPage\((.*?)\)\);/g,
            `for (let copyIdx = 0; copyIdx < copiedPages.length; copyIdx++) {
                $2.addPage(copiedPages[copyIdx]);
                if (copyIdx % 50 === 0) await new Promise(r => setTimeout(r, 0));
            }`
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(path.join(toolsDir, file), content, 'utf-8');
        console.log('Optimized Loops ' + file);
    }
});
