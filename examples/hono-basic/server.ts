import { Unify } from "@unify/server";
import { EntityRegistry } from "@unify/core";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";

// 注册实体以确保装饰器被执行
EntityRegistry.register(UserEntity, PostEntity);

const app = Unify.register([
  { source: "user", adapter: new UserAdapter() },
  { source: "post", adapter: new PostAdapter() },
]);

export default {
  port: 3000,
  fetch: app.fetch,
};
