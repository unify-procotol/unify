import { Fields } from "@unilab/urpc-core";
import type { UserEntity } from "./user";
import type { PostEntity } from "./post";

export class CommentEntity {
  static displayName = "CommentEntity";
  
  @Fields.string({
    description: "Comment ID",
  })
  id = "";

  @Fields.string({
    description: "Comment content",
  })
  content = "";

  @Fields.string({
    description: "Post ID this comment belongs to",
  })
  postId = "";

  @Fields.string({
    description: "User ID who wrote this comment",
  })
  userId = "";

  @Fields.string({
    description: "User name",
  })
  userName = "";

  @Fields.string({
    description: "User email",
  })
  userEmail = "";

  @Fields.string({
    description: "Creation timestamp",
  })
  createdAt = "";

  @Fields.record(() => require("./user").UserEntity, {
    optional: true,
    description: "Author information",
  })
  user?: UserEntity;

  @Fields.record(() => require("./post").PostEntity, {
    optional: true,
    description: "Post information",
  })
  post?: PostEntity;
} 