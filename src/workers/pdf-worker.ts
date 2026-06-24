// Web Worker bridge for PDF client processing
import * as ops from '../core/pdf-operations';

self.onmessage = async (e: MessageEvent) => {
  const { id, operation, payload } = e.data;
  try {
    let result: any;
    let transferables: Transferable[] = [];

    switch (operation) {
      case 'mergePDFs':
        result = await ops.mergePDFs(payload.filesBytes);
        transferables = [result.buffer];
        break;
      case 'splitPDF':
        result = await ops.splitPDF(payload.bytes, payload.ranges);
        transferables = result.map((b: Uint8Array) => b.buffer);
        break;
      case 'extractPages':
        result = await ops.extractPages(payload.bytes, payload.pageNumbers);
        transferables = [result.buffer];
        break;
      case 'rotatePDF':
        result = await ops.rotatePDF(payload.bytes, payload.degreesValue, payload.pageIndices);
        transferables = [result.buffer];
        break;
      case 'deletePagesPDF':
        result = await ops.deletePagesPDF(payload.bytes, payload.pageIndices);
        transferables = [result.buffer];
        break;
      case 'reorderPDF':
        result = await ops.reorderPDF(payload.bytes, payload.newOrder);
        transferables = [result.buffer];
        break;
      case 'watermarkPDF':
        result = await ops.watermarkPDF(payload.bytes, payload.text, payload.options);
        transferables = [result.buffer];
        break;
      case 'addPageNumbersPDF':
        result = await ops.addPageNumbersPDF(payload.bytes, payload.options);
        transferables = [result.buffer];
        break;
      case 'addBlankPagePDF':
        result = await ops.addBlankPagePDF(payload.bytes, payload.position, payload.pageSizeKey);
        transferables = [result.buffer];
        break;
      case 'imagesToPDF':
        result = await ops.imagesToPDF(payload.imageBlobs, payload.options);
        transferables = [result.buffer];
        break;
      case 'compressPDF':
        result = await ops.compressPDF(payload.bytes, payload.level);
        transferables = [result.buffer];
        break;
      case 'protectPDF':
        result = await ops.protectPDF(payload);
        transferables = [result.buffer];
        break;
      case 'unlockPDF':
        result = await ops.unlockPDF(payload);
        transferables = [result.buffer];
        break;
      case 'pdfToImage':
        result = await ops.pdfToImage(payload.bytes, payload.originalName, payload.scale, payload.maxPages, payload.format);
        transferables = result.map((r: any) => r.imageBytes.buffer);
        break;
      case 'getPageCount':
        result = await ops.getPageCount(payload.bytes);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    (self as any).postMessage({ id, success: true, result }, transferables);
  } catch (err: any) {
    (self as any).postMessage({
      id,
      success: false,
      error: err.message || 'Worker processing failed',
    });
  }
};
