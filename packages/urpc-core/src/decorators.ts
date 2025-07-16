import "reflect-metadata";

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

// Metadata keys for reflect-metadata
const FIELD_METADATA_KEY = Symbol("field:metadata");

export interface FieldMetadata {
  type:
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "array"
    | "record"
    | "action";
  optional?: boolean;
  description?: string;
  target?: () => any; // For array and record types that reference other entities
  params?: Record<string, any>; // For action parameters
  returns?: any; // For action return type
}

export const Fields = {
  string: (options?: { optional?: boolean; description?: string }) => {
    const decorator = function stringFieldDecorator(
      target: any,
      propertyKey: string
    ) {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "string",
        optional: options?.optional,
        description: options?.description,
      });
    };
    Object.defineProperty(decorator, "name", { value: "stringFieldDecorator" });
    return decorator;
  },

  number: (options?: { optional?: boolean; description?: string }) => {
    const decorator = function numberFieldDecorator(
      target: any,
      propertyKey: string
    ) {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "number",
        optional: options?.optional,
        description: options?.description,
      });
    };
    Object.defineProperty(decorator, "name", { value: "numberFieldDecorator" });
    return decorator;
  },

  boolean: (options?: { optional?: boolean; description?: string }) => {
    const decorator = function booleanFieldDecorator(
      target: any,
      propertyKey: string
    ) {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "boolean",
        optional: options?.optional,
        description: options?.description,
      });
    };
    Object.defineProperty(decorator, "name", {
      value: "booleanFieldDecorator",
    });
    return decorator;
  },

  date: (options?: { optional?: boolean; description?: string }) => {
    const decorator = function dateFieldDecorator(
      target: any,
      propertyKey: string
    ) {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "date",
        optional: options?.optional,
        description: options?.description,
      });
    };
    Object.defineProperty(decorator, "name", { value: "dateFieldDecorator" });
    return decorator;
  },

  array: (
    target: () => any,
    options?: { optional?: boolean; description?: string }
  ) => {
    const decorator = function arrayFieldDecorator(
      targetClass: any,
      propertyKey: string
    ) {
      setFieldMetadata(targetClass.constructor, propertyKey, {
        type: "array",
        target,
        optional: options?.optional,
        description: options?.description,
      });
    };
    Object.defineProperty(decorator, "name", { value: "arrayFieldDecorator" });
    return decorator;
  },

  record: (
    target: () => any,
    options?: { optional?: boolean; description?: string }
  ) => {
    const decorator = function recordFieldDecorator(
      targetClass: any,
      propertyKey: string
    ) {
      setFieldMetadata(targetClass.constructor, propertyKey, {
        type: "record",
        target,
        optional: options?.optional,
        description: options?.description,
      });
    };
    Object.defineProperty(decorator, "name", { value: "recordFieldDecorator" });
    return decorator;
  },

  action: (options: {
    name: string;
    description?: string;
    params?: Record<string, any>;
    returns?: any;
  }) => {
    const decorator = function actionFieldDecorator(
      target: any,
      propertyKey: string
    ) {
      setFieldMetadata(target.constructor, propertyKey, {
        type: "action",
        description: options.description,
        params: options.params,
        returns: options.returns,
      });
    };
    Object.defineProperty(decorator, "name", { value: "actionFieldDecorator" });
    return decorator;
  },
};

// Metadata helper functions using reflect-metadata
function setFieldMetadata(
  target: any,
  propertyKey: string,
  metadata: FieldMetadata
) {
  const existingMetadata =
    Reflect.getMetadata(FIELD_METADATA_KEY, target) || {};
  existingMetadata[propertyKey] = metadata;
  Reflect.defineMetadata(FIELD_METADATA_KEY, existingMetadata, target);
}

function getFieldMetadata(
  target: any,
  propertyKey: string
): FieldMetadata | undefined {
  const metadata = Reflect.getMetadata(FIELD_METADATA_KEY, target);
  return metadata?.[propertyKey];
}

function getAllFieldMetadata(target: any): Record<string, FieldMetadata> {
  return Reflect.getMetadata(FIELD_METADATA_KEY, target) || {};
}

// Helper function to get entity class name from target function
function getEntityTypeName(targetFunction: () => any): string {
  try {
    const targetClass = targetFunction();
    return extractEntityClassName(targetClass);
  } catch (error) {
    // If target function fails (e.g., circular dependency), try to extract from function string
    const funcStr = targetFunction.toString();
    const match = funcStr.match(/return\s+(?:require\([^)]+\)\.)?(\w+)/);
    return match ? match[1] : "UnknownEntity";
  }
}

// Schema generation using custom SchemaObject interface
export function generateSchema(entityClass: any): SchemaObject {
  const fields = getAllFieldMetadata(entityClass);

  const properties: Record<string, SchemaObject> = {};
  const required: string[] = [];

  for (const [propertyKey, metadata] of Object.entries(fields)) {
    let property: SchemaObject;

    if (metadata.type === "array" && metadata.target) {
      const relatedEntityName = getEntityTypeName(metadata.target);
      property = {
        type: "array",
        items: {
          type: relatedEntityName,
        } as any,
        description: metadata.description,
      };
    } else if (metadata.type === "record" && metadata.target) {
      const relatedEntityName = getEntityTypeName(metadata.target);
      property = {
        type: relatedEntityName,
        description: metadata.description,
      } as any;
    } else {
      property = {
        type: metadata.type === "date" ? "string" : (metadata.type as any),
        description: metadata.description,
      };

      if (metadata.type === "array" && !metadata.target) {
        property.type = "array";
        property.items = { type: "string" };
      }
    }

    properties[propertyKey] = property;

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

export function generateSchemas(
  entityClasses: any[]
): Record<string, SchemaObject> {
  const schemas: Record<string, SchemaObject> = {};

  for (const entityClass of entityClasses) {
    const name = extractEntityClassName(entityClass);
    schemas[name] = generateSchema(entityClass);
  }

  return schemas;
}

export function extractEntityClassName(entityClass: any): string {
  return entityClass.displayName || entityClass.name;
}

export function extractAdapterName(adapterClass: any): string {
  return adapterClass.displayName || adapterClass.name;
}
