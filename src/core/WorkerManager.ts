import { logger } from '../utils/logger';

export class WorkerManager {
  private static instance: WorkerManager;
  private worker: Worker | null = null;
  private promises: Map<
    string,
    { resolve: (val: any) => void; reject: (err: any) => void; timer: any }
  > = new Map();
  private isSupported: boolean;

  private constructor() {
    this.isSupported = typeof window !== 'undefined' && typeof Worker !== 'undefined';
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  private initWorker() {
    if (!this.worker && this.isSupported) {
      this.worker = new Worker(new URL('../workers/pdf-worker.ts', import.meta.url), {
        type: 'module',
      });
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = (err) => {
        logger.error('Worker error:', err);
      };
    }
    return this.worker;
  }

  private handleMessage(e: MessageEvent) {
    const { id, success, result, error } = e.data;
    const promise = this.promises.get(id);
    if (promise) {
      clearTimeout(promise.timer);
      if (success) {
        promise.resolve(result);
      } else {
        promise.reject(new Error(error));
      }
      this.promises.delete(id);
    }
  }

  public async runOperation<T>(
    operation: string,
    payload: any,
    transferables: Transferable[] = []
  ): Promise<T> {
    if (!this.isSupported) {
      logger.warn('Web Workers not supported, running on main thread.');
      return (await this.runOnMainThread(operation, payload)) as T;
    }

    const worker = this.initWorker();
    if (!worker) {
      return (await this.runOnMainThread(operation, payload)) as T;
    }

    const id = Date.now().toString() + Math.random().toString(36).substring(2);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.promises.has(id)) {
          this.promises.delete(id);
          reject(new Error('Processing timed out — try a smaller file.'));
        }
      }, 120 * 1000); // 120 seconds timeout

      this.promises.set(id, { resolve, reject, timer });

      try {
        worker.postMessage({ id, operation, payload }, transferables);
      } catch (err: any) {
        clearTimeout(timer);
        this.promises.delete(id);
        reject(err);
      }
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    for (const [id, promise] of this.promises.entries()) {
      clearTimeout(promise.timer);
      promise.reject(new Error('Worker was terminated.'));
    }
    this.promises.clear();
  }

  private async runOnMainThread(operation: string, payload: any): Promise<any> {
    const ops = await import('../core/pdf-operations');
    switch (operation) {
      case 'mergePDFs':
        return await ops.mergePDFs(payload.filesBytes);
      case 'splitPDF':
        return await ops.splitPDF(payload.bytes, payload.ranges);
      case 'extractPages':
        return await ops.extractPages(payload.bytes, payload.pageNumbers);
      case 'rotatePDF':
        return await ops.rotatePDF(payload.bytes, payload.degreesValue, payload.pageIndices);
      case 'deletePagesPDF':
        return await ops.deletePagesPDF(payload.bytes, payload.pageIndices);
      case 'reorderPDF':
        return await ops.reorderPDF(payload.bytes, payload.newOrder);
      case 'watermarkPDF':
        return await ops.watermarkPDF(payload.bytes, payload.text, payload.options);
      case 'addPageNumbersPDF':
        return await ops.addPageNumbersPDF(payload.bytes, payload.options);
      case 'addBlankPagePDF':
        return await ops.addBlankPagePDF(payload.bytes, payload.position, payload.pageSizeKey);
      case 'imagesToPDF':
        return await ops.imagesToPDF(payload.imageBlobs, payload.options);
      case 'compressPDF':
        return await ops.compressPDF(payload.bytes);
      case 'protectPDF':
        return await ops.protectPDF(payload);
      case 'unlockPDF':
        return await ops.unlockPDF(payload);
      case 'pdfToImage':
        return await ops.pdfToImage(payload.bytes, payload.originalName, payload.scale, payload.maxPages, payload.format);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}
