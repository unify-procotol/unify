import { URPC } from "@unilab/urpc-hono";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { MockAdapter } from "@unilab/urpc-adapters";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
};

const app = URPC.init({
  plugins: [MyPlugin],
  globalAdapters: [MockAdapter],
});

export default {
  port: 3000,
  fetch: app.fetch,
};
