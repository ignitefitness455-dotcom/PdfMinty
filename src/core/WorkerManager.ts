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
          // FIX: 'pdf-to-image' case VirtualWorker-এ missing ছিল।
          // আসল pdf-worker.ts-এ এটা ছিল, কিন্তু এই fallback VirtualWorker-এ
          // ছিল না। ফলে Web Worker কাজ না করলে (iframe বা old browser),
          // PDF to Image tool সম্পূর্ণ fail করতো "Unsupported task type" error দিয়ে।
          case 'pdf-to-image': {
            const results = await ops.pdfToImage(payload);
            if (this.cancelled) return;
            if (this.onmessage) this.onmessage({ data: { id, success: true, results } } as MessageEvent);
            return;
          }
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

function canUseWebWorker(): boolean {
  // Feature detection — NOT user agent sniffing
  try {
    if (typeof Worker === 'undefined') return false;
    if (window.self !== window.top) {
      // Iframe context: try creating a test worker
      const testBlob = new Blob(['self.postMessage("ok")'], 
        { type: 'application/javascript' });
      const testUrl = URL.createObjectURL(testBlob);
      const testWorker = new Worker(testUrl);
      testWorker.terminate();
      URL.revokeObjectURL(testUrl);
    }
    return true;
  } catch {
    return false; // Only fall back to VirtualWorker if Worker creation fails
  }
}

export function createDedicatedWorker(_taskName?: string): Worker {
  console.debug(`[PDFMINTY-DEBUG] createDedicatedWorker(): Starting creation for task="${_taskName || 'unknown'}"`);
  if (!canUseWebWorker()) {
    console.debug(`[PDFMINTY-DEBUG] createDedicatedWorker(): Fallback to VirtualWorker. Reason: Web Workers not supported or blocked in iframe context.`);
    return new VirtualWorker() as any;
  }
  try {
    const worker = new PDFWorker();
    console.debug("[PDFMINTY-DEBUG] createDedicatedWorker(): Success creating HTML5 WebWorker (PDFWorker)");
    return worker;
  } catch (err) {
    console.debug("[PDFMINTY-DEBUG] createDedicatedWorker(): Fallback to VirtualWorker. Reason: Exception caught during PDFWorker instantiation. Error:", err);
    return new VirtualWorker() as any;
  }
}
