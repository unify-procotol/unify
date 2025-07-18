import { URPC } from "@unilab/urpc-hono";
import { UserEntity } from "./entities/user";
import { Plugin } from "@unilab/urpc-core";
import { UserAdapter } from "./adapters/user";
import { MastraPlugin } from "@unilab/mastra-plugin/hono";
import { MockAdapter } from "@unilab/urpc-adapters";
import { Hono } from "hono";
import { cors } from "hono/cors";

const MyPlugin: Plugin = {
  entities: [UserEntity],
  adapters: [
    {
      entity: "UserEntity",
      source: "call-stream-test",
      adapter: new UserAdapter(),
    },
  ],
};
const app = new Hono()
app.use(cors())
console.log(process.env.OPENROUTER_API_KEY)
URPC.init({
  app,
  plugins: [
    MyPlugin,
    MastraPlugin({
      defaultModel: "openai/gpt-4o-mini",
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      debug: true,
    }),
  ],
  entityConfigs: {
    user: {
      defaultSource: "mock",
    },
  },
  globalAdapters: [MockAdapter],
});

// insert user
URPC.repo({
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

const server = {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${server.port}`);

export default server;
