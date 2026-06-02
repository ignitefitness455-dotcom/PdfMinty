import * as ops from './pdf-operations';

import PDFWorker from '../workers/pdf-worker.ts?worker&inline';

class VirtualWorker {
  onmessage: ((this: any, ev: MessageEvent) => any) | null = null;
  onerror: ((this: any, ev: ErrorEvent) => any) | null = null;
  cancelled: boolean = false;

  async postMessage(message: any, _transfer?: Transferable[]) {
    // Gracefully handle both flat and nested message structures
    const { type, payload: nestedPayload, id, ...flatPayload } = message;
    const payload = nestedPayload !== undefined ? nestedPayload : flatPayload;

    setTimeout(async () => {
      try {
        let bytes: Uint8Array;
        switch (type) {
          case 'merge': bytes = await ops.mergePDFs(payload); break;
          case 'split': bytes = await ops.splitPDF(payload); break;
          case 'split-multi': {
            const results = await ops.splitPDFMulti(payload);
            if (this.cancelled) return;
            if (this.onmessage) this.onmessage({ data: { id, success: true, results } } as MessageEvent);
            return;
          }
          case 'rotate': bytes = await ops.rotatePDF(payload); break;
          case 'delete-pages': bytes = await ops.deletePagesPDF(payload); break;
          case 'watermark': bytes = await ops.watermarkPDF(payload); break;
          case 'page-numbers': bytes = await ops.addPageNumbersPDF(payload); break;
          case 'add-blank': bytes = await ops.addBlankPagePDF(payload); break;
          case 'img-to-pdf': bytes = await ops.imagesToPDF(payload); break;
          case 'compress': bytes = await ops.compressPDF(payload); break;
          case 'protect': bytes = await ops.protectPDF(payload); break;
          case 'unlock': bytes = await ops.unlockPDF(payload); break;
          default: throw new Error(`Unsupported task type: ${type}`);
        }
        if (this.cancelled) return;
        if (this.onmessage) this.onmessage({ data: { id, success: true, bytes } } as MessageEvent);
      } catch (error: any) {
        if (this.cancelled) return;
        if (this.onmessage) this.onmessage({ data: { id, success: false, error: error.message || 'Unknown error' } } as MessageEvent);
      }
    }, 0);
  }

  terminate() { this.cancelled = true; }
}

export function createDedicatedWorker(_taskName?: string): Worker {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIframe = window.self !== window.top;

  if (isMobile || isIframe) {
    return new VirtualWorker() as any;
  }
  try {
    return new PDFWorker();
  } catch (err) {
    return new VirtualWorker() as any;
  }
}
