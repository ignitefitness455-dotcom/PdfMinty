import fs from 'fs';
import path from 'path';

const toolsDir = path.join(process.cwd(), 'tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js') && f !== 'shared.js');

files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace `export default function renderTool()` with `export function init()`
    content = content.replace(/export default function (renderTool\w*)\(\)/g, "export function init()");
    content = content.replace(/export default function\(\)/g, "export function init()");

    if (!content.includes('export function destroy()')) {
        content += `\n\nexport function destroy() {\n  // Cleanup logic here if necessary\n}\n`;
    }

    fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Tools updated successfully.');
