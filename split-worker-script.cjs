const fs = require('fs');

const data = fs.readFileSync('pdf-worker.js', 'utf8');

const regex = /\/\*\*(.*?)\*\/\s*async function execute([A-Za-z]+)\(payload\) \{(.*?)\n\}/gs;

let match;
while ((match = regex.exec(data)) !== null) {
  const comment = match[1];
  const name = match[2];
  const body = match[3];

  let taskName = name.replace(/([A-Z])/g, '-$1').toLowerCase();
  if (taskName.startsWith('-')) taskName = taskName.slice(1);

  let imports = "import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';\n\n";

  let functionCode = `/**${comment}*/\nexport async function execute${name}(payload, postMessage) {`;
  let modifiedBody = body.replace(/self\.postMessage\(/g, 'postMessage(');
  functionCode += modifiedBody + '\n}\n';

  fs.writeFileSync('workers/' + taskName + '.js', imports + functionCode);
  console.log('Created workers/' + taskName + '.js');
}
