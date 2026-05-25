// @ts-ignore
import PDFWorker from '../workers/pdf-worker.ts?worker';

export function createDedicatedWorker(_taskName: string): Worker {
  // Return the centralized unified worker that can route any PDF tasks (merge, split, etc.) securely and performantly
  return new PDFWorker();
}
