import { PgBuiltinAdapter } from "./adapters/pg-builtin-adapter";
import { connect } from "./lib/generate-entities";
import { EntityConfig, PoolManagerConfig } from "./type";
import { Plugin } from "@unilab/urpc-core";

export const PGPlugin = async ({
  poolConfig,
  whitelist,
  entity,
  needGenerateEntityFile = false,
  customSource = "pg",
}: {
  poolConfig: PoolManagerConfig;
  whitelist?: {
    schema: string;
    tables: string[];
  }[];
  entity?: EntityConfig;
  needGenerateEntityFile?: boolean;
  customSource?: string;
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
        source: customSource,
        entity: "_system",
        adapter: new PgBuiltinAdapter(),
      },
      ...entities.map((entityName) => ({
        source: customSource,
        entity: entityName,
        adapter: factory(entityName),
      })),
    ],
  };
};
