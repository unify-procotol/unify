import { Fields } from "@unilab/urpc-core";

export class UserEntity {
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
  })
  click() {
    console.log("click=>", this.name);
  }

  @Fields.action({
    name: "greet",
    description: "Greet the user",
    params: {
      message: {
        type: "string",
        description: "Greeting message",
      },
    },
    returns: {
      type: "string",
      description: "Response message",
    },
  })
  greet(message: string) {
    console.log("greet=>", `Hello ${this.name}! ${message}`);
  }
}
