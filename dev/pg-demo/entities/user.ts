import { Fields } from "@unilab/urpc-core";
  
export class UserEntity {
  static displayName = "UserEntity";

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
    description: "The image of the user",
    optional: true,
  })
  image = "";
  
  @Fields.string({
    description: "The role of the user",
    optional: true,
  })
  role = "";
  
}