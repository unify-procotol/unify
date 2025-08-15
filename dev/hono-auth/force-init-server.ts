import { Hono } from "hono";
import { URPC } from "@unilab/urpc-hono";
import { Plugin } from "@unilab/urpc-core";
import { PostEntity } from "./entities/post";
import { UserEntity } from "./entities/user";
import { GhostAdapter } from "./adapters/ghost";
import { UserAdapter } from "./adapters/user";

const app = new Hono();

const P1: Plugin = {
  entities: [UserEntity],
  adapters: [
    { source: "ghost", entity: "UserEntity", adapter: new UserAdapter() },
  ],
};
URPC.init({
  app,
  plugins: [P1],
});

const P2: Plugin = {
  entities: [PostEntity],
  adapters: [
    { source: "ghost", entity: "PostEntity", adapter: new GhostAdapter() },
  ],
};
URPC.init({
  app,
  forceInit: true,
  plugins: [P2],
});

export default {
  port: 9000,
  timeout: 30000,
  fetch: app.fetch,
};
