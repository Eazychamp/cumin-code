export interface ConsoleEntry {
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: Date;
}

export interface CodeTab {
  id: string;
  title: string;
  code: string;
  logs: ConsoleEntry[]; // Each tab now has its own logs
  showMenu?: boolean;
}
  
export  interface CodeTab {
    id: string;
    title: string;
    code: string;
  }
  
export type Monaco = typeof import('monaco-editor');
export type MonacoEditor = import('monaco-editor').editor.IStandaloneCodeEditor;
export type MonacoCompletionItem = import('monaco-editor').languages.CompletionItem;

export  interface WorkerMessage {
    type: 'execute' | 'result' | 'error';
    payload?: string;
    error?: string;

    timestamp?: Date;
  }