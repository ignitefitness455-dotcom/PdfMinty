import * as ops from './pdf-operations';
import PDFWorker from '../workers/pdf-worker.ts?worker&inline';

// Safe development-only logger — stripped in production by Vite's tree-shaker
const IS_DEV = typeof import.meta !== "undefined" &&
  (import.meta as any).env?.DEV === true;
const debugLog = IS_DEV
  ? (...args: unknown[]) => console.debug(...args)
  : (..._args: unknown[]) => { /* noop in production */ };

class VirtualWorker {
  onmessage: ((this: any, ev: MessageEvent) => any) | null = null;
  onerror: ((this: any, ev: ErrorEvent) => any) | null = null;
  cancelled: boolean = false;

  async postMessage(message: any, _transfer?: Transferable[]) {
    // Gracefully handle both flat and nested message structures
    const { type, payload: nestedPayload, id, ...flatPayload } = message;
    const payload = nestedPayload !== undefined ? nestedPayload : flatPayload;

    // Run asynchronously to allow UI layout frame updates
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
          case 'img-to-pdf': {
            // SYSTEM BUG FIXED: img-to-pdf now returns ImgToPdfResult { bytes, warnings }
            const result = await ops.imagesToPDF(payload);
            if (this.cancelled) return;
            if (this.onmessage) {
              this.onmessage({
                data: {
                  id,
                  success: true,
                  bytes: result.bytes,
                  warnings: result.warnings
                }
              } as MessageEvent);
            }
            return;
          }
          case 'compress': bytes = await ops.compressPDF(payload); break;
          case 'protect': bytes = await ops.protectPDF(payload); break;
          case 'unlock': bytes = await ops.unlockPDF(payload); break;
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
      let testUrl: string | null = null;
      try {
        const testBlob = new Blob(['self.postMessage("ok")'], { type: 'application/javascript' });
        testUrl = URL.createObjectURL(testBlob);
        const testWorker = new Worker(testUrl);
        testWorker.terminate();
      } finally {
        // PERFORMANCE & INTEGRITY FIX: Wrap Blob URL revocation in finally 
        // to guarantee cleanup even if Worker.terminate() throws.
        if (testUrl) {
          URL.revokeObjectURL(testUrl);
        }
      }
    }
    return true;
  } catch {
    return false; // Only fall back to VirtualWorker if Worker creation fails
  }
}

/**
 * Instantiates a standard HTML5 WebWorker or returns a compliant local VirtualWorker.
 * Uses a safe development-only logger to avoid CPU overhead and info leaks.
 */
export function createDedicatedWorker(_taskName?: string): Worker {
  debugLog(`[PDFMINTY-DEBUG] createDedicatedWorker(): Starting creation for task="${_taskName || 'unknown'}"`);
  if (!canUseWebWorker()) {
    debugLog(`[PDFMINTY-DEBUG] createDedicatedWorker(): Fallback to VirtualWorker. Reason: Web Workers not supported or blocked in iframe context.`);
    return new VirtualWorker() as any;
  }
  try {
    const worker = new PDFWorker();
    debugLog("[PDFMINTY-DEBUG] createDedicatedWorker(): Success creating HTML5 WebWorker (PDFWorker)");
    return worker;
  } catch (err) {
    debugLog("[PDFMINTY-DEBUG] createDedicatedWorker(): Fallback to VirtualWorker. Reason: Exception caught during PDFWorker instantiation. Error:", err);
    return new VirtualWorker() as any;
  }
}
