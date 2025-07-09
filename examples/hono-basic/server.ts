import { URPC } from "@unilab/urpc-hono";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { createHookMiddleware } from "@unilab/urpc-core/middleware";
import { Plugin } from "@unilab/urpc-core";
import { MockAdapter } from "@unilab/urpc-adapters";

const HookMiddleware = createHookMiddleware((hookManager) => {
  hookManager
    .beforeCreate(async (context) => {
      console.log("🚀 Builder: Before Create Hook", "context: ", context);
    })
    .afterCreate(async (context) => {
      console.log("✨ Builder: After Create Hook", "context: ", context);
    })
    .beforeUpdate(async (context) => {
      console.log("🔄 Builder: Before Update Hook", "context: ", context);
    })
    .afterUpdate(async (context) => {
      console.log("✅ Builder: After Update Hook", "context: ", context);
    })
    .beforeDelete(async (context) => {
      console.log("🗑️ Builder: Before Delete Hook", "context: ", context);
    })
    .afterDelete(async (context) => {
      console.log("💀 Builder: After Delete Hook", "context: ", context);
    });
});

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
};

const app = URPC.init({
  plugins: [MyPlugin],
  // middlewares: [HookMiddleware],
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

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};
