import { runPdfWorkerTask as originalRunPdfWorkerTask } from '../src/core/WorkerManager.js';

export function runPdfWorkerTask(taskName, payload, transferables = [], onProgress = null) {
  try {
    if (!originalRunPdfWorkerTask) {
      throw new Error('[pdfWorker.js] CRITICAL: runPdfWorkerTask implementation is missing.');
    }
    return originalRunPdfWorkerTask(taskName, payload, transferables, onProgress);
  } catch (error) {
    console.error('[pdfWorker.js] runPdfWorkerTask execution failed:', error);
    throw error;
  }
}

// Perform health check right at import time!
if (typeof runPdfWorkerTask !== 'function') {
  throw new Error('[pdfWorker.js] CRITICAL: runPdfWorkerTask is not a function.');
}
