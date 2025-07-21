import { URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { TodoEntity } from "./entities/todo";
import { LEDEntity } from "./entities/led";
import { ACEntity } from "./entities/ac";
import { Logging } from "@unilab/urpc-core/middleware";
import { IndexedDBAdapter } from "@unilab/urpc-adapters";
import { MastraClientPlugin } from "@unilab/mastra-client-plugin";
import { IoTAdapter } from "./adapters/iot-adapter";

export function initUrpcClient() {
  const TodoPlugin: Plugin = {
    entities: [TodoEntity],
    adapters: [
      {
        entity: "TodoEntity",
        source: "indexeddb",
        adapter: new IndexedDBAdapter(),
      },
    ],
  };

  const IoTPlugin: Plugin = {
    entities: [LEDEntity, ACEntity],
    adapters: [
      {
        entity: "LEDEntity",
        source: "iot",
        adapter: new IoTAdapter(),
      },
      {
        entity: "ACEntity",
        source: "iot",
        adapter: new IoTAdapter(),
      },
    ],
  };

  URPC.init({
    // local urpc server
    plugins: [TodoPlugin, IoTPlugin, MastraClientPlugin()],
    middlewares: [Logging()],
    entityConfigs: {
      todo: {
        defaultSource: "indexeddb",
      },
      led: {
        defaultSource: "iot",
      },
      ac: {
        defaultSource: "iot",
      },
    },

    // remote urpc server
    baseUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api`,
    timeout: 20000,
  });
}
