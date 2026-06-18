import { PDFJS_WORKER_SRC } from "../config/constants";
import { createDedicatedWorker } from "./WorkerManager";
import { PDFSanitizer } from "./PDFSanitizer";

export interface PDFLoadResult {
  pdf: any;
}

export const preprocessAndLoadPdf = async (
  file: File,
  options: {
    onEncrypted?: () => void;
    showToast: (msg: string, type: "success" | "error" | "info") => void;
    customLockMessage?: string;
  }
): Promise<PDFLoadResult> => {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

  const arrayBuffer = await file.arrayBuffer();
  
  // Clean, repair, and sanitize the document streams locally before running previews or extraction
  const rawBytes = new Uint8Array(arrayBuffer);
  
  // Validate before loading
  try {
    PDFSanitizer.validate(rawBytes);
  } catch (err: any) {
    if (err.message === "SECURED_LOCKED" && options.onEncrypted) {
      options.onEncrypted();
    }
  }

  const { bytes: sanitizedBytes } = PDFSanitizer.sanitize(rawBytes);

  const loadingTask = pdfjs.getDocument({
    data: sanitizedBytes,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  } as any);

  loadingTask.onPassword = (updatePassword: any, reason: number) => {
    if (options.onEncrypted) {
      options.onEncrypted();
    }
    if (reason === 1) {
      options.showToast(options.customLockMessage || "🔒 Password protected PDF document.", "info");
    }
    updatePassword("");
  };

  const pdf = await loadingTask.promise;
  return { pdf };
};

// Concurrency pool and task scheduling queue to prevent browser hangs
interface Task {
  type: string;
  args: any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

const workerQueue: Task[] = [];
let activeWorkerCount = 0;
const MAX_CONCURRENT_TASKS = Math.min(2, typeof navigator !== "undefined" && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 2);

const processQueue = async (): Promise<void> => {
  if (workerQueue.length === 0 || activeWorkerCount >= MAX_CONCURRENT_TASKS) return;

  const task = workerQueue.shift()!;
  activeWorkerCount++;

  try {
    const res = await runActualWorker(task.type, task.args);
    task.resolve(res);
  } catch (err) {
    task.reject(err);
  } finally {
    activeWorkerCount--;
    setTimeout(processQueue, 0);
  }
};

const runActualWorker = (
  type: string,
  args: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = createDedicatedWorker();
    } catch {
      reject(new Error("Failed to initialize PDF processing worker sandbox."));
      return;
    }

    // 5-minute timeout to prevent hung workers
    const timeoutSeconds = 5 * 60;
    const timeoutId = setTimeout(() => {
      worker.terminate();
      reject(new Error("Worker sandbox computation timed out after 5 minutes."));
    }, timeoutSeconds * 1000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      worker.terminate();
    };

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === "progress") {
        if (args.onProgress && typeof args.onProgress === "function") {
          args.onProgress(e.data.progress);
        }
      } else {
        const { success, error, ...data } = e.data;
        cleanup();
        if (success) {
          resolve(data);
        } else {
          reject(new Error(error || "Worker operation failed"));
        }
      }
    };

    worker.onerror = (err) => {
      cleanup();
      reject(err);
    };

    // Auto-detect Transferables for high-speed zero-copy operations
    const transferables: Transferable[] = [];
    if (args.fileBytes instanceof Uint8Array) {
      transferables.push(args.fileBytes.buffer);
    }
    if (Array.isArray(args.files)) {
      for (const f of args.files) {
        if (f instanceof Uint8Array) {
          transferables.push(f.buffer);
        }
      }
    }
    if (Array.isArray(args.images)) {
      for (const f of args.images) {
        if (f.bytes instanceof Uint8Array) {
          transferables.push(f.bytes.buffer);
        }
      }
    }

    worker.postMessage({ type, ...args }, transferables);
  });
};

export const executePdfWorker = async (
  type: string,
  args: any
): Promise<any> => {
  // Check and validate incoming bytes before passing to Worker execution pipeline
  if (args && args.fileBytes instanceof Uint8Array) {
    try {
      PDFSanitizer.validate(args.fileBytes);
    } catch (err: any) {
      return Promise.reject(err);
    }
  }

  return new Promise((resolve, reject) => {
    workerQueue.push({
      type,
      args,
      resolve,
      reject,
    });
    processQueue();
  });
};

export const getPageCount = async (arrayBuffer: ArrayBuffer): Promise<number> => {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  } as any);
  const pdf = await loadingTask.promise;
  return pdf.numPages;
};

