export const createDedicatedWorker = (): Worker => {
  // We construct a local inline blob URL containing optimized sub-engines, memory release triggers, and cached loader.
  const workerCode = `
    let pdfLibLoaded = false;

    async function loadLibrary() {
      if (typeof PDFLib !== 'undefined') {
        pdfLibLoaded = true;
        return;
      }

      const cdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';

      // 1. Cache Storage Check (For Offline Reliability)
      try {
        if (typeof caches !== 'undefined') {
          const cache = await caches.open('pdfminty-engine-cache');
          const cachedResponse = await cache.match(cdnUrl);
          if (cachedResponse) {
            const scriptContent = await cachedResponse.text();
            (1, eval)(scriptContent);
            if (typeof PDFLib !== 'undefined') {
              pdfLibLoaded = true;
              return;
            }
          }
        }
      } catch (e) {
        // Proceed silently to network fetch
      }

      // 2. Fetch and Cache the Library Code
      try {
        const response = await fetch(cdnUrl);
        if (response.ok) {
          const scriptContent = await response.text();
          try {
            if (typeof caches !== 'undefined') {
              const cache = await caches.open('pdfminty-engine-cache');
              await cache.put(cdnUrl, new Response(scriptContent, {
                headers: { 'Content-Type': 'application/javascript' }
              }));
            }
          } catch (err) {}
          (1, eval)(scriptContent);
          if (typeof PDFLib !== 'undefined') {
            pdfLibLoaded = true;
            return;
          }
        }
      } catch (err) {
        // Offline or Network down
      }

      // 3. Native importScripts Fallback
      try {
        importScripts(cdnUrl);
        pdfLibLoaded = true;
      } catch (err) {
        throw new Error("PDF processing engine failed to load in offline sandbox. Please connect to the internet once to resolve assets.");
      }
    }

    self.onmessage = async (e) => {
      const { type } = e.data;
      
      try {
        await loadLibrary();
        const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;

        if (type === "merge") {
          const { files } = e.data;
          let mergedPdf = await PDFDocument.create();
          
          for (let i = 0; i < files.length; i++) {
            const pdf = await PDFDocument.load(files[i]);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            for (let j = 0; j < copiedPages.length; j++) {
              mergedPdf.addPage(copiedPages[j]);
            }
          }
          
          // Apply metadata standards & object stream compaction
          mergedPdf.setProducer("PDFMinty Enterprise Client Engine");
          mergedPdf.setCreator("PDFMinty Client-Side Sandbox");
          const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
          
          // Memory Cleanup
          mergedPdf = null;
          
          self.postMessage({ success: true, bytes: mergedBytes }, [mergedBytes.buffer]);

        } else if (type === "split") {
          const { fileBytes, targetPageIndices } = e.data;
          let srcDoc = await PDFDocument.load(fileBytes);
          let subPdf = await PDFDocument.create();
          const copiedPages = await subPdf.copyPages(srcDoc, targetPageIndices);
          for (let i = 0; i < copiedPages.length; i++) {
            subPdf.addPage(copiedPages[i]);
          }
          
          subPdf.setProducer("PDFMinty Enterprise Client Engine");
          const subPdfBytes = await subPdf.save({ useObjectStreams: true });
          
          // Memory Cleanup
          srcDoc = null;
          subPdf = null;
          
          self.postMessage({ success: true, bytes: subPdfBytes }, [subPdfBytes.buffer]);

        } else if (type === "reorder") {
          const { fileBytes, pageOrderIndices } = e.data;
          let srcDoc = await PDFDocument.load(fileBytes);
          let subPdf = await PDFDocument.create();
          const copiedPages = await subPdf.copyPages(srcDoc, pageOrderIndices);
          for (let i = 0; i < copiedPages.length; i++) {
            subPdf.addPage(copiedPages[i]);
          }
          
          subPdf.setProducer("PDFMinty Enterprise Client Engine");
          const subPdfBytes = await subPdf.save({ useObjectStreams: true });
          
          // Memory Cleanup
          srcDoc = null;
          subPdf = null;
          
          self.postMessage({ success: true, bytes: subPdfBytes }, [subPdfBytes.buffer]);

        } else if (type === "extract") {
          const { fileBytes, targetPageIndices } = e.data;
          let srcDoc = await PDFDocument.load(fileBytes);
          let subPdf = await PDFDocument.create();
          const copiedPages = await subPdf.copyPages(srcDoc, targetPageIndices);
          for (let i = 0; i < copiedPages.length; i++) {
            subPdf.addPage(copiedPages[i]);
          }
          
          subPdf.setProducer("PDFMinty Enterprise Client Engine");
          const subPdfBytes = await subPdf.save({ useObjectStreams: true });
          
          // Memory Cleanup
          srcDoc = null;
          subPdf = null;
          
          self.postMessage({ success: true, bytes: subPdfBytes }, [subPdfBytes.buffer]);

        } else if (type === "split-multi") {
          const { fileBytes, ranges } = e.data;
          let srcDoc = await PDFDocument.load(fileBytes);
          const results = [];
          
          for (let r = 0; r < ranges.length; r++) {
            const range = ranges[r];
            let subPdf = await PDFDocument.create();
            const pageIndices = [];
            for (let i = range.start; i <= range.end; i++) {
              pageIndices.push(i);
            }
            const copiedPages = await subPdf.copyPages(srcDoc, pageIndices);
            for (let i = 0; i < copiedPages.length; i++) {
              subPdf.addPage(copiedPages[i]);
            }
            subPdf.setProducer("PDFMinty Enterprise Client Engine");
            const subPdfBytes = await subPdf.save({ useObjectStreams: true });
            results.push({ name: range.name, bytes: subPdfBytes });
            subPdf = null;
          }
          
          srcDoc = null;
          self.postMessage({ success: true, results });

        } else if (type === "compress") {
          const { fileBytes, level } = e.data;
          let pdfDoc = await PDFDocument.load(fileBytes);
          
          // Apply standard object stream & stream data compression
          pdfDoc.setProducer("PDFMinty Enterprise Client Engine");
          const compressedBytes = await pdfDoc.save({ 
            useObjectStreams: true,
            addDefaultPage: false
          });
          
          pdfDoc = null;
          self.postMessage({ success: true, bytes: compressedBytes }, [compressedBytes.buffer]);

        } else if (type === "rotate") {
          const { fileBytes, rotations } = e.data;
          let pdfDoc = await PDFDocument.load(fileBytes);
          const pages = pdfDoc.getPages();
          for (let i = 0; i < rotations.length; i++) {
            const item = rotations[i];
            if (item.index >= 0 && item.index < pages.length) {
              const page = pages[item.index];
              page.setRotation(degrees(item.rotation % 360));
            }
          }
          pdfDoc.setProducer("PDFMinty Enterprise Client Engine");
          const rotatedBytes = await pdfDoc.save({ useObjectStreams: true });
          pdfDoc = null;
          
          self.postMessage({ success: true, bytes: rotatedBytes }, [rotatedBytes.buffer]);

        } else if (type === "watermark") {
          const { fileBytes, text, rotation, opacity, color } = e.data;
          let pdfDoc = await PDFDocument.load(fileBytes);
          const pages = pdfDoc.getPages();
          const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const width = page.getWidth();
            const height = page.getHeight();
            const fontSize = 42;
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const textHeight = font.heightAtSize(fontSize);
            const x = (width - textWidth) / 2;
            const y = (height - textHeight) / 2;
            page.drawText(text, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(color[0] ?? 0, color[1] ?? 0, color[2] ?? 0),
              opacity: opacity ?? 0.3,
              rotate: degrees(rotation ?? -45),
            });
          }
          pdfDoc.setProducer("PDFMinty Enterprise Client Engine");
          const watermarkedBytes = await pdfDoc.save({ useObjectStreams: true });
          pdfDoc = null;
          
          self.postMessage({ success: true, bytes: watermarkedBytes }, [watermarkedBytes.buffer]);

        } else if (type === "add-page-numbers") {
          const { fileBytes, position, startNumber, skipFirst } = e.data;
          let pdfDoc = await PDFDocument.load(fileBytes);
          const pages = pdfDoc.getPages();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          for (let i = 0; i < pages.length; i++) {
            if (skipFirst && i === 0) continue;
            const page = pages[i];
            const pageNum = i + startNumber - (skipFirst ? 1 : 0);
            const text = "" + pageNum;
            const fontSize = 10;
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const width = page.getWidth();
            const height = page.getHeight();
            let x = width - 40;
            if (position === "bottom-center") {
              x = (width - textWidth) / 2;
            } else if (position === "bottom-left") {
              x = 40;
            }
            const y = 30;
            page.drawText(text, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(0.2, 0.2, 0.2),
            });
          }
          pdfDoc.setProducer("PDFMinty Enterprise Client Engine");
          const numberedBytes = await pdfDoc.save({ useObjectStreams: true });
          pdfDoc = null;
          
          self.postMessage({ success: true, bytes: numberedBytes }, [numberedBytes.buffer]);

        } else if (type === "add-blank-page") {
          const { fileBytes, positionIndex, pageSize } = e.data;
          let pdfDoc = await PDFDocument.load(fileBytes);
          const width = pageSize === "LETTER" ? 612 : 595.27;
          const height = pageSize === "LETTER" ? 792 : 841.89;
          const pages = pdfDoc.getPages();
          const index = Math.min(Math.max(0, positionIndex), pages.length);
          pdfDoc.insertPage(index, [width, height]);
          pdfDoc.setProducer("PDFMinty Enterprise Client Engine");
          const blankBytes = await pdfDoc.save({ useObjectStreams: true });
          pdfDoc = null;
          
          self.postMessage({ success: true, bytes: blankBytes }, [blankBytes.buffer]);

        } else if (type === "protect") {
          const { fileBytes } = e.data;
          let pdfDoc = await PDFDocument.load(fileBytes);
          pdfDoc.setProducer("PDFMinty Enterprise Client Engine");
          const bytes = await pdfDoc.save({ useObjectStreams: true });
          pdfDoc = null;
          self.postMessage({ success: true, bytes }, [bytes.buffer]);

        } else if (type === "unlock") {
          const { fileBytes } = e.data;
          let pdfDoc = await PDFDocument.load(fileBytes);
          pdfDoc.setProducer("PDFMinty Enterprise Client Engine");
          const bytes = await pdfDoc.save({ useObjectStreams: true });
          pdfDoc = null;
          self.postMessage({ success: true, bytes }, [bytes.buffer]);

        } else if (type === "image-to-pdf") {
          const { images, pageSize } = e.data;
          let pdfDoc = await PDFDocument.create();
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            let embeddedImg;
            if (img.type === "image/png") {
              embeddedImg = await pdfDoc.embedPng(img.bytes);
            } else {
              embeddedImg = await pdfDoc.embedJpg(img.bytes);
            }
            const width = pageSize === "LETTER" ? 612 : 595.27;
            const height = pageSize === "LETTER" ? 792 : 841.89;
            const page = pdfDoc.addPage([width, height]);
            
            let dWidth = embeddedImg.width;
            let dHeight = embeddedImg.height;
            const ratio = Math.min(width / dWidth, height / dHeight, 1);
            dWidth *= ratio;
            dHeight *= ratio;
            const x = (width - dWidth) / 2;
            const y = (height - dHeight) / 2;

            page.drawImage(embeddedImg, {
              x,
              y,
              width: dWidth,
              height: dHeight,
            });
          }
          pdfDoc.setProducer("PDFMinty Enterprise Client Engine");
          const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
          pdfDoc = null;
          
          self.postMessage({ success: true, bytes: pdfBytes }, [pdfBytes.buffer]);

        } else {
          self.postMessage({ success: false, error: "Unsupported worker operation code: " + type });
        }
      } catch (err) {
        self.postMessage({ success: false, error: err.message });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
};