import { SchemaObject } from "../decorators";

export interface URPC {
  getEntitySchemas(): Record<string, SchemaObject>;
  getEntitySources(): Record<string, string[]>;
}
