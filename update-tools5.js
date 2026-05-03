const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public', 'tools', 'image-to-pdf.js');
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/typeof validateFileSize === 'function'/g, "typeof window.validateSizeOnly === 'function'");
content = content.replace(/!validateFileSize\(validFiles\)/g, "!window.validateSizeOnly(validFiles)");
fs.writeFileSync(file, content, 'utf-8');
