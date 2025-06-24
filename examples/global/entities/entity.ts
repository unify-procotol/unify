import { SchemaObject } from "openapi3-ts";

export class Entity {
  name: string = "";
  schemas: Record<string, SchemaObject> = {};
}
