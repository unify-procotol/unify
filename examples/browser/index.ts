import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { joinRepo, repo, URPC } from "@unilab/urpc";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";
import { WalletPlugin } from "@unilab/uniweb3";
import { Plugin } from "@unilab/urpc-core";
import { createHookMiddleware, Logging } from "@unilab/urpc-core/middleware";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
  adapters: [
    {
      source: "demo",
      entity: "UserEntity",
      adapter: new UserAdapter(),
    },
    {
      source: "demo",
      entity: "PostEntity",
      adapter: new PostAdapter(),
    },
  ],
};

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
    .beforeAny(async (args, _, context) => {
      console.log(
        "🔄 Builder: Before Any Hook",
        "args: ",
        args,
        "context: ",
        context
      );
    })
    .afterAny(async (args, result, context) => {
      console.log(
        "✅ Builder: After Any Hook",
        "result: ",
        result,
        "context: ",
        context
      );
    });
});

URPC.init({
  enableDebug: true,
  plugins: [MyPlugin, WalletPlugin],
  // middleware: [HookMiddleware, Logging()],
});

const fetchUser = async () => {
  const data = await repo<UserEntity>({
    entity: "user",
    source: "demo",
  }).findMany({
    // where: {
    //   id: "1",
    //   // email: "john.doe@example.com",
    // },
    include: {
      posts: (userList) => {
        const ids = userList.map((user) => user.id);
        return joinRepo<PostEntity, UserEntity>({
          entity: "post",
          source: "demo",
          localField: "id",
          foreignField: "userId",
        }).findMany({
          where: {
            userId: {
              $in: ids,
            },
          },
        });
      },
    },
  });
  console.log("[1] =>", JSON.stringify(data, null, 2));
};

fetchUser();

// const fetchPost = async () => {
//   const data = await repo<PostEntity>({
//     entity: "post",
//     source: "demo",
//   }).findOne({
//     where: {
//       id: "2",
//     },
//     include: {
//       user: (post) => {
//         const userId = post.userId;
//         return repo<UserEntity>({
//           entity: "user",
//           source: "demo",
//         }).findOne({
//           where: {
//             id: userId,
//           },
//         });
//       },
//     },
//   });
//   console.log("[2] =>", JSON.stringify(data, null, 2));
// };

// fetchPost();

// const fetchEvmBalance = async () => {
//   const data = await repo<WalletEntity>({
//     entity: "wallet",
//     source: "evm",
//   }).findOne({
//     where: {
//       address: "0x...",
//       network: "ethereum",
//     },
//   });
//   console.log("[3] =>", JSON.stringify(data, null, 2));
// };

// fetchEvmBalance();

const allEntities = await repo({
  entity: "schema",
  source: "_global",
}).findMany();
console.log("All entities:", JSON.stringify(allEntities, null, 2));
