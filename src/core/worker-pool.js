/**
 * src/core/worker-pool.js - Managed Web Worker Pool
 * Max 4 concurrent workers. Queue with priority. AbortController support.
 */
const MAX_WORKERS = 4;
const workers = [];
const queue = [];
let taskId = 0;
const callbacks = new Map();

function createWorker() {
  const worker = new Worker(new URL('../../workers/pdf-processor.js', import.meta.url), { type: 'module' });

  worker.onmessage = (e) => {
    const { id, status, result, error, progress } = e.data;
    const cb = callbacks.get(id);
    if (!cb) return;

    if (status === 'progress' || progress !== undefined) {
      if (cb.onProgress) cb.onProgress(progress || e.data);
      return;
    }

    if (status === 'success') {
      cb.resolve(result);
    } else {
      const errMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      cb.reject(new Error(errMsg));
    }

    callbacks.delete(id);
    worker.isBusy = false;
    processQueue();
  };

  worker.onerror = (err) => {
    console.error('Worker error:', err);
    // Fail all pending callbacks for this worker
    for (const [id, cb] of callbacks) {
      if (cb.worker === worker) {
        cb.reject(new Error('Worker crashed'));
        callbacks.delete(id);
      }
    }
    worker.isBusy = false;
    processQueue();
  };

  worker.isBusy = false;
  return worker;
}

function getAvailableWorker() {
  let worker = workers.find(w => !w.isBusy);
  if (!worker && workers.length < MAX_WORKERS) {
    worker = createWorker();
    workers.push(worker);
  }
  return worker;
}

function processQueue() {
  if (queue.length === 0) return;

  const worker = getAvailableWorker();
  if (!worker) return; // All workers busy, wait for completion

  const { id, task, payload, transferables, resolve, reject, onProgress, signal } = queue.shift();

  worker.isBusy = true;
  callbacks.set(id, { resolve, reject, onProgress, worker });

  // Handle AbortController
  if (signal) {
    signal.addEventListener('abort', () => {
      worker.terminate();
      const idx = workers.indexOf(worker);
      if (idx > -1) workers.splice(idx, 1);
      reject(new Error('Task aborted'));
      callbacks.delete(id);
      processQueue();
    });
  }

  worker.postMessage({ id, task, payload }, transferables);
}

export function runTask(task, payload, { transferables = [], onProgress = null, signal = null } = {}) {
  return new Promise((resolve, reject) => {
    const id = ++taskId;
    queue.push({ id, task, payload, transferables, resolve, reject, onProgress, signal });
    processQueue();
  });
}

export function terminateAll() {
  workers.forEach(w => w.terminate());
  workers.length = 0;
  queue.length = 0;
  callbacks.clear();
}
