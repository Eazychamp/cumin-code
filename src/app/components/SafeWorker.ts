// app/components/SafeWorker.ts
import { useCallback, useEffect, useRef } from 'react';
import { WorkerMessage } from '../types/compiler';

export function useSafeWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/sandbox.worker.ts', import.meta.url)
    );

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const executeCode = useCallback(
    (code: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) return reject('Worker not initialized');

        const handler = (e: MessageEvent<WorkerMessage>) => {
          if (e.data.type === 'result') {
            workerRef.current?.removeEventListener('message', handler);
            resolve(e.data.payload || '');
          } else if (e.data.type === 'error') {
            workerRef.current?.removeEventListener('message', handler);
            reject(e.data.error || 'Unknown error');
          }
        };

        workerRef.current.addEventListener('message', handler);
        workerRef.current.postMessage({
          type: 'execute',
          payload: code,
        });
      });
    },
    []
  );

  return { executeCode };
}