import { URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { TodoEntity } from "@/entities/todo";
import { Logging } from "@unilab/urpc-core/middleware";
import { IndexedDBAdapter } from "@unilab/urpc-adapters";

let initialized = false;
export function initUrpcClient() {
  if (!initialized) {
    initialized = true;
    const TodoPlugin: Plugin = {
      entities: [TodoEntity],
    };
    URPC.init({
      // local urpc server
      plugins: [TodoPlugin],
      middlewares: [Logging()],
      entityConfigs: {
        todo: {
          defaultSource: "indexeddb",
        },
      },
      globalAdapters: [IndexedDBAdapter],

      // remote urpc server
      baseUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api`,
      timeout: 10000,
    });
  }
  return initialized;
}
