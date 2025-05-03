import { useEffect, useState } from 'react';

export function useMonaco() {
  const [monaco, setMonaco] = useState<typeof import('monaco-editor') | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !monaco) {
      import('@monaco-editor/react').then((monacoEditor) => {
        monacoEditor.loader.init().then((monacoInstance) => {
          setMonaco(monacoInstance);
        });
      });
    }
  }, [monaco]);

  return monaco;
}