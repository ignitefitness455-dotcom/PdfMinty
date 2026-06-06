import * as ops from '../core/pdf-operations';

self.onmessage = async (e: MessageEvent) => {
  // Gracefully handle both flat { type, ...rest } and nested { type, payload, id } message formats
  const { type, payload: nestedPayload, id, ...flatPayload } = e.data;
  const payload = nestedPayload !== undefined ? nestedPayload : flatPayload;

  try {
    let bytes: Uint8Array;

    switch (type) {
      case 'merge':
        bytes = await ops.mergePDFs(payload);
        break;
      case 'split':
        bytes = await ops.splitPDF(payload);
        break;
      case 'split-multi': {
        const results = await ops.splitPDFMulti(payload);
        const buffers = results.map(r => r.bytes.buffer);
        self.postMessage({ id, success: true, results }, buffers as any);
        return;
      }
      case 'rotate':
        bytes = await ops.rotatePDF(payload);
        break;
      case 'delete-pages':
        bytes = await ops.deletePagesPDF(payload);
        break;
      case 'watermark':
        bytes = await ops.watermarkPDF(payload);
        break;
      case 'page-numbers':
        bytes = await ops.addPageNumbersPDF(payload);
        break;
      case 'add-blank':
        bytes = await ops.addBlankPagePDF(payload);
        break;
      case 'img-to-pdf':
        bytes = await ops.imagesToPDF(payload);
        break;
      case 'compress':
        bytes = await ops.compressPDF(payload);
        break;
      case 'protect':
        bytes = await ops.protectPDF(payload);
        break;
      case 'unlock':
        bytes = await ops.unlockPDF(payload);
        break;
      case 'pdf-to-image': {
        const results = await ops.pdfToImage(payload);
        const buffers = results.map(r => r.bytes.buffer);
        self.postMessage({ id, success: true, results }, buffers as any);
        return;
      }
      default:
        throw new Error(`Unsupported task type: ${type}`);
    }

    self.postMessage({ id, success: true, bytes }, [bytes.buffer] as any);
  } catch (error: any) {
    self.postMessage({ id, success: false, error: error.message || 'Unknown error' });
  }
};
