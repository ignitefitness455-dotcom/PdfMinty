import PDFWorker from "../workers/pdf-worker.ts?worker&inline";
import * as ops from "./pdf-operations";

/**
 * Dev-only sandbox debugger stripped during production build optimization passes.
 */
const debugLog = (msg: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.debug(`[PDFWorker-Debug] ${msg}`, ...args);
  }
};

/**
 * Main-thread VirtualWorker representing a fully compliant fallback container
 * executing heavy PDF tasks synchronously inside sandbox contexts where Web Workers
 * are blocked by tight iFrame sandboxing or CORS/CSP limitations.
 */
export class VirtualWorker implements EventTarget {
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
  onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null = null;

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    _options?: boolean | AddEventListenerOptions
  ): void {
    debugLog("VirtualWorker added event listener for:", type, callback, _options);
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    _options?: boolean | EventListenerOptions
  ): void {
    debugLog("VirtualWorker removed event listener for:", type, callback, _options);
  }

  dispatchEvent(event: Event): boolean {
    debugLog("VirtualWorker dispatching event:", event);
    return true;
  }

  async postMessage(message: any) {
    const { type, ...args } = message;
    debugLog(`VirtualWorker executing task: ${type} synchronously in main thread.`);

    // Defer slightly using setTimeout to simulate browser environment task scheduler
    setTimeout(async () => {
      try {
        let result: any = null;
        if (type === "merge") {
          const bytes = await ops.mergePDFs(args);
          result = { success: true, bytes };
        } else if (type === "split") {
          const bytes = await ops.splitPDF(args);
          result = { success: true, bytes };
        } else if (type === "reorder") {
          const bytes = await ops.reorderPDF(args);
          result = { success: true, bytes };
        } else if (type === "extract") {
          const bytes = await ops.splitPDF(args);
          result = { success: true, bytes };
        } else if (type === "split-multi") {
          const results = await ops.splitPDFMulti(args);
          result = { success: true, results };
        } else if (type === "compress") {
          const bytes = await ops.compressPDF(args);
          result = { success: true, bytes };
        } else if (type === "rotate") {
          const bytes = await ops.rotatePDF(args);
          result = { success: true, bytes };
        } else if (type === "watermark") {
          const bytes = await ops.watermarkPDF(args);
          result = { success: true, bytes };
        } else if (type === "add-page-numbers" || type === "page-numbers") {
          const bytes = await ops.addPageNumbersPDF(args);
          result = { success: true, bytes };
        } else if (type === "add-blank-page" || type === "add-blank") {
          const bytes = await ops.addBlankPagePDF(args);
          result = { success: true, bytes };
        } else if (type === "protect") {
          const bytes = await ops.protectPDF(args);
          result = { success: true, bytes };
        } else if (type === "unlock") {
          const bytes = await ops.unlockPDF(args);
          result = { success: true, bytes };
        } else if (type === "image-to-pdf") {
          const resultData = await ops.imagesToPDF(args);
          result = { success: true, bytes: resultData.bytes, warnings: resultData.warnings };
        } else if (type === "pdf-to-image") {
          const results = await ops.pdfToImage(args);
          result = { success: true, results };
        } else {
          result = { success: false, error: "Unsupported worker operation code: " + type };
        }

        if (this.onmessage) {
          this.onmessage.call(this as unknown as Worker, { data: result } as MessageEvent);
        }
      } catch (err: any) {
        if (this.onmessage) {
          this.onmessage.call(this as unknown as Worker, {
            data: {
              success: false,
              error: err.message || "An error occurred during synchronous PDF processing.",
            },
          } as MessageEvent);
        }
      }
    }, 0);
  }

  terminate() {
    debugLog("VirtualWorker terminated.");
  }
}

/**
 * Assesses whether the browser context supports standard Web Workers
 * using non-sniffing real capabilities feature tests.
 */
export function canUseWebWorker(): boolean {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return false;
  }

  if (window.self !== window.top) {
    let testWorker: Worker | null = null;
    let url: string | null = null;
    try {
      const blob = new Blob(["self.onmessage = () => {}"], { type: "application/javascript" });
      url = URL.createObjectURL(blob);
      testWorker = new Worker(url);
      testWorker.terminate();
      return true;
    } catch {
      return false;
    } finally {
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  }

  return true;
}

/**
 * Prepares and instantiates a high-confidence Worker processor.
 * Automatically cascades to a resilient VirtualWorker fallback execution path
 * if browser Sandboxing prevents spawning distinct client threads.
 */
export const createDedicatedWorker = (taskName?: string): Worker => {
  debugLog(`Spawning dedicated pipeline task thread block for: ${taskName || "generic"}`);

  if (!canUseWebWorker()) {
    debugLog("Web Worker support unsupported or blocked in frame. Returning synchronous VirtualWorker.");
    return new VirtualWorker() as unknown as Worker;
  }

  try {
    return new PDFWorker();
  } catch (err) {
    debugLog("Failed to construct bundled PDFWorker. Cascading to robust main-thread representation.", err);
    return new VirtualWorker() as unknown as Worker;
  }
};
