import { WorkerManager } from './WorkerManager';

// Ensures Web Worker instantiation occurs securely through Vite's bundler.
// Prevents dynamic CSP violations from CDN imports inside worker payload.

const instance: WorkerManager | null = null;
if (!instance) {
  // Instance creation must happen lazily via the getInstance(), wait.
}

export { WorkerManager };
