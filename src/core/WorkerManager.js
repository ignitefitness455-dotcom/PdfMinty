const MAX_WORKERS = Math.min(4, navigator.hardwareConcurrency || 2);
const TASK_TIMEOUT_MS = 60000; // 60 seconds timeout to prevent hanging promises

const workerPool = [];
const taskQueue = [];
let taskCounter = 0;
const activeTasks = new Map(); // Global registry for active tasks: taskId -> { resolve, reject, onProgress, timeoutId, worker }

function createDedicatedWorker(taskName) {
  switch (taskName) {
    case 'merge':
      return new Worker(new URL('../../workers/merge.js', import.meta.url), { type: 'module' });
    case 'split':
      return new Worker(new URL('../../workers/split.js', import.meta.url), { type: 'module' });
    case 'compress':
      return new Worker(new URL('../../workers/compress.js', import.meta.url), { type: 'module' });
    case 'watermark':
      return new Worker(new URL('../../workers/watermark.js', import.meta.url), { type: 'module' });
    case 'add-page-numbers':
      return new Worker(new URL('../../workers/add-page-numbers.js', import.meta.url), { type: 'module' });
    case 'reorder':
      return new Worker(new URL('../../workers/reorder.js', import.meta.url), { type: 'module' });
    case 'protect':
      return new Worker(new URL('../../workers/protect.js', import.meta.url), { type: 'module' });
    case 'add-blank-page':
      return new Worker(new URL('../../workers/add-blank-page.js', import.meta.url), { type: 'module' });
    case 'delete-pages':
      return new Worker(new URL('../../workers/delete-pages.js', import.meta.url), { type: 'module' });
    case 'extract-pages':
      return new Worker(new URL('../../workers/extract-pages.js', import.meta.url), { type: 'module' });
    case 'rotate':
      return new Worker(new URL('../../workers/rotate.js', import.meta.url), { type: 'module' });
    case 'unlock':
      return new Worker(new URL('../../workers/unlock.js', import.meta.url), { type: 'module' });
    case 'image-to-pdf':
      return new Worker(new URL('../../workers/image-to-pdf.js', import.meta.url), { type: 'module' });
    default:
      throw new Error(`Core Web Worker does not support task: ${taskName}`);
  }
}

class WorkerInstance {
  constructor(taskName) {
    this.taskName = taskName;
    this.worker = createDedicatedWorker(taskName);
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
      console.error(`Core Web Worker [${this.taskName}] unexpected error:`, err);

      if (this.currentTaskId !== null) {
        const activeTask = activeTasks.get(this.currentTaskId);
        if (activeTask) {
          clearTimeout(activeTask.timeoutId);
          activeTask.reject(new Error(`Web Worker for ${this.taskName} crashed unexpectedly during processing`));
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
      console.error(`Failed to terminate worker [${this.taskName}]:`, e);
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

  // 3. For the first task in queue, run it
  const task = taskQueue[0];

  // See if we have an idle worker for this specific taskName
  let idleWorker = workerPool.find(w => w.taskName === task.taskName && w.currentTaskId === null && !w.isTerminated);

  // If no worker is idle for this task, and we have reached MAX_WORKERS,
  // we can terminate one of the idle workers of *another* task type!
  if (!idleWorker && workerPool.length >= MAX_WORKERS) {
    const idleOtherWorker = workerPool.find(w => w.currentTaskId === null && w.taskName !== task.taskName && !w.isTerminated);
    if (idleOtherWorker) {
      idleOtherWorker.terminate();
      removeWorkerFromPool(idleOtherWorker);
    }
  }

  // Now check again: if no idle worker, and we are under MAX_WORKERS, spawn a new task-specific worker
  if (!idleWorker && workerPool.length < MAX_WORKERS) {
    try {
      idleWorker = new WorkerInstance(task.taskName);
      workerPool.push(idleWorker);
    } catch (err) {
      console.error(`Failed to initiate worker for task ${task.taskName}:`, err);
      // Fallback: reject the task
      taskQueue.shift();
      task.reject(err);
      processQueue();
      return;
    }
  }

  // If we have an idle worker, dispatch the next task
  if (idleWorker) {
    taskQueue.shift(); // remove from queue
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

export function initPdfWorker(taskName = 'merge') {
  // Ensure that at least one worker for this task is alive and initialized
  const initializedWorker = workerPool.find(w => w.taskName === taskName && !w.isTerminated);
  if (!initializedWorker) {
    try {
      const newWorker = new WorkerInstance(taskName);
      workerPool.push(newWorker);
    } catch (e) {
      console.error('Failed to pre-init worker:', e);
    }
  }
}

export function runPdfWorkerTask(taskName, payload, transferables = [], onProgress = null) {
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

