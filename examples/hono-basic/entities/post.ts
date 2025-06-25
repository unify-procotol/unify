import { Fields } from "@unilab/core";
import type { UserEntity } from "./user";

export class PostEntity {
  @Fields.string()
  id = "";

  @Fields.string()
  title = "";

  @Fields.string()
  content = "";

  @Fields.string()
  userId = "";

  @Fields.record(() => require("./user").UserEntity, {
    optional: true,
  })
  user?: UserEntity;
}
