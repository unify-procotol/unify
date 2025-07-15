import { EntityConfigs, simplifyEntityName } from "@unilab/urpc-core";

type EntitySources = Record<string, string[]>;

export function convertEntitySourcesToMarkdown(
  entitySources: EntitySources,
  entityConfigs: EntityConfigs
): string {
  const filteredConfig = Object.entries(entitySources).filter(
    ([entity, values]) =>
      !values.includes("_global") &&
      !values.includes("mastra") &&
      entity !== "ChatEntity"
  );
  return filteredConfig
    .map(([entity, values]) => {
      const simplifiedEntityName = simplifyEntityName(entity);
      const defaultSource = entityConfigs[simplifiedEntityName]?.defaultSource;
      const mockValues = values
        .map((v) => {
          if (v === defaultSource) {
            return `"${v}" (default)`;
          }
          return `"${v}"`;
        })
        .join("、");
      return `- ${entity}: ${mockValues}`;
    })
    .join("\n");
}
