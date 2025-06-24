import type { PostEntity } from "./post";

export class UserEntity {
  id = "";
  name = "";
  email = "";
  avatar = "";

  posts?: PostEntity[];
}
