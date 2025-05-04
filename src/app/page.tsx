"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DOMPurify from "dompurify";
import { EditorPane } from "./components/EditorPane";
import { ConsoleOutput } from "./components/ConsoleOutput";
import { useTheme } from "./components/ThemeProvider";
import { useSafeWorker } from "./components/SafeWorker";
import { CodeTab } from "./types/compiler";
export default function JavaScriptCompiler() {
  const { theme, toggleTheme } = useTheme();
  const { executeCode } = useSafeWorker();
  const [tabs, setTabs] = useState<CodeTab[]>(() => {
    return [
      {
        id: "welcome",
        title: "Welcome",
        code: '// Welcome to JavaScript Compiler\n// Start typing here...\n\nconsole.log("Hello World!");',
        logs: [],
        showMenu: false,
      },
    ];
  });
  const [activeTabId, setActiveTabId] = useState<string>("welcome");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const consolePaneRef = useRef<HTMLDivElement>(null);
  const [consoleWidth, setConsoleWidth] = useState(384); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);

  // Load tabs from localStorage on initial render
  useEffect(() => {
    const savedTabs = localStorage.getItem("tabs");
    if (savedTabs) {
      setTabs(JSON.parse(savedTabs));
    }
  }, []);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  // Set first tab as active on initial load
  useEffect(() => {
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  // Handle title editing
  const startEditingTitle = () => {
    setTempTitle(activeTab.title);
    setIsEditingTitle(true);
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const saveTitle = () => {
    const sanitizedTitle = DOMPurify.sanitize(tempTitle.trim());
    if (sanitizedTitle) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, title: sanitizedTitle } : tab
        )
      );
    }
    setIsEditingTitle(false);
  };

  // Handle console resizing
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && consolePaneRef.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 600) {
          setConsoleWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const addNewTab = useCallback(() => {
    const newTab = {
      id: crypto.randomUUID(),
      title: `Snippet ${tabs.length}`,
      code: '// Welcome to JavaScript Compiler\n// Start typing here...\n\nconsole.log("Hello World!");',
      logs: [],
      showMenu: false,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs.length]);

  const updateTabCode = useCallback((tabId: string, code: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, code } : tab))
    );
  }, []);

  const handleExecute = useCallback(
    async (tabId: string, code: string) => {
      const sanitizedCode = DOMPurify.sanitize(code);
      if (!sanitizedCode.trim()) return;

      try {
        const result = await executeCode(sanitizedCode);
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === tabId
              ? {
                  ...tab,
                  logs: [
                    ...tab.logs,
                    {
                      type: "log",
                      message: result,
                      timestamp: new Date(),
                    },
                  ],
                }
              : tab
          )
        );
      } catch (error) {
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === tabId
              ? {
                  ...tab,
                  logs: [
                    ...tab.logs,
                    {
                      type: "error",
                      message:
                        error instanceof Error ? error.message : String(error),
                      timestamp: new Date(),
                    },
                  ],
                }
              : tab
          )
        );
      }
    },
    [executeCode]
  );

  // clear active tab logs
  const clearActiveTabLogs = useCallback(() => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, logs: [] } : tab
      )
    );
  }, [activeTabId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold">JS Compiler</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <span className="text-yellow-300">☀️</span>
            ) : (
              <span className="text-gray-600">🌙</span>
            )}
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={addNewTab}
            className="w-full py-2 px-3 mb-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+</span> New Snippet
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-2 mb-2">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`group flex items-center px-3 py-2 text-sm rounded-md mx-2 my-1 transition-colors ${
                activeTabId === tab.id
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <button
                onClick={() => {
                  setActiveTabId(tab.id);
                  setSidebarOpen(false);
                }}
                className="flex-1 text-left truncate cursor-pointer"
              >
                {tab.title}
              </button>

              {/* Three-dot menu button */}
              <div className="relative">
                <button
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTabId(tab.id); // Select the tab when clicking menu
                    // Toggle menu visibility for this tab
                    setTabs((prev) =>
                      prev.map((t) => ({
                        ...t,
                        showMenu: t.id === tab.id ? !t.showMenu : false,
                      }))
                    );
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h.01M12 12h.01M19 12h.01"
                    />
                  </svg>
                </button>

                {/* Dropdown menu - only show if tab.showMenu is true */}
                {tab.showMenu && (
                  <div
                    className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Confirm before deleting
                        // if (
                        //   confirm("Are you sure you want to delete this tab?")
                        // ) {
                          setTabs((prev) => {
                            const newTabs = prev.filter((t) => t.id !== tab.id);
                            // If we're deleting the active tab, switch to another tab
                            if (tab.id === activeTabId && newTabs.length > 0) {
                              setActiveTabId(newTabs[0].id);
                            }
                            // If we're deleting the last tab, create a new one
                            if (newTabs.length === 0) {
                              const newTab = {
                                id: crypto.randomUUID(),
                                title: "New Tab",
                                code: "",
                                logs: [],
                                showMenu: false,
                              };
                              setActiveTabId(newTab.id);
                              return [newTab];
                            }
                            return newTabs.map((t) => ({
                              ...t,
                              showMenu: false,
                            }));
                          });
                        // }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Tab
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 transition-all duration-300">
        {activeTab && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Editor Pane */}
            <div className="flex-1 overflow-auto p-4">
              <div className="h-full flex flex-col">
                <div className="mb-2 flex justify-between items-center">
                  {isEditingTitle ? (
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                      className="text-lg font-medium bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 w-full"
                    />
                  ) : (
                    <h2
                      className="text-lg font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded w-full overflow-hidden text-ellipsis"
                      onClick={startEditingTitle}
                    >
                      {activeTab.title}
                    </h2>
                  )}
                </div>
                <div className="flex-1 rounded-lg overflow-hidden">
                  <EditorPane
                    key={activeTab.id}
                    initialCode={activeTab.code}
                    onExecute={(code) => handleExecute(activeTab.id, code)}
                    onChange={(code) => updateTabCode(activeTab.id, code)}
                  />
                </div>
              </div>
            </div>

            {/* Resizable Console Pane */}
            <div
              className="relative"
              style={{ width: `${consoleWidth}px` }}
              ref={consolePaneRef}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize bg-gray-200 dark:bg-gray-600 hover:bg-blue-500 z-10"
                onMouseDown={startResizing}
              />
              <div className="h-full overflow-auto p-4 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
                <ConsoleOutput
                  logs={activeTab.logs}
                  clearLogs={clearActiveTabLogs}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
