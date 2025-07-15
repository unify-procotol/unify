import { URPC } from "@unilab/urpc-hono";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { Plugin } from "@unilab/urpc-core";
import { MockAdapter } from "@unilab/urpc-adapters";
import { Hono } from "hono";
import { cors } from "hono/cors";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
};

const app = new Hono();

app.use(cors())

URPC.init({
  plugins: [MyPlugin],
  app,
  entityConfigs: {
    user: {
      defaultSource: "mock",
    },
    post: {
      defaultSource: "mock",
    },
  },
  globalAdapters: [MockAdapter],
});

// Use repo on the server side
// init data
await URPC.repo<UserEntity>({
  entity: "UserEntity",
  source: "mock",
}).create({
  data: {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://example.com/avatar.png",
  },
});
await URPC.repo<PostEntity>({
  entity: "PostEntity",
  source: "mock",
}).create({
  data: {
    id: "1",
    title: "Post 1",
    content: "Content 1",
    userId: "1",
  },
});

const server = {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${server.port}`);

export default server;
