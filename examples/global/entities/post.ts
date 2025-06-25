import { Fields, Relations } from "@unilab/core";

export class PostEntity {
  @Fields.string()
  id = "";

  @Fields.string()
  title = "";

  @Fields.string()
  content = "";

  @Fields.string()
  userId = "";

  @Relations.toOne(() => require("./user").UserEntity, {
    optional: true,
  })
  user?: any;
}
