import { SchemaObject } from "../../decorators";

export class SchemaEntity {
  static displayName = "SchemaEntity";
  
  name: string = "";
  schema: SchemaObject = {};
  sources?: string[] = [];
}
