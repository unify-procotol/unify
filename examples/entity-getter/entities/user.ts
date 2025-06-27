import { Fields } from "@unilab/core";

export class UserEntity {
  constructor(args: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  }) {
    Object.assign(this, args);
  }

  @Fields.string()
  id = "";

  @Fields.string()
  name = "";

  @Fields.string()
  email = "";

  @Fields.string()
  avatar = "";

  @Fields.action({
    name: "click",
    description: "click",
    params: {
      name: {
        type: "string",
        description: "name",
      },
    },
    returns: {
      type: "string",
      description: "name",
    },
  })
  click(name: string) {
    this.name = name;
    console.log("click=>", this.name);
  }
}
