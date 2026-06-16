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
  const { bytes: sanitizedBytes } = PDFSanitizer.sanitize(rawBytes);

  const loadingTask = pdfjs.getDocument({
    data: sanitizedBytes,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

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
  transferables?: Transferable[];
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
    const res = await runActualWorker(task.type, task.args, task.transferables);
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
  args: any,
  transferables?: Transferable[]
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const worker = createDedicatedWorker("pdf-run");

    worker.onmessage = (e: MessageEvent) => {
      const { success, error, ...data } = e.data;
      if (success) {
        resolve(data);
      } else {
        reject(new Error(error || "Worker operation failed"));
      }
      worker.terminate();
    };

    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };

    worker.postMessage({ type, ...args }, transferables || []);
  });
};

export const executePdfWorker = async (
  type: string,
  args: any,
  transferables?: Transferable[]
): Promise<any> => {
  return new Promise((resolve, reject) => {
    workerQueue.push({
      type,
      args,
      transferables,
      resolve,
      reject,
    });
    processQueue();
  });
};
