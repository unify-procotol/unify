import { Fields } from "@unilab/urpc-core";

export class TodoEntity {
  static displayName = "TodoEntity";

  @Fields.string()
  id = "";

  @Fields.string()
  title = "";

  @Fields.boolean()
  completed = false;
}
