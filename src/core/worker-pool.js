/**
 * src/core/worker-pool.js - Managed Web Worker Pool adapter
 * Wraps dynamic tasks and forwards them to WorkerManager.js
 */
import { runPdfWorkerTask } from './WorkerManager.js';

export function runTask(task, payload, { transferables = [], onProgress = null, signal = null } = {}) {
  return runPdfWorkerTask(task, payload, transferables, onProgress);
}

export function terminateAll() {
  // Handled by WorkerManager
}
