import { Fields } from "@unilab/urpc-core";

export class TodoEntity {
  static displayName = "TodoEntity";

  @Fields.number({
    description: "The id of the task, auto increment",
  })
  id = 0;

  @Fields.string({
    description: "The title of the task",
  })
  title = "";

  @Fields.boolean({
    optional: true,
    description: "Whether the task is completed",
  })
  completed = false;
}
