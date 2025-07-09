import { URPC } from "@unilab/urpc-hono";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { createHookMiddleware } from "@unilab/urpc-core/middleware";
import { Plugin } from "@unilab/urpc-core";

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
  adapters: [
    { source: "demo", entity: "UserEntity", adapter: new UserAdapter() },
    { source: "demo", entity: "PostEntity", adapter: new PostAdapter() },
  ],
};

const app = URPC.init({
  plugins: [MyPlugin],
  middlewares: [HookMiddleware],
  entityConfigs: {
    user: {
      defaultSource: "demo",
    },
    post: {
      defaultSource: "demo",
    },
  },
});

// // Use repo on the server side
// const user = await URPC.repo<UserEntity>({
//   entity: "UserEntity",
//   source: "demo",
// }).findOne({
//   where: {
//     id: "2",
//   },
// });

// console.log("user =>", user);

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};
