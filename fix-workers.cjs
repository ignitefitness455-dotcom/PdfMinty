const fs = require('fs');

const files = fs.readdirSync('workers');
files.forEach(file => {
  if (file.endsWith('.js')) {
    const data = fs.readFileSync('workers/' + file, 'utf8');
    const startIdx = data.indexOf('export async function execute');
    if (startIdx !== -1) {
       const newContent = "import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';\n\n" + data.substring(startIdx);
       fs.writeFileSync('workers/' + file, newContent);
       console.log('Fixed', file);
    }
  }
});
