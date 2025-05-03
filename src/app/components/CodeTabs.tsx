'use client';

import { EditorPane } from './EditorPane';
import { useCallback, useState, useMemo } from 'react';
import { CodeTab } from '../types/compiler';
import { useSafeWorker } from './SafeWorker';
import { ConsoleOutput } from './ConsoleOutput';

export function CodeTabs() {
  const { executeCode } = useSafeWorker();
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<CodeTab[]>([
    { 
      id: crypto.randomUUID(), 
      title: 'Snippet 1', 
      code: '',
      logs: [] 
    },
  ]);

  const handleExecute = useCallback(
    async (tabId: string, code: string) => {
      if (!code.trim()) return; // Don't execute empty code
      
      try {
        const result = await executeCode(code);
        setTabs(prevTabs =>
          prevTabs.map(tab =>
            tab.id === tabId
              ? {
                  ...tab,
                  logs: [
                    ...tab.logs,
                    {
                      type: 'log',
                      message: result,
                      timestamp: new Date(),
                    },
                  ],
                }
              : tab
          )
        );
      } catch (error) {
        setTabs(prevTabs =>
          prevTabs.map(tab =>
            tab.id === tabId
              ? {
                  ...tab,
                  logs: [
                    ...tab.logs,
                    {
                      type: 'error',
                      message: error instanceof Error ? error.message : String(error),
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

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  const addNewTab = useCallback(() => {
    const newTab = {
      id: crypto.randomUUID(),
      title: `Snippet ${tabs.length + 1}`,
      code: '',
      logs: [],
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(tabs.length);
  }, [tabs.length]);

  const updateTabCode = useCallback((tabId: string, code: string) => {
    setTabs(prev =>
      prev.map(tab => (tab.id === tabId ? { ...tab, code } : tab))
    );
  }, []);

  const tabHeaders = useMemo(
    () =>
      tabs.map((tab, index) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(index)}
          className={`px-4 py-2 border-b-2 ${
            activeTab === index
              ? 'border-blue-500 font-bold text-blue-600 dark:text-blue-400'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          {tab.title}
        </button>
      )),
    [tabs, activeTab, handleTabChange]
  );

  const tabPanels = useMemo(
    () =>
      tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={`h-full p-0 ${activeTab === index ? 'block' : 'hidden'}`}
        >
          <div className="flex h-full">
            <div className="flex-1">
              <EditorPane
                initialCode={tab.code}
                onExecute={(code) => handleExecute(tab.id, code)}
                onChange={(code) => updateTabCode(tab.id, code)}
              />
            </div>
            <div className="w-96">
              <ConsoleOutput logs={tab.logs} />
            </div>
          </div>
        </div>
      )),
    [tabs, activeTab, handleExecute, updateTabCode]
  );

  return (
    <div className="h-full">
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {tabHeaders}
        <button
          onClick={addNewTab}
          className="px-4 py-2 font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          +
        </button>
      </div>
      <div className="h-[calc(100%-40px)]">{tabPanels}</div>
    </div>
  );
}