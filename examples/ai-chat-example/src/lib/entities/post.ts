import { Fields } from "@unilab/urpc-core";
import type { UserEntity } from "./user";
import { CommentEntity } from "./comment";

export class PostEntity {
  static displayName = "PostEntity";
  
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

  @Fields.number({
    description: "Number of likes",
  })
  likes: number = 0;

  @Fields.string({
    description: "Creation timestamp",
    optional: true,
  })
  createdAt?: string;

  @Fields.record(() => require("./user").UserEntity, {
    optional: true,
    description: "Author information",
  })
  user?: UserEntity;

  @Fields.array(() => require("./comment").CommentEntity, {
    optional: true,
    description: "Post comments",
  })
  comments?: CommentEntity[];
} 