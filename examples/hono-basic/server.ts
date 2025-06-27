import { Unify } from "@unilab/unify-hono";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { createHookMiddleware, Logging } from "@unilab/core/middleware";
import { Plugin } from "@unilab/core";

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
    })
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
    { source: "wordpress", entityName: "UserEntity", adapter: new UserAdapter() },
    { source: "wordpress", entityName: "PostEntity", adapter: new PostAdapter() },
  ],
};

const app = Unify.init({
  plugins: [MyPlugin],
  middleware: [HookMiddleware, Logging()],
});

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};
