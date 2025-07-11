import { Fields } from "@unilab/urpc-core";
import { PostEntity } from "./post";

export class UserEntity {
  @Fields.string({
    description: "用户ID",
  })
  id = "";

  @Fields.string({
    description: "用户名",
  })
  name = "";

  @Fields.string({
    description: "邮箱",
  })
  email = "";

  @Fields.string({
    description: "头像",
  })
  avatar = "";

  @Fields.array(() => PostEntity, {
    optional: true,
    description: "文章列表",
  })
  posts?: PostEntity[];
} 