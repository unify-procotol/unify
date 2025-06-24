import { SchemaObject } from "./decorators";

export class Entity {
  name: string = "";
  schemas: Record<string, SchemaObject> = {};
}
