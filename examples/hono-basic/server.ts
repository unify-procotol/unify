import { URPC } from "@unilab/urpc-hono";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { createHookMiddleware, Logging } from "@unilab/urpc-core/middleware";
import { Plugin } from "@unilab/urpc-core";

const HookMiddleware = createHookMiddleware((hookManager) => {
  hookManager
    .beforeCreate(async (args, _, context) => {
      console.log(
        "🚀 Builder: Before Create Hook",
        "args: ",
        args,
        "context: ",
        context
      );
    })
    .afterCreate(async (args, result, context) => {
      console.log(
        "✨ Builder: After Create Hook",
        "result: ",
        result,
        "context: ",
        context
      );
    })
    .beforeUpdate(async (args, _, context) => {
      console.log(
        "🔄 Builder: Before Update Hook",
        "args: ",
        args,
        "context: ",
        context
      );
    })
    .afterUpdate(async (args, result, context) => {
      console.log(
        "✅ Builder: After Update Hook",
        "result: ",
        result,
        "context: ",
        context
      );
    })
    .beforeDelete(async (args, _, context) => {
      console.log(
        "🗑️ Builder: Before Delete Hook",
        "args: ",
        args,
        "context: ",
        context
      );
    })
    .afterDelete(async (args, result, context) => {
      console.log(
        "💀 Builder: After Delete Hook",
        "result: ",
        result,
        "context: ",
        context
      );
    });
  // .beforeAny(async (args, _, context) => {
  //   console.log(
  //     "🔄 Builder: Before Any Hook",
  //     "args: ",
  //     args,
  //     "context: ",
  //     context
  //   );
  // })
  // .afterAny(async (args, result, context) => {
  //   console.log(
  //     "✅ Builder: After Any Hook",
  //     "result: ",
  //     result,
  //     "context: ",
  //     context
  //   );
  // });
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
  // middleware: [HookMiddleware, Logging()],
});

// // Use repo on the server side
// const userRepo = URPC.repo<UserEntity>({
//   entity: "UserEntity",
//   source: "demo",
//   adapter: new UserAdapter(),
// });

// const user = await userRepo.findOne({
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
