const fs = require('fs');
const path = require('path');
const dir = './tools';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'shared.js');
files.forEach((f) => {
  const fullPath = path.join(dir, f);
  let content = fs.readFileSync(fullPath, 'utf8');
  const toolId = f.replace('.js', '').replace(/-/g, '_');
  content = content.replace(/icon:\s*['"].*?['"]/, `icon: window.PdfMinty.ICONS.${toolId} || '📄'`);
  fs.writeFileSync(fullPath, content);
});
console.log('Successfully updated all tool icons to use window.PdfMinty.ICONS!');
