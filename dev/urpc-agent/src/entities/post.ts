import { Fields } from "@unilab/urpc-core";
import type { UserEntity } from "./user";

export class PostEntity {
  @Fields.string({
    description: "文章ID",
  })
  id = "";

  @Fields.string({
    description: "文章标题",
  })
  title = "";

  @Fields.string({
    description: "文章内容",
  })
  content = "";

  @Fields.string({
    description: "作者ID",
  })
  userId = "";

  @Fields.record(() => require("./user").UserEntity, {
    optional: true,
    description: "作者信息",
  })
  user?: UserEntity;
} 