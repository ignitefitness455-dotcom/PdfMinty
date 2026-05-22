let pdfWorker = null;
let workerTaskId = 0;
const workerCallbacks = {};

export function initPdfWorker() {
  if (!pdfWorker) {
    // Determine the root for the worker based on Vite's asset handling or root path
    pdfWorker = new Worker(new URL('../../pdf-worker.js', import.meta.url), { type: 'module' });
    pdfWorker.onmessage = function (e) {
      const { id, status, result, error, progress, type } = e.data;
      if (status === 'progress' || type === 'progress') {
        if (workerCallbacks[id] && workerCallbacks[id].onProgress) {
          workerCallbacks[id].onProgress(e.data);
        }
        return;
      }

      if (workerCallbacks[id]) {
        if (status === 'success') {
          workerCallbacks[id].resolve(result);
        } else {
          workerCallbacks[id].reject(new Error(error ? error.message || error.errorType || error : 'Unknown worker error'));
        }
        delete workerCallbacks[id];
      }
    };
    pdfWorker.onerror = function (err) {
      console.error('Worker error:', err);
      for (let id in workerCallbacks) {
        workerCallbacks[id].reject(new Error('Worker crashed'));
        delete workerCallbacks[id];
      }
    };
  }
}

export function runPdfWorkerTask(task, payload, transferables = [], onProgress = null) {
  initPdfWorker();
  return new Promise((resolve, reject) => {
    const id = ++workerTaskId;
    workerCallbacks[id] = { resolve, reject, onProgress };
    payload.id = id;
    
    // Some browsers have issues with zero-length ArrayBuffers in transfer list
    const validTransferables = transferables.filter(t => t.byteLength > 0);
    
    try {
      pdfWorker.postMessage({ id, task, payload }, validTransferables);
    } catch (e) {
      // Fallback without transferables if postMessage throws
      console.warn("Transferring buffers failed, falling back to copy", e);
      pdfWorker.postMessage({ id, task, payload });
    }
  });
}

window.runPdfWorkerTask = runPdfWorkerTask;
