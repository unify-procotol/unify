import { Unify } from "@unilab/unify-hono";
import { SchemaAdapter } from "./adapters/schema";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { UserAdapter } from "../hono-basic/adapters/user";
import { PostAdapter } from "../hono-basic/adapters/post";
import { Plugin } from "@unilab/core";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
  adapters: [
    { source: "_global", entityName: "SchemaEntity", adapter: new SchemaAdapter() },
    { source: "google", entityName: "UserEntity", adapter: new UserAdapter() },
    { source: "github", entityName: "UserEntity", adapter: new UserAdapter() },
    { source: "demo", entityName: "PostEntity", adapter: new PostAdapter() },
  ],
};

const app = Unify.init({
  plugins: [MyPlugin],
});

export default {
  port: 3000,
  fetch: app.fetch,
};
