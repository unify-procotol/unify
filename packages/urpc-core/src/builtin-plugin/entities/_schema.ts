import { SchemaObject } from "../../decorators";

export class _SchemaEntity {
  static displayName = "_SchemaEntity";

  name: string = "";
  schema: SchemaObject = {};
  sources?: string[] = [];
}
