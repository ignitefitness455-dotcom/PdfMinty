import { getPdfJs } from "./utils";
import { PDFSanitizer } from "./PDFSanitizer";
import { createDedicatedWorker } from "./WorkerManager";

export interface PreprocessResult {
  pdf: any;
  sanitizedBytes: Uint8Array;
}

export interface PreprocessOptions {
  skipEncryptionCheck?: boolean;
  onEncrypted?: () => void;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
  customLockMessage?: string;
}

/**
 * Preprocesses a selected file by reading its binary array,
 * feeding it through client-side PDFSanitizer, performing standard encryption
 * warning checks, and loading it with PDF.js for preview thumbnail layouts.
 */
export async function preprocessAndLoadPdf(
  file: File,
  options?: PreprocessOptions
): Promise<PreprocessResult> {
  const arrayBuffer = await file.arrayBuffer();
  let sanitizedBytes: any = new Uint8Array(arrayBuffer);

  try {
    const sanResult = PDFSanitizer.sanitize(sanitizedBytes, {
      skipEncryptionCheck: options?.skipEncryptionCheck,
    });
    sanitizedBytes = sanResult.bytes;
  } catch (err: any) {
    if (err?.message?.includes("SECURED_LOCKED")) {
      if (options?.onEncrypted) {
        options.onEncrypted();
      }
      if (options?.showToast) {
        options.showToast(
          options.customLockMessage ||
            "🔒 Standard secured/locked PDF file detected. Action restricted. Please use the Unlock tool first.",
          "error"
        );
      }
    }
    throw err;
  }

  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: sanitizedBytes,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  return { pdf, sanitizedBytes };
}

/**
 * Executes a PDF task (e.g. merge, split, rotate, watermark) inside a
 * Dedicated HTML5 Web Worker or elegant VirtualWorker fallback.
 */
export function executePdfWorker(
  taskType: string,
  payload: any,
  transferables?: Transferable[]
): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const worker = createDedicatedWorker(taskType);

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, results, error } = e.data;
        worker.terminate();
        if (success) {
          resolve({ bytes, results });
        } else {
          reject(new Error(error || "Worker operation failed"));
        }
      };

      worker.onerror = (err) => {
        console.error(`[PDFMINTY-DEBUG] Worker connection error during taskType=${taskType}:`, err);
        worker.terminate();
        reject(new Error("Worker connection error occurred during processing."));
      };

      worker.postMessage(
        {
          type: taskType,
          ...payload,
        },
        transferables || []
      );
    } catch (err) {
      reject(err);
    }
  });
}
