import { Relations } from "@unify/core";
import type { UserEntity } from "./user";

export class PostEntity {
  id = "";
  title = "";
  content = "";
  userId = "";

  @Relations.toOne(() => require("./user").UserEntity, "userId")
  user?: UserEntity;
}
