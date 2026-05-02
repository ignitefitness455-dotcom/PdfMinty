const fs = require('fs');

let merge = fs.readFileSync('tools/merge.js', 'utf-8');

merge = merge.replace(/async function handleFiles\(files\) \{/, 'function handleFiles(files) {');
merge = merge.replace(/filesArray = filesArray\.concat\(validFiles\);/,
`// Store to IDB to save memory
        if (window.pdfDB) {
            Promise.all(validFiles.map(async (file) => {
                const id = 'merge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const ab = await file.arrayBuffer();
                await window.pdfDB.saveFile(id, ab);
                return { name: file.name, id, fileObj: file }; // Keep fileObj for thumbnail
            })).then(mapped => {
                filesArray = filesArray.concat(mapped);
                renderFileList();
            });
        } else {
            filesArray = filesArray.concat(validFiles.map(f => ({ name: f.name, fileObj: f })));
            renderFileList();
        }`);

// Update renderFileList to use file.fileObj for thumbnail
merge = merge.replace(/renderPdfThumbnail\(file, img\);/g, 'renderPdfThumbnail(file.fileObj, img);');
merge = merge.replace(/nameBadge\.textContent = file\.name;/g, 'nameBadge.textContent = file.name;');

// Update remove handler to delete from IDB
merge = merge.replace(/filesArray\.splice\(idx, 1\);/g, 
`const removed = filesArray.splice(idx, 1)[0];
                if (window.pdfDB && removed.id) window.pdfDB.deleteFile(removed.id);`);

// Update logic inside btnApply
const targetApply = `                const payload = { files: [] };
                for (let i = 0; i < filesArray.length; i++) {
                    payload.files.push(new Uint8Array(await filesArray[i].arrayBuffer()));
                }
                const transferables = payload.files.map(arr => arr.buffer);`;

const newApply = `                const payload = { files: [] };
                for (let i = 0; i < filesArray.length; i++) {
                    let ab;
                    if (filesArray[i].id && window.pdfDB) {
                        try {
                            ab = await window.pdfDB.getFile(filesArray[i].id);
                        } catch(e) {}
                    }
                    if (!ab) ab = await filesArray[i].fileObj.arrayBuffer();
                    payload.files.push(new Uint8Array(ab));
                }
                const transferables = payload.files.map(arr => arr.buffer);`;
merge = merge.replace(targetApply, newApply);

// Update non-worker path
const targetNonWorker = `                    let fileBytes = await filesArray[i].arrayBuffer();`;
const newNonWorker = `                    let fileBytes;
                    if (filesArray[i].id && window.pdfDB) {
                        try { fileBytes = await window.pdfDB.getFile(filesArray[i].id); } catch(e) {}
                    }
                    if (!fileBytes) fileBytes = await filesArray[i].fileObj.arrayBuffer();`;
merge = merge.replace(targetNonWorker, newNonWorker);

fs.writeFileSync('tools/merge.js', merge, 'utf-8');
console.log('merge.js updated for IDB');
