import { PgBuiltinAdapter } from "./adapters/pg-builtin-adapter";
import { connect } from "./lib/generate-entities";
import { EntityConfig, PoolManagerConfig } from "./type";
import { Plugin } from "@unilab/urpc-core";

export const PGPlugin = async ({
  poolConfig,
  whitelist,
  entity,
  needGenerateEntityFile = false,
}: {
  poolConfig: PoolManagerConfig;
  whitelist?: {
    schema: string;
    tables: string[];
  }[];
  entity?: EntityConfig;
  needGenerateEntityFile?: boolean;
}): Promise<Plugin> => {
  const { entities, factory } = await connect({
    poolConfig,
    whitelist,
    entity,
    needGenerateEntityFile,
  });

  return {
    entities: [],
    adapters: [
      {
        source: "pg",
        entity: "_system",
        adapter: new PgBuiltinAdapter(),
      },
      ...entities.map((entityName) => ({
        source: "pg",
        entity: entityName,
        adapter: factory(entityName),
      })),
    ],
  };
};
