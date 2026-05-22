const MAX_WORKERS = Math.min(4, navigator.hardwareConcurrency || 2);
const TASK_TIMEOUT_MS = 60000; // 60 seconds timeout to prevent hanging promises

const workerPool = [];
const taskQueue = [];
let taskCounter = 0;
const activeTasks = new Map(); // Global registry for active tasks: taskId -> { resolve, reject, onProgress, timeoutId, worker }

class WorkerInstance {
  constructor() {
    this.worker = new Worker(new URL('../../pdf-worker.js', import.meta.url), { type: 'module' });
    this.currentTaskId = null;
    this.isTerminated = false;

    this.worker.onmessage = (e) => {
      if (this.isTerminated) return;
      const { id, status, result, error, progress, type } = e.data;

      // Handle progress reporting
      if (status === 'progress' || type === 'progress') {
        const activeTask = activeTasks.get(id);
        if (activeTask && activeTask.onProgress) {
          activeTask.onProgress(e.data);
        }
        return;
      }

      // Handle final state
      const activeTask = activeTasks.get(id);
      if (activeTask) {
        clearTimeout(activeTask.timeoutId);
        if (status === 'success') {
          activeTask.resolve(result);
        } else {
          const errMsg = error ? (error.message || error.errorType || error) : 'Unknown worker error';
          activeTask.reject(new Error(errMsg));
        }
        activeTasks.delete(id);
      }

      this.currentTaskId = null;
      processQueue();
    };

    this.worker.onerror = (err) => {
      if (this.isTerminated) return;
      console.error('Core Web Worker unexpected error:', err);

      if (this.currentTaskId !== null) {
        const activeTask = activeTasks.get(this.currentTaskId);
        if (activeTask) {
          clearTimeout(activeTask.timeoutId);
          activeTask.reject(new Error('Web Worker crashed unexpectedly during processing'));
          activeTasks.delete(this.currentTaskId);
        }
      }

      this.terminate();
      removeWorkerFromPool(this);
      processQueue();
    };
  }

  terminate() {
    this.isTerminated = true;
    try {
      this.worker.terminate();
    } catch (e) {
      console.error('Failed to terminate worker:', e);
    }
  }
}

function removeWorkerFromPool(workerInstance) {
  const index = workerPool.indexOf(workerInstance);
  if (index !== -1) {
    workerPool.splice(index, 1);
  }
}

function processQueue() {
  // 1. Clean up any terminated workers from pool
  for (let i = workerPool.length - 1; i >= 0; i--) {
    if (workerPool[i].isTerminated) {
      workerPool.splice(i, 1);
    }
  }

  // 2. If nothing is in queue, return
  if (taskQueue.length === 0) return;

  // 3. Find an idle worker
  let idleWorker = workerPool.find(w => w.currentTaskId === null && !w.isTerminated);

  // 4. Create a new worker if under MAX limit and none are idle
  if (!idleWorker && workerPool.length < MAX_WORKERS) {
    idleWorker = new WorkerInstance();
    workerPool.push(idleWorker);
  }

  // 5. If we have an idle worker, dispatch the next task
  if (idleWorker) {
    const task = taskQueue.shift();
    idleWorker.currentTaskId = task.id;

    // Start safety timeout
    const timeoutId = setTimeout(() => {
      console.error(`Worker Task ${task.id} [${task.taskName}] timed out after ${TASK_TIMEOUT_MS}ms. Discarding worker.`);
      const activeTask = activeTasks.get(task.id);
      if (activeTask) {
        activeTask.reject(new Error(`PDF task execution exceeded the timeout limit of ${TASK_TIMEOUT_MS / 1000}s.`));
        activeTasks.delete(task.id);
      }
      idleWorker.terminate();
      removeWorkerFromPool(idleWorker);
      processQueue();
    }, TASK_TIMEOUT_MS);

    // Register active task
    activeTasks.set(task.id, {
      resolve: task.resolve,
      reject: task.reject,
      onProgress: task.onProgress,
      timeoutId,
      worker: idleWorker
    });

    const payload = task.payload;
    payload.id = task.id;

    // Filter transferables to ensure they have positive byteLength (prevents browser/Vite serialization fails)
    const validTransferables = task.transferables.filter(t => t && t.byteLength > 0);

    try {
      idleWorker.worker.postMessage({ id: task.id, task: task.taskName, payload }, validTransferables);
    } catch (e) {
      console.warn("Buffer transfer failed. Defaulting to copy-passing.", e);
      idleWorker.worker.postMessage({ id: task.id, task: task.taskName, payload });
    }
  }
}

export function initPdfWorker() {
  // Ensure that at least one worker is alive and initialized
  const initializedWorker = workerPool.find(w => !w.isTerminated);
  if (!initializedWorker) {
    const newWorker = new WorkerInstance();
    workerPool.push(newWorker);
  }
}

export function runPdfWorkerTask(taskName, payload, transferables = [], onProgress = null) {
  initPdfWorker();
  return new Promise((resolve, reject) => {
    const id = ++taskCounter;
    taskQueue.push({
      id,
      taskName,
      payload,
      transferables,
      onProgress,
      resolve,
      reject
    });
    processQueue();
  });
}

window.runPdfWorkerTask = runPdfWorkerTask;

