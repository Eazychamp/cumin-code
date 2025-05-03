/// <reference lib="webworker" />

// Define the WorkerMessage type
interface WorkerMessage {
  type: 'execute';
  payload: string;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'execute') {
    try {
      // Capture console output
      const logs: string[] = [];
      const originalConsole: Partial<Console> = { ...console };

      (['log', 'error', 'warn', 'info', 'debug'] as const).forEach((method) => {
        console[method] = (...args: unknown[]) => {
          logs.push(`[${method}] ${args.map(String).join(' ')}`);
          originalConsole[method]?.(...args);
        };
      });

      // Execute code in strict mode
      const code = `"use strict";\n${e.data.payload}`;
      new Function(code)();

      // Restore original console
      Object.assign(console, originalConsole);

      self.postMessage({
        type: 'result',
        payload: logs.join('\n'),
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};