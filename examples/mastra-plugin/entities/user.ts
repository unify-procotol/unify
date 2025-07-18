import { Fields } from "@unilab/urpc-core";
import { PostEntity } from "./post";

export class UserEntity {
  static displayName = "UserEntity";
  
  @Fields.string({
    description: "User ID",
  })
  id = "";

  @Fields.string({
    description: "Username",
  })
  name = "";

  @Fields.string({
    description: "Email",
  })
  email = "";

  @Fields.string({
    description: "Avatar",
  })
  avatar = "";

  @Fields.array(() => PostEntity, {
    optional: true,
    description: "user's post list",
  })
  posts?: PostEntity[];
} 