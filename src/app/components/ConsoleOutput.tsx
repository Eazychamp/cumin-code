"use client";

import { ConsoleEntry } from "../types/compiler";
import { memo, useEffect, useRef } from "react";

interface ConsoleOutputProps {
  logs: ConsoleEntry[];
  clearLogs: () => void;
}

const LogItem = memo(({ log }: { log: ConsoleEntry }) => {
  const textColor = {
    log: "text-gray-800 dark:text-gray-200",
    error: "text-red-500 dark:text-red-400",
    warn: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
    debug: "text-purple-600 dark:text-purple-400",
  }[log.type];

  return (
    <div className={`text-sm whitespace-pre-wrap ${textColor}`}>
      {`> ${log.message}`}
      {/* [{log.timestamp.toLocaleTimeString()}] {log.message} */}
    </div>
  );
});

LogItem.displayName = "LogItem";

export const ConsoleOutput = memo(({ logs, clearLogs }: ConsoleOutputProps) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-800 px-2 rounded-md overflow-y-auto font-mono border-l border-gray-200 dark:border-gray-700">
      {/* makes this stick to top */}
      <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between mb-2">
        <div className="text-gray-500 dark:text-gray-400">Console Output</div>
        <button
          onClick={() => clearLogs()}
          className="py-1 px-2 text-white rounded-md cursor-pointer"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {logs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No logs yet</div>
        ) : (
          logs.map((log, index) => (
            <LogItem key={`${log.timestamp.getTime()}-${index}`} log={log} />
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
});

ConsoleOutput.displayName = "ConsoleOutput";
