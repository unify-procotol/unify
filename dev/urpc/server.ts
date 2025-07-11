import { URPC } from "@unilab/urpc-hono";
import { UserEntity } from "./entities/user";
import { Plugin } from "@unilab/urpc-core";
import { MockAdapter } from "@unilab/urpc-adapters";

const MyPlugin: Plugin = {
  entities: [UserEntity],
  adapters: [
    {
      source: "api-mock",
      entity: "UserEntity",
      adapter: new MockAdapter(),
    },
  ],
};

const app = URPC.init({
  plugins: [MyPlugin],
  entityConfigs: {
    user: {
      defaultSource: "api-mock",
    },
  },
});

// Use repo on the server side
// init data
await URPC.repo<UserEntity>({
  entity: "UserEntity",
  source: "api-mock",
}).create({
  data: {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://example.com/avatar.png",
  },
});

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};
