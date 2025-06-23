import { Unify } from "@unify/server";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";
// 导入实体类以确保装饰器被注册
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";

// 创建实体实例以触发装饰器注册
new UserEntity();
new PostEntity();

const app = Unify.register([
  { source: "user", adapter: new UserAdapter() },
  { source: "post", adapter: new PostAdapter() },
]);

export default {
  port: 3000,
  fetch: app.fetch,
};
