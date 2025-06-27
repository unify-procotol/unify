// 实现一个entity(UserEntity)接口, entity(UserEntity)返回一个UserEntity对象，可以访问UserEntity的属性; entity(UserEntity)不要每次都返回新的对象，而是返回同一个对象，最大程度复用对象，最多创建5个实例，要有垃圾回收机制
// 下面是最终效果的伪代码

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
