import { UserEntity } from "./entities/user";
import { entity } from "@unilab/unify";

function test() {
  const obj = {
    id: "1",
    name: "test",
    email: "test@test.com",
    avatar: "test.png",
  };

  entity(UserEntity, obj).click("update name by click");

  console.log("name:", entity(UserEntity, obj).name);

  // 回收obj时，对应的entity instances条目会被自动清理
}

test();
