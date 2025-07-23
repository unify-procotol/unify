import { SchemaAdapter } from "./adapters/schema";
import { URPC } from "./type";

export const BuiltinPlugin = (urpc: URPC) => {
  return {
    entities: [],
    adapters: [
      {
        source: "_global",
        entity: "SchemaEntity",
        adapter: new SchemaAdapter(urpc),
      },
    ],
  };
};
