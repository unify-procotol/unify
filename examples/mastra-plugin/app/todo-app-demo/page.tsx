"use client";

import React, { useState, useEffect } from "react";
import { UniRender } from "@unilab/ukit";
import { initUrpcClient } from "@/lib/urpc-client";
import { repo } from "@unilab/urpc";
import { TodoEntity } from "@/entities/todo";

export default function ReactTodo() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initUrpcClient();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <UniRender
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

      <div className="mt-4 flex items-center gap-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={async () => {
            const result = await repo({
              entity: "chat",
              source: "mastra-client",
            }).call({
              input: "Query all todo tasks",
              model: "google/gemini-2.0-flash-001",
            });
            console.log("result==>", result);
          }}
        >
          Query all todo tasks
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={async () => {
            const result = await repo({
              entity: "chat",
              source: "mastra-client",
            }).call({
              input: "Update the TODO task with id number 6 to task111",
              model: "google/gemini-2.0-flash-001",
            });
            console.log("result==>", result);
          }}
        >
          Update the TODO task with id number 6 to task111
        </button>
      </div>
    </div>
  );
}
