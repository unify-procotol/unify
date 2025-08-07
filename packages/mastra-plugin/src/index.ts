import { Plugin } from "@unilab/urpc-core";
import { ChatEntity } from "./entities/chat";
import { MastraAdapter } from "./adapters/mastra";
import { MastraPluginOptions } from "./type";

export { convertSchemaToMarkdown } from "./utils/entity-schema-to-markdown";
export { convertEntitySourcesToMarkdown } from "./utils/entity-source-to-markdown";

export const MastraPlugin = (options: MastraPluginOptions): Plugin => {
  return {
    entities: [ChatEntity],
    adapters: [
      {
        source: "mastra",
        entity: "ChatEntity",
        adapter: new MastraAdapter(options),
      },
    ],
  };
};
