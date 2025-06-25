import { Fields } from "@unilab/core";
import { PostEntity } from "./post";

export class UserEntity {
  @Fields.string()
  id = "";

  @Fields.string()
  name = "";

  @Fields.string()
  email = "";

  @Fields.string()
  avatar = "";

  @Fields.array(() => PostEntity, {
    optional: true,
  })
  posts?: PostEntity[];
}
