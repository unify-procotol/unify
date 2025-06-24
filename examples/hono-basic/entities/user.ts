import { Relations } from "@unify/core";
import { PostEntity } from "./post";

export class UserEntity {
  id = "";
  name = "";
  email = "";
  avatar = "";

  @Relations.toMany(() => PostEntity, {
    fields: {
      id: "userId", // UserEntity.id 对应 PostEntity.userId
    },
  })
  posts?: PostEntity[];
}
