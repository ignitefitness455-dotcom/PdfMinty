import { PDFDocument } from 'pdf-lib';

export async function executeCompress(payload, postMessage) {
  const { fileBytes, id } = payload;
  postMessage({ id, status: 'progress', progress: 10, type: 'progress', operation: 'compress', percent: 10, label: 'Loading PDF...' });

  try {
      const pdfDoc = await PDFDocument.load(fileBytes, {
        ignoreEncryption: true
      });

      postMessage({ id, status: 'progress', progress: 50, type: 'progress', operation: 'compress', percent: 50, label: 'Optimizing document...' });

      // Basic optimization
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setProducer('PDFMinty');
      pdfDoc.setCreator('PDFMinty');

      postMessage({ id, status: 'progress', progress: 85, type: 'progress', operation: 'compress', percent: 85, label: 'Rebuilding object streams...' });
      
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
      });

      postMessage({ id, status: 'progress', progress: 100, type: 'progress', operation: 'compress', percent: 100, label: 'Compression complete' });
      return compressedBytes;
  } catch (error) {
      console.error(error);
      const e = new Error("Failed to compress PDF: " + error.message);
      e.cause = error;
      throw e;
  }
}

