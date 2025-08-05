import { connect } from "./lib/generate-entities";
import { PoolManagerConfig } from "./type";
import { Plugin } from "@unilab/urpc-core";

export const PGPlugin = async ({
  poolConfig,
  entity,
  needGenerateEntityFile = false,
}: {
  poolConfig: PoolManagerConfig;
  entity: {
    [key: string]: {
      schema: string;
      table: string;
      fields: string[];
    };
  };
  needGenerateEntityFile?: boolean;
}): Promise<Plugin> => {
  const { entities, factory } = await connect({
    entity,
    needGenerateEntityFile,
    poolConfig,
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
