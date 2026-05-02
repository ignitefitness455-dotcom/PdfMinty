const fs = require('fs');
let code = fs.readFileSync('tools/split.js', 'utf-8');

code = code.replace(/originalPdfBytes\s*=\s*await file\.arrayBuffer\(\);/,
`const ab = await file.arrayBuffer();
            if (window.pdfDB) {
                await window.pdfDB.saveFile('split_target', ab);
                originalPdfBytes = 'split_target';
            } else {
                originalPdfBytes = ab;
            }`);

code = code.replace(/const srcDoc = await PDFLib\.PDFDocument\.load\(originalPdfBytes, \{ ignoreEncryption: true \}\);/g, 
`let actualBytes = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
            const tempDoc = await PDFLib.PDFDocument.load(actualBytes, { ignoreEncryption: true });
            actualBytes = null;`);

code = code.replace(/const tempDoc = await PDFLib\.PDFDocument\.load\(originalPdfBytes, \{ ignoreEncryption: true \}\);/,
`let actualBytes = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
            const tempDoc = await PDFLib.PDFDocument.load(actualBytes, { ignoreEncryption: true });
            actualBytes = null;`);

code = code.replace(/const payload = \{\n\s*fileBytes: new Uint8Array\(originalPdfBytes\),/,
`let actualBytes = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                const payload = {
                    fileBytes: new Uint8Array(actualBytes),`);

code = code.replace(/const srcDoc = await PDFLib\.PDFDocument\.load\(originalPdfBytes\);/g,
`let syncActualBytes = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                const srcDoc = await PDFLib.PDFDocument.load(syncActualBytes);
                syncActualBytes = null;`);

fs.writeFileSync('tools/split.js', code, 'utf-8');
console.log('updated split.js');

let compress = fs.readFileSync('tools/compress.js', 'utf-8');

compress = compress.replace(/originalPdfBytes\s*=\s*await file\.arrayBuffer\(\);/,
`const ab = await file.arrayBuffer();
            if (window.pdfDB) {
                await window.pdfDB.saveFile('compress_target', ab);
                originalPdfBytes = 'compress_target';
            } else {
                originalPdfBytes = ab;
            }`);

compress = compress.replace(/modifiedPdfBytes = await compressStrong\(originalPdfBytes\)/,
`let actualBytes = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                modifiedPdfBytes = await compressStrong(actualBytes)`);

compress = compress.replace(/modifiedPdfBytes = await compressStrong\(originalPdfBytes, scale, quality\);/,
`let actualBytes = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                modifiedPdfBytes = await compressStrong(actualBytes, scale, quality);
                actualBytes = null;`);

compress = compress.replace(/const payload = \{ fileBytes: new Uint8Array\(originalPdfBytes\)/,
`let actualBytesWorker = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                    const payload = { fileBytes: new Uint8Array(actualBytesWorker)`);

compress = compress.replace(/const pdfDoc = await PDFLib\.PDFDocument\.load\(originalPdfBytes, \{ ignoreEncryption: true \}\);/g,
`let actualBytesSync = originalPdfBytes instanceof ArrayBuffer ? originalPdfBytes : await window.pdfDB.getFile(originalPdfBytes);
                    const pdfDoc = await PDFLib.PDFDocument.load(actualBytesSync, { ignoreEncryption: true });
                    actualBytesSync = null;`);

fs.writeFileSync('tools/compress.js', compress, 'utf-8');
console.log('updated compress.js');
