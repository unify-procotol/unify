import { URPC } from "@unilab/urpc-hono";
import { UserEntity } from "../hono-basic/entities/user";
import { PostEntity } from "../hono-basic/entities/post";
import { UserAdapter } from "../hono-basic/adapters/user";
import { PostAdapter } from "../hono-basic/adapters/post";
import { Plugin } from "@unilab/urpc-core";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
  adapters: [
    { source: "demo", entity: "UserEntity", adapter: new UserAdapter() },
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
