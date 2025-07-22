import { Fields } from "@unilab/urpc-core";
import type { UserEntity } from "./user";

export class PostEntity {
  static displayName = "PostEntity";
  
  @Fields.string({
    description: "The ID of the post",
  })
  id = "";

  @Fields.string({
    description: "The title of the post",
  })
  title = "";

  @Fields.string({
    description: "The content of the post",
  })
  content = "";

  @Fields.string({
    description: "The user ID of the post",
  })
  userId = "";

  @Fields.record(() => require("./user").UserEntity, {
    optional: true,
    description: "The user of the post",
  })
  user?: UserEntity;
}
