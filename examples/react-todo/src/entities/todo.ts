import { Fields } from "@unilab/urpc-core";

export class TodoEntity {
  @Fields.string()
  id = "";

  @Fields.string()
  title = "";

  @Fields.boolean()
  completed = false;
} 