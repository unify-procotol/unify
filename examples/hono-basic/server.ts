import { repo, URPC } from "@unilab/urpc-hono";
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

app.use(cors());

URPC.init({
  app,
  plugins: [MyPlugin],
  globalAdapters: [
    {
      source: "mock",
      factory: () => new MockAdapter(),
    },
  ],
  entityConfigs: {
    _data: {
      initData: [
        {
          key: "URPC_SERVER_INFO",
          value: {
            title: "Hono Basic Example",
            desc: "Hono Basic Example, using @unilab/urpc-hono and @unilab/urpc",
            logo: "https://example.com/logo.png",
          },
        },
      ],
    },
    user: {
      defaultSource: "mock",
      initData: [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          avatar: "https://example.com/avatar.png",
        },
      ],
    },
    post: {
      defaultSource: "mock",
      initData: [
        {
          id: "1",
          title: "Post 1",
          content: "Content 1",
          userId: "1",
        },
      ],
    },
  },
});

const server = {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${server.port}`);

export default server;
