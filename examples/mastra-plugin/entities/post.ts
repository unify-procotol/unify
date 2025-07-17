import { Fields } from "@unilab/urpc-core";
import type { UserEntity } from "./user";

export class PostEntity {
  static readonly displayName = "PostEntity";
  
  @Fields.string({
    description: "Post ID",
  })
  id = "";

  @Fields.string({
    description: "Post title",
  })
  title = "";

  @Fields.string({
    description: "Post content",
  })
  content = "";

  @Fields.string({
    description: "Author ID",
  })
  userId = "";

  @Fields.record(() => require("./user").UserEntity, {
    optional: true,
    description: "Author information",
  })
  user?: UserEntity;
} 