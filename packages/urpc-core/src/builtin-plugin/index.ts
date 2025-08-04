import { GlobalDataAdapter } from "./adapters/global-data";
import { GlobalSchemaAdapter } from "./adapters/global-schema";
import { URPC } from "./type";

export const BuiltinPlugin = ({ URPC }: { URPC: URPC }) => {
  return {
    adapters: [
      {
        source: "_global",
        entity: "_SchemaEntity",
        adapter: new GlobalSchemaAdapter(URPC),
      },
      {
        source: "_global",
        entity: "_DataEntity",
        adapter: new GlobalDataAdapter(),
      },
    ],
  };
};
