type EntitySources = Record<string, string[]>;

export function convertEntitySourcesToMarkdown(
  entitySources: EntitySources
): string {
  const filteredConfig = Object.entries(entitySources).filter(
    ([entity, values]) => !values.includes("_global")
  );
  return filteredConfig
    .map(([entity, values]) => {
      const mockValues = values.map((v) => `"${v}"`).join("、");
      return `- ${entity}: ${mockValues}`;
    })
    .join("\n");
}
