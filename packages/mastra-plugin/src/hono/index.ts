import { Plugin } from "@unilab/urpc-core";
import { ChatEntity } from "../entities/chat";
import { MastraAdapter } from "../adapters/mastra";
import { MastraOptions } from "../utils/type";
import { URPC } from "@unilab/urpc-hono";

export const MastraPlugin = (options: MastraOptions = {}): Plugin => {
  return {
    entities: [ChatEntity],
    adapters: [
      {
        source: "mastra",
        entity: "ChatEntity",
        adapter: new MastraAdapter({
          ...options,
          URPC: URPC,
        }),
      },
    ],
  };
};
