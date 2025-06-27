import { UserEntity } from "./entities/user";
import { entity } from "@unilab/unify";

function test() {
  const obj = {
    id: "1",
    name: "test",
    email: "test@test.com",
    avatar: "test.png",
  };

  entity(UserEntity).Get(obj).click("test2");

  console.log("name:", entity(UserEntity).Get(obj).name);
}

test();
