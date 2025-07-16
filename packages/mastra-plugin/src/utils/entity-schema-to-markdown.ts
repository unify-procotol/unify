import { SchemaObject } from "@unilab/urpc-core";

export function convertSchemaToMarkdown(
  schemas: Record<string, SchemaObject>
): string {
  let markdown = "";

  for (const [entityName, entitySchema] of Object.entries(schemas)) {
    if (entityName === "ChatEntity") {
      continue;
    }
    markdown += `### ${entityName}:\n`;

    for (const [propertyName, propertySchema] of Object.entries(
      entitySchema.properties ?? {}
    )) {
      const isRequired = entitySchema.required?.includes(propertyName) ?? false;
      const type = getTypeString(propertySchema);
      const description = propertySchema.description;

      markdown += `- ${propertyName}${isRequired ? "" : "?"}: ${type} (${description})\n`;
    }

    markdown += "\n";
  }

  return markdown;
}

function getTypeString(schemaObj: SchemaObject): string {
  if (schemaObj.type === "array") {
    if (schemaObj.items) {
      return `${schemaObj.items.type}[]`;
    }
    return "any[]";
  }

  return schemaObj.type as string;
}
