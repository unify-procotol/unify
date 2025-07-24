import { Fields } from "@unilab/urpc-core";
import { UserEntity } from "./user";

export class PostEntity {
  @Fields.string({
    description: "The slug of the post",
  })
  slug = "";

  @Fields.string({
    description: "The title of the post",
  })
  title = "";

  @Fields.string({
    description: "The content of the post",
  })
  content = "";

  @Fields.string({
    description: "The author id of the post",
  })
  authorId = "";

  @Fields.record(() => UserEntity, {
    optional: true,
    description: "The author of the post",
  })
  author?: UserEntity;

  @Fields.string({
    description: "The organization id of the post",
  })
  orgId = "";
}
