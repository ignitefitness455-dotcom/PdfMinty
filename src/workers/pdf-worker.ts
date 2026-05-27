import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

self.onmessage = async (e: MessageEvent) => {
  const { type, ...payload } = e.data;
  
  try {
    if (type === 'merge') {
      const { files } = payload; // Array of Uint8Array
      const mergedPdf = await PDFDocument.create();
      
      for (const fileBytes of files) {
        const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      self.postMessage({ success: true, bytes: mergedBytes }, [mergedBytes.buffer] as any);
    } 
    
    else if (type === 'split') {
      const { fileBytes, targetPageIndices } = payload;
      const srcDoc = await PDFDocument.load(fileBytes);
      const splitPdf = await PDFDocument.create();
      
      const copiedPages = await splitPdf.copyPages(srcDoc, targetPageIndices);
      copiedPages.forEach(p => splitPdf.addPage(p));

      const splitBytes = await splitPdf.save();
      self.postMessage({ success: true, bytes: splitBytes }, [splitBytes.buffer] as any);
    } 
    
    else if (type === 'rotate') {
      const { fileBytes, pageRotations } = payload; // pageRotations is { index: number, rotation: number }[]
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();

      pageRotations.forEach((item: { index: number; rotation: number }) => {
        if (item.index < pages.length) {
          const existingRotation = pages[item.index].getRotation().angle;
          const targetRotation = (existingRotation + item.rotation) % 360;
          pages[item.index].setRotation(degrees(targetRotation));
        }
      });

      const rotatedBytes = await pdfDoc.save();
      self.postMessage({ success: true, bytes: rotatedBytes }, [rotatedBytes.buffer] as any);
    } 
    
    else if (type === 'delete-pages') {
      const { fileBytes, pagesToDelete } = payload; // pagesToDelete is number[]
      const pdfDoc = await PDFDocument.load(fileBytes);
      const currentPages = pdfDoc.getPageCount();

      if (pagesToDelete.length >= currentPages) {
        throw new Error('Absolute protection rule: Cannot delete all pages in a document.');
      }

      // Sort descending to guarantee index safety during sequential removals
      const sortedIndices = [...pagesToDelete].sort((a: number, b: number) => b - a);
      sortedIndices.forEach((idx) => {
        pdfDoc.removePage(idx);
      });

      const slicedBytes = await pdfDoc.save();
      self.postMessage({ success: true, bytes: slicedBytes }, [slicedBytes.buffer] as any);
    } 
    
    else if (type === 'watermark') {
      const { fileBytes, watermarkText, watermarkOpacity, watermarkSize, watermarkRotation } = payload;
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = watermarkText.length * (watermarkSize * 0.6);
        
        const angleRad = (watermarkRotation * Math.PI) / 180;
        const cx = width / 2;
        const cy = height / 2;
        const x = cx - (textWidth / 2) * Math.cos(angleRad) + (watermarkSize / 2) * Math.sin(angleRad);
        const y = cy - (textWidth / 2) * Math.sin(angleRad) - (watermarkSize / 2) * Math.cos(angleRad);

        page.drawText(watermarkText, {
          x: Math.max(20, x),
          y: Math.max(20, y),
          font: helveticaBold,
          size: watermarkSize,
          color: rgb(0.62, 0.68, 0.75),
          opacity: watermarkOpacity,
          rotate: degrees(watermarkRotation),
        });
      });

      const watermarkedBytes = await pdfDoc.save();
      self.postMessage({ success: true, bytes: watermarkedBytes }, [watermarkedBytes.buffer] as any);
    } 
    
    else if (type === 'page-numbers') {
      const { fileBytes, pageNumberFormat, pageNumberPosition } = payload;
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize();
        
        let labelText = `${idx + 1}`;
        if (pageNumberFormat === 'page-of') {
          labelText = `Page ${idx + 1} of ${pages.length}`;
        }

        const size = 10;
        const margin = 25;
        let x = width / 2;
        let y = margin;

        switch (pageNumberPosition) {
          case 'top-center':
            x = width / 2;
            y = height - margin;
            break;
          case 'bottom-right':
            x = width - margin - (labelText.length * 5);
            y = margin;
            break;
          case 'bottom-center':
          default:
            x = width / 2 - (labelText.length * 2.5);
            y = margin;
            break;
        }

        page.drawText(labelText, {
          x,
          y,
          font: helvetica,
          size,
          color: rgb(0.3, 0.4, 0.45),
        });
      });

      const sequencedBytes = await pdfDoc.save();
      self.postMessage({ success: true, bytes: sequencedBytes }, [sequencedBytes.buffer] as any);
    } 
    
    else if (type === 'add-blank') {
      const { fileBytes, blankPageSize, blankPagePos, blankPageAt } = payload;
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pageCount = pdfDoc.getPageCount();

      const width = blankPageSize === 'A4' ? 595.27 : 612;
      const height = blankPageSize === 'A4' ? 841.89 : 792;

      let insertionIndex = pageCount;
      if (blankPagePos === 'start') {
        insertionIndex = 0;
      } else if (blankPagePos === 'custom') {
        const customIdx = parseInt(blankPageAt, 10);
        if (!isNaN(customIdx)) {
          insertionIndex = Math.max(0, Math.min(customIdx - 1, pageCount));
        }
      }

      pdfDoc.insertPage(insertionIndex, [width, height]);
      
      const modifiedBytes = await pdfDoc.save();
      self.postMessage({ success: true, bytes: modifiedBytes }, [modifiedBytes.buffer] as any);
    } 
    
    else if (type === 'img-to-pdf') {
      const { imageFilesData } = payload; // Array of { bytes: Uint8Array, type: string, name: string }
      const pdfDoc = await PDFDocument.create();

      for (const item of imageFilesData) {
        let embeddedImage;
        if (item.type === 'image/png' || item.name.endsWith('.png')) {
          embeddedImage = await pdfDoc.embedPng(item.bytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(item.bytes);
        }

        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }

      const generatedBytes = await pdfDoc.save();
      self.postMessage({ success: true, bytes: generatedBytes }, [generatedBytes.buffer] as any);
    } 
    
    else if (type === 'compress') {
      const { fileBytes, quality } = payload;
      const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      
      if (quality === 'high') {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setCreator('');
        pdfDoc.setProducer('');
      }

      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      self.postMessage({ success: true, bytes: compressedBytes }, [compressedBytes.buffer] as any);
    }
    
    else {
      throw new Error(`Unsupported task type: ${type}`);
    }
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message || `Unknown error occurred during ${type || 'UNKNOWN'} operation.` });
  }
};
