"use client";

import React, { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy } from "lucide-react";
import { UniRender } from "@unilab/ukit";
import { initUrpcClient } from "@/lib/urpc-client";
import { repo } from "@unilab/urpc";
import { TodoEntity } from "@/lib/entities/todo";
import DemoContainer from "@/components/demo-container";
import ChatWidget from "@/components/chat-widget";

export default function ReactTodo() {
  const uniRenderRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initUrpcClient();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      <DemoContainer title="Todo App Demo">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <UniRender
            ref={uniRenderRef}
            entity={TodoEntity}
            source={"indexeddb"}
            layout="table"
            config={{
              id: {
                hidden: true,
              },
            }}
            generalConfig={
              {
                showActions: true,
                actions: {
                  edit: true,
                  delete: false,
                  custom: [
                    {
                      label: "Toggle",
                      icon: (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6 text-green-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      ),
                      onClick: async (
                        record: any,
                        index: number,
                        entityInstance: any,
                        refresh: () => Promise<void>
                      ) => {
                        await repo({
                          entity: "todo",
                        }).update({
                          where: { id: record.id },
                          data: { completed: !record.completed },
                        });
                        await refresh();
                      },
                    } as any,
                  ],
                },
                table: {
                  enablePagination: true,
                  pageSize: 5,
                  showAddButton: true,
                  showTopControls: true,
                },
                emptyState: {
                  showAddButton: true,
                },
              } as any
            }
          />
        </div>
        <CodeDisplay />
      </DemoContainer>
      <ChatWidget
        entity="chat"
        source="mastra-client"
        entities={["TodoEntity"]}
        quickCommands={[
          "Query all todo tasks",
          'Add a TODO task with the title "test"',
        ]}
        onSuccess={() => {
          uniRenderRef.current?.refreshData?.();
        }}
      />
    </>
  );
}

// Add CodeDisplay component
function CodeDisplay() {
  const urpcConfigCode = `const TodoPlugin: Plugin = {
  entities: [TodoEntity],
};

URPC.init({
  plugins: [TodoPlugin],
  middlewares: [logging()],
  entityConfigs: {
    todo: {
      defaultSource: "indexeddb",
    },
  },
  globalAdapters: [{
    source: "indexeddb",
    factory: () => new IndexedDBAdapter(),
  }]
});`;

  const uiCode = `<UniRender
  entity={TodoEntity}
  source={"indexeddb"}
  layout="table"
  config={{
    id: {
      hidden: true,
    },
  }}
  generalConfig={{
    showActions: true,
    actions: {
      edit: true,
      delete: false,
      custom: [{
        label: "Toggle",
        icon: <CheckIcon />,
        onClick: async (record, index, entityInstance, refresh) => {
          await repo({ entity: "todo" }).update({
            where: { id: record.id },
            data: { completed: !record.completed },
          });
          await refresh();
        },
      }],
    },
    table: {
      enablePagination: true,
      pageSize: 5,
      showAddButton: true,
      showTopControls: true,
    },
    emptyState: {
      showAddButton: true,
    },
  }}
/>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-2">
          Code Implementation
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          URPC configuration and UniRender component implementation for Todo app
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-white">
                  URPC Configuration
                </h3>
                <p className="text-xs text-green-100">URPC Setup</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                  Local URPC Configuration
                </span>
                <button
                  onClick={() => copyToClipboard(urpcConfigCode)}
                  className="flex items-center px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300 text-xs transition-colors"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </button>
              </div>
              <div className="bg-slate-900 dark:bg-slate-950">
                {/* @ts-ignore */}
                <SyntaxHighlighter
                  language="javascript"
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    padding: "12px",
                    fontSize: "11px",
                    lineHeight: "1.4",
                    background: "transparent",
                    height: "200px",
                    overflow: "auto",
                  }}
                  codeTagProps={{
                    style: {
                      background: "transparent",
                    },
                  }}
                  showLineNumbers={false}
                  showInlineLineNumbers={false}
                  wrapLines={false}
                  wrapLongLines={true}
                >
                  {urpcConfigCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>

        {/* UI Code */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-white">UI Code</h3>
                <p className="text-xs text-blue-100">UniRender Component</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                  UI Code
                </span>
                <button
                  onClick={() => copyToClipboard(uiCode)}
                  className="flex items-center px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300 text-xs transition-colors"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </button>
              </div>
              <div className="bg-slate-900 dark:bg-slate-950">
                {/* @ts-ignore */}
                <SyntaxHighlighter
                  language="jsx"
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    padding: "12px",
                    fontSize: "11px",
                    lineHeight: "1.4",
                    background: "transparent",
                    height: "200px",
                    overflow: "auto",
                  }}
                  codeTagProps={{
                    style: {
                      background: "transparent",
                    },
                  }}
                  showLineNumbers={false}
                  showInlineLineNumbers={false}
                  wrapLines={false}
                  wrapLongLines={true}
                >
                  {uiCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
