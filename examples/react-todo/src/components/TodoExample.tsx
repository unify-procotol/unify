"use client";

import React, { useState, useEffect } from "react";
import { UniRender } from "@unilab/ukit";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { Logging } from "@unilab/urpc-core/middleware";
import { TodoEntity } from "../entities/todo";

const TodoPlugin: Plugin = {
  entities: [TodoEntity],
};

let isSessionInitialized = false;

export function TodoExample() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeURPC = async () => {
      try {
        const { IndexedDBAdapter } = await import("@unilab/urpc-adapters");

        URPC.init({
          plugins: [TodoPlugin],
          middlewares: [Logging()],
          entityConfigs: {
            todo: {
              defaultSource: "indexeddb",
            },
          },
          globalAdapters: [IndexedDBAdapter],
        });

        if (!isSessionInitialized) {
          isSessionInitialized = true;
        }

        setIsInitialized(true);
      } catch (err) {
      } finally {
      }
    };

    if (!isInitialized) {
      initializeURPC();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <UniRender
      entity={TodoEntity}
      source={'indexeddb'}
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
            label: 'Toggle',
            //check icon 
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>,
            onClick: async (record: any, index: number, entityInstance: any, refresh: () => Promise<void>) => {
              await repo({
                entity: 'todo',
              }).update({
                where: { id: record.id },
                data: { completed: !record.completed }
              });
              await refresh();
            }
          } as any]
        },
        table: {
          enablePagination: true,
          pageSize: 5,
          showAddButton: true,
          showTopControls: true,
        },
        emptyState: {
          showAddButton: true
        }
      } as any}
    />
  );
} 