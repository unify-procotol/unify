import { UserEntity } from "./entities/user";
import { clearAllEntityPools, entity } from "@unilab/unify";

function test() {
  const obj: any = {
    id: "1",
    name: "test",
    email: "test@test.com",
    avatar: "test.png",
  };

  entity(UserEntity).Get(obj).click("test2");

  console.log("name:", entity(UserEntity).Get(obj).name);

  // 回收obj时，对应的entity instances条目会被自动清理
}

test();

// 清空 entity class pool
clearAllEntityPools();
