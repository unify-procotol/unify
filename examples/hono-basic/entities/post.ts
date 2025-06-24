import type { UserEntity } from "./user";

export class PostEntity {
  id = "";
  title = "";
  content = "";
  userId = "";

  user?: UserEntity;
}
