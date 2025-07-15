import { Fields } from "@unilab/urpc-core";
import { PostEntity } from "./post";

export class UserEntity {
  @Fields.string({
    description: "The ID of the user",
  })
  id = "";

  @Fields.string({
    description: "The name of the user",
  })
  name = "";

  @Fields.string({
    description: "The email of the user",
  })
  email = "";

  @Fields.string({
    description: "The avatar of the user",
  })
  avatar = "";

  @Fields.array(() => PostEntity, {
    optional: true,
    description: "The posts of the user",
  })
  posts?: PostEntity[];
}
