import { URPC } from "@unilab/urpc-hono";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "../../examples/hono-basic/entities/user";
import { PostEntity } from "../../examples/hono-basic/entities/post";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
};

const app = URPC.init({
  plugins: [MyPlugin],
});

export default {
  port: 3000,
  fetch: app.fetch,
};
