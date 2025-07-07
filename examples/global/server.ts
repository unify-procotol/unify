import { URPC } from "@unilab/urpc-hono";
import { SchemaAdapter } from "./adapters/schema";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { UserAdapter } from "../hono-basic/adapters/user";
import { PostAdapter } from "../hono-basic/adapters/post";
import { Plugin } from "@unilab/urpc-core";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
  adapters: [
    { source: "_global", entity: "SchemaEntity", adapter: new SchemaAdapter() },
    { source: "google", entity: "UserEntity", adapter: new UserAdapter() },
    { source: "github", entity: "UserEntity", adapter: new UserAdapter() },
    { source: "demo", entity: "PostEntity", adapter: new PostAdapter() },
  ],
};

const app = URPC.init({
  plugins: [MyPlugin],
});

export default {
  port: 3000,
  fetch: app.fetch,
};
