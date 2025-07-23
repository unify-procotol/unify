import { Fields } from "@unilab/urpc-core";
import type { UserEntity } from "./user";
import type { PostEntity } from "./post";

export class LikeEntity {
  static displayName = "LikeEntity";
  
  @Fields.string({
    description: "Like ID",
  })
  id = "";

  @Fields.string({
    description: "Post ID that was liked",
  })
  postId = "";

  @Fields.string({
    description: "User ID who liked",
  })
  userId = "";

  @Fields.string({
    description: "User name",
  })
  userName = "";

  @Fields.string({
    description: "Creation timestamp",
  })
  createdAt = "";

  @Fields.record(() => require("./user").UserEntity, {
    optional: true,
    description: "User information",
  })
  user?: UserEntity;

  @Fields.record(() => require("./post").PostEntity, {
    optional: true,
    description: "Post information",
  })
  post?: PostEntity;
} 