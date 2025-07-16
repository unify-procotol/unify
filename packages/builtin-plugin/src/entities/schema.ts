import { SchemaObject } from "@unilab/urpc-core";

export class SchemaEntity {
  static displayName = "SchemaEntity";
  
  name: string = "";
  schema: SchemaObject = {};
  sources?: string[] = [];
}
