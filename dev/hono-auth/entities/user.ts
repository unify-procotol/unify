import { Fields } from "@unilab/urpc-core";

export class UserEntity {
  @Fields.string({
    description: "The id of the user",
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

  @Fields.array(() => String, {
    description: "The roles of the user",
  })
  roles: string[] = [];
}
