import { SchemaObject } from "@unilab/core";

export class SchemaEntity {
  name: string = "";
  schema: SchemaObject = {};
  sources?: string[] = [];
}
