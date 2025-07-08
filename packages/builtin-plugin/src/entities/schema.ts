import { SchemaObject } from "@unilab/urpc-core";

export class SchemaEntity {
  name: string = "";
  schema: SchemaObject = {};
  sources?: string[] = [];
}
