// Custom schema object type definition (replaces openapi3-ts dependency)
export interface SchemaObject {
  type?: string | string[];
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  description?: string;
  format?: string;
  enum?: any[];
  default?: any;
  example?: any;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  not?: SchemaObject;
  additionalProperties?: boolean | SchemaObject;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minProperties?: number;
  maxProperties?: number;
  pattern?: string;
}

// Schema metadata storage
const schemaMetadata = new Map<any, Map<string, FieldMetadata>>();
const relationMetadata = new Map<any, Map<string, RelationMetadata>>();

export interface FieldMetadata {
  type:
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "array"
    | "record";
  optional?: boolean;
  description?: string;
  target?: () => any; // For array and record types that reference other entities
}

export interface RelationMetadata {
  type: "toOne" | "toMany";
  target: () => any;
  optional?: boolean;
}

// Fields decorators
export const Fields = {
  string: (options?: { optional?: boolean; description?: string }) => {
    return (target: any, propertyKey: string) => {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "string",
        optional: options?.optional,
        description: options?.description,
      });
    };
  },

  number: (options?: { optional?: boolean; description?: string }) => {
    return (target: any, propertyKey: string) => {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "number",
        optional: options?.optional,
        description: options?.description,
      });
    };
  },

  boolean: (options?: { optional?: boolean; description?: string }) => {
    return (target: any, propertyKey: string) => {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "boolean",
        optional: options?.optional,
        description: options?.description,
      });
    };
  },

  date: (options?: { optional?: boolean; description?: string }) => {
    return (target: any, propertyKey: string) => {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "date",
        optional: options?.optional,
        description: options?.description,
      });
    };
  },

  array: (
    target: () => any,
    options?: { optional?: boolean; description?: string }
  ) => {
    return (targetClass: any, propertyKey: string) => {
      setFieldMetadata(targetClass.constructor, propertyKey, {
        type: "array",
        target,
        optional: options?.optional,
        description: options?.description,
      });
    };
  },

  record: (
    target: () => any,
    options?: { optional?: boolean; description?: string }
  ) => {
    return (targetClass: any, propertyKey: string) => {
      setFieldMetadata(targetClass.constructor, propertyKey, {
        type: "record",
        target,
        optional: options?.optional,
        description: options?.description,
      });
    };
  },
};

// Relations decorators
export const Relations = {
  toOne: (target: () => any, options?: { optional?: boolean }) => {
    return (targetClass: any, propertyKey: string) => {
      setRelationMetadata(targetClass.constructor, propertyKey, {
        type: "toOne",
        target,
        optional: options?.optional,
      });
    };
  },

  toMany: (target: () => any, options?: { optional?: boolean }) => {
    return (targetClass: any, propertyKey: string) => {
      setRelationMetadata(targetClass.constructor, propertyKey, {
        type: "toMany",
        target,
        optional: options?.optional,
      });
    };
  },
};

// Metadata helper functions
function setFieldMetadata(
  target: any,
  propertyKey: string,
  metadata: FieldMetadata
) {
  if (!schemaMetadata.has(target)) {
    schemaMetadata.set(target, new Map());
  }
  schemaMetadata.get(target)!.set(propertyKey, metadata);
}

function getFieldMetadata(
  target: any,
  propertyKey: string
): FieldMetadata | undefined {
  return schemaMetadata.get(target)?.get(propertyKey);
}

function setRelationMetadata(
  target: any,
  propertyKey: string,
  metadata: RelationMetadata
) {
  if (!relationMetadata.has(target)) {
    relationMetadata.set(target, new Map());
  }
  relationMetadata.get(target)!.set(propertyKey, metadata);
}

function getRelationMetadata(
  target: any,
  propertyKey: string
): RelationMetadata | undefined {
  return relationMetadata.get(target)?.get(propertyKey);
}

// Helper function to get entity class name from target function
function getEntityTypeName(targetFunction: () => any): string {
  try {
    const targetClass = targetFunction();
    return targetClass.name || "UnknownEntity";
  } catch (error) {
    // If target function fails (e.g., circular dependency), try to extract from function string
    const funcStr = targetFunction.toString();
    const match = funcStr.match(/return\s+(?:require\([^)]+\)\.)?(\w+)/);
    return match ? match[1] : "UnknownEntity";
  }
}

// Schema generation using custom SchemaObject interface
export function generateSchema(entityClass: any): SchemaObject {
  const fields = schemaMetadata.get(entityClass) || new Map();
  const relations = relationMetadata.get(entityClass) || new Map();

  const properties: Record<string, SchemaObject> = {};
  const required: string[] = [];

  // Process field metadata
  for (const [propertyKey, metadata] of fields) {
    let property: SchemaObject;

    if (metadata.type === "array" && metadata.target) {
      const relatedEntityName = getEntityTypeName(metadata.target);
      property = {
        type: "array",
        items: {
          type: relatedEntityName,
        } as any, // Cast to any to allow custom type names
        description: metadata.description,
      };
    } else if (metadata.type === "record" && metadata.target) {
      const relatedEntityName = getEntityTypeName(metadata.target);
      property = {
        type: relatedEntityName,
        description: metadata.description,
      } as any; // Cast to any to allow custom type names
    } else {
      property = {
        type: metadata.type === "date" ? "string" : (metadata.type as any),
        description: metadata.description,
      };

      if (metadata.type === "array" && !metadata.target) {
        property.type = "array";
        property.items = { type: "string" }; // default item type
      }
    }

    properties[propertyKey] = property;

    if (!metadata.optional) {
      required.push(propertyKey);
    }
  }

  // Process relation metadata
  for (const [propertyKey, metadata] of relations) {
    const relatedEntityName = getEntityTypeName(metadata.target);

    if (metadata.type === "toOne") {
      properties[propertyKey] = {
        type: relatedEntityName,
        description: `Related ${propertyKey} entity`,
      } as any; // Cast to any to allow custom type names
    } else if (metadata.type === "toMany") {
      properties[propertyKey] = {
        type: "array",
        items: {
          type: relatedEntityName,
          description: `Related ${propertyKey} entities`,
        } as any, // Cast to any to allow custom type names
      };
    }

    if (!metadata.optional) {
      required.push(propertyKey);
    }
  }

  return {
    type: "object",
    properties,
    required,
  };
}

// Convert multiple entity classes to schemas
export function generateSchemas(
  entityClasses: any[]
): Record<string, SchemaObject> {
  const schemas: Record<string, SchemaObject> = {};

  for (const entityClass of entityClasses) {
    const className = entityClass.name;
    schemas[className] = generateSchema(entityClass);
  }

  return schemas;
}
