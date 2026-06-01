import { useState, useCallback, useRef } from 'react';
import { createDedicatedWorker } from '../core/WorkerManager';

interface WorkerState {
  loading: boolean;
  progress: number;
  error: string | null;
  result: Uint8Array | null;
}

export function usePdfWorker() {
  const [state, setState] = useState<WorkerState>({
    loading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);

  const execute = useCallback(async (type: string, payload: any, transferable?: Transferable[]): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const id = ++idRef.current;
      setState({ loading: true, progress: 0, error: null, result: null });

      const worker = createDedicatedWorker(type);
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const data = e.data;
        // Support message responses with or without matching ID format
        if (data.id !== undefined && data.id !== id) return;

        if (data.type === 'progress') {
          setState(prev => ({ ...prev, progress: data.percent }));
          return;
        }

        if (data.success) {
          setState({ loading: false, progress: 100, error: null, result: data.bytes });
          resolve(data.bytes);
        } else {
          setState({ loading: false, progress: 0, error: data.error, result: null });
          reject(new Error(data.error));
        }
        worker.terminate();
      };

      worker.onerror = (err) => {
        setState({ loading: false, progress: 0, error: err.message, result: null });
        reject(err);
        worker.terminate();
      };

      // Construct a unified payload message
      const message = { id, type, payload, ...payload };
      if (transferable && transferable.length > 0) {
        worker.postMessage(message, transferable);
      } else {
        worker.postMessage(message);
      }
    });
  }, []);

  const cancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setState({ loading: false, progress: 0, error: 'Cancelled by user', result: null });
    }
  }, []);

  return { ...state, execute, cancel };
}
