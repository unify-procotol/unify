import { connect } from "./lib/generate-entities";
import { EntityConfig, PoolManagerConfig } from "./type";
import { Plugin } from "@unilab/urpc-core";

export const PGPlugin = async ({
  poolConfig,
  entity,
  needGenerateEntityFile = false,
}: {
  poolConfig: PoolManagerConfig;
  entity: EntityConfig;
  needGenerateEntityFile?: boolean;
}): Promise<Plugin> => {
  const { entities, factory } = await connect({
    poolConfig,
    entity,
    needGenerateEntityFile,
  });

  return {
    entities: [],
    adapters: entities.map((entityName) => ({
      source: "pg",
      entity: entityName,
      adapter: factory(entityName),
    })),
  };
};
