import { Plugin } from "@unilab/urpc-core";
import { MastraClientAdapter } from "./adapters/mastra";
import { ChatEntity } from "./entities/chat";

export const MastraClientPlugin = (): Plugin => {
  return {
    entities: [ChatEntity],
    adapters: [
      {
        source: "mastra-client",
        entity: "ChatEntity",
        adapter: new MastraClientAdapter(),
      },
    ],
  };
};

export * from "./type";
