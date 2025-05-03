"use client";

import { useMonaco } from "../hooks/useMonaco";
import { useCallback, useEffect, useRef, useState } from "react";
import { Monaco, MonacoCompletionItem } from "../types/compiler";
import MonacoEditor from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import * as monaco from "monaco-editor";
// import { useDebounce } from "../hooks/useDebounce";

interface EditorPaneProps {
  initialCode?: string;
  onExecute: (code: string) => void;
  onChange?: (code: string) => void;
}

export function EditorPane({
  initialCode = '// Write your code here\nconsole.log("Hello, World!");',
  onExecute,
  onChange,
}: EditorPaneProps) {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );
  const monaco = useMonaco();
  const [code, setCode] = useState(initialCode);
  const [isDarkMode, setIsDarkMode] = useState(false);
  

//   Debounce the code with 1.5 second delay before execution
//   const debouncedCode = useDebounce(code, 300);

//   useEffect(() => {
//     // Execute code when debounced value changes
//     if (debouncedCode && debouncedCode.trim() !== "") {
//       onExecute(debouncedCode);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debouncedCode]);

  useEffect(() => {
    // Check for dark mode preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const setupCustomCompletions = useCallback(
    (
      editor: monacoEditor.editor.IStandaloneCodeEditor,
      monaco: Monaco | null
    ) => {
      if (!monaco) return;

      monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems: () => ({
          suggestions: getCompletionItems(monaco),
        }),
      });
    },
    []
  );

  const handleEditorDidMount = useCallback(
    (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      setupCustomCompletions(editor, monaco);
    },
    [monaco, setupCustomCompletions]
  );

  const getCompletionItems = (monaco: Monaco): MonacoCompletionItem[] => {
    const position = editorRef.current?.getPosition();
    const range = position
      ? monaco.Range.fromPositions(position, position)
      : undefined;

    return [
      {
        label: "myCustomFunction",
        kind: monaco.languages.CompletionItemKind.Function,
        documentation: "My custom function",
        insertText: "myCustomFunction()",
        range: range as monaco.IRange,
      },
      ...["log", "warn", "error"].map((method) => ({
        label: `console.${method}`,
        kind: monaco.languages.CompletionItemKind.Method,
        documentation: `Console ${method} method`,
        insertText: `console.${method}(\${1:message})`,
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range as monaco.IRange,
      })),
    ];
  };

  const handleExecute = useCallback(() => {
    onExecute(code);
  }, [code, onExecute]);

  const handleChange = useCallback(
    (value?: string) => {
      const newCode = value || "";
      setCode(newCode);
      onChange?.(newCode);
    },
    [onChange]
  );

  return (
      <div className="h-full border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
        {monaco ? (
          <MonacoEditor
            height="93%"
            defaultLanguage="javascript"
            theme={isDarkMode ? "vs-dark" : "light"}
            value={code}
            onChange={(value: string | undefined) => handleChange(value || "")}
            onMount={(editor) =>
              handleEditorDidMount(
                editor as monacoEditor.editor.IStandaloneCodeEditor
              )
            }
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              wordWrap: "on",
              automaticLayout: true,
              suggest: {
                preview: true,
              },
              scrollBeyondLastLine: false,
            }}
          />
        ) : (
          <div className="p-4">Loading editor...</div>
        )}
        <button
          onClick={handleExecute}
          className="mt-2 px-4 py-2 mr-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors float-end cursor-pointer"
        >
          Run Code
        </button>
      </div>
  );
}
