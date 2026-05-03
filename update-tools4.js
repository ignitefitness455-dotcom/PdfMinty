const fs = require('fs');
const path = require('path');

const compressFile = path.join(__dirname, 'public', 'tools', 'compress.js');
let compContent = fs.readFileSync(compressFile, 'utf-8');
compContent = compContent.replace(/btnApply\.textContent = compLevel === 'deep' \? "Deep Compressing\.\.\." : "Rasterizing & Compressing\.\.\.";/g, 'btnApply.textContent = "Processing...";');
fs.writeFileSync(compressFile, compContent, 'utf-8');

const unlockFile = path.join(__dirname, 'public', 'tools', 'unlock.js');
let unlContent = fs.readFileSync(unlockFile, 'utf-8');
unlContent = unlContent.replace(/btnApply\.textContent = "Unlocking\.\.\.";/g, 'btnApply.textContent = "Processing...";');
fs.writeFileSync(unlockFile, unlContent, 'utf-8');
