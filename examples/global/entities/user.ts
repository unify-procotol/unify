import { Fields, Relations } from "@unilab/core";
import { PostEntity } from "./post";

export class UserEntity {
  @Fields.string()
  id = "";

  @Fields.string()
  name = "";

  @Fields.number()
  age = 0;

  @Fields.string()
  email = "";

  @Fields.string({ optional: true })
  avatar = "";

  @Relations.toMany(() => PostEntity, {
    optional: true,
  })
  posts?: PostEntity[];
}
