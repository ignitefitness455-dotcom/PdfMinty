import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function executeSplit(payload, postMessage) {
  postMessage({ id: payload.id, status: 'progress', progress: 5, type: 'progress', operation: 'split', percent: 5, label: 'Loading PDF...' });
  const srcDoc = await PDFDocument.load(payload.fileBytes, { ignoreEncryption: true });
  postMessage({ id: payload.id, status: 'progress', progress: 10, type: 'progress', operation: 'split', percent: 10, label: 'PDF loaded. Preparing parts...' });

  const results = [];
  const totalRanges = payload.ranges.length;
  let totalExtractedPages = 0;

  for (let c = 0; c < totalRanges; c++) {
    const r = payload.ranges[c];
    const newDoc = await PDFDocument.create();
    const indices = [];
    for (let j = r.start - 1; j < r.end; j++) {
      if (j >= 0 && j < srcDoc.getPageCount()) {
        indices.push(j);
      }
    }

    if (indices.length > 0) {
      const copiedPages = await newDoc.copyPages(srcDoc, indices);
      for (let k = 0; k < copiedPages.length; k++) {
        newDoc.addPage(copiedPages[k]);
        totalExtractedPages++;
        
        let percent = Math.round(10 + (((c + (k / copiedPages.length)) / totalRanges) * 80));
        if (k % 5 === 0) {
          postMessage({
            id: payload.id,
            status: 'progress',
            progress: percent,
            type: 'progress',
            operation: 'split',
            percent: percent,
            label: `Extracting page ${k + 1} of range ${c + 1}`
          });
        }
      }
      const pdfBytes = await newDoc.save({ useObjectStreams: true });
      results.push({ name: `${payload.fileName}_${r.start}-${r.end}.pdf`, bytes: pdfBytes });
    }

    let p = Math.round(10 + ((c + 1) / totalRanges) * 80);
    postMessage({
      id: payload.id,
      status: 'progress',
      progress: p,
      type: 'progress',
      operation: 'split',
      percent: p,
      label: `Completed range ${c + 1} of ${totalRanges}`
    });
  }

  postMessage({ id: payload.id, status: 'progress', progress: 95, type: 'progress', operation: 'split', percent: 95, label: `Finalizing output...` });
  return results;
}
