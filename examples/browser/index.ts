import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { joinRepo, repo, Unify } from "@unilab/unify";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";
import { WalletPlugin } from "@unilab/uniweb3";
import { WalletEntity } from "@unilab/uniweb3/entities";
import { Plugin } from "@unilab/core";
import { createHookMiddleware, Logging } from "@unilab/core/middleware";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
  adapters: [
    {
      source: "wordpress",
      entityName: "UserEntity",
      adapter: new UserAdapter(),
    },
    {
      source: "wordpress",
      entityName: "PostEntity",
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

Unify.init({
  enableDebug: true,
  plugins: [MyPlugin, WalletPlugin],
  // middleware: [HookMiddleware, Logging()],
});

const fetchUser = async () => {
  const data = await repo<UserEntity>({
    entityName: "user",
    source: "wordpress",
  }).findMany({
    // where: {
    //   id: "1",
    //   // email: "john.doe@example.com",
    // },
    include: {
      posts: (userList) => {
        const ids = userList.map((user) => user.id);
        return joinRepo<PostEntity, UserEntity>({
          entityName: "post",
          source: "wordpress",
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
//     entityName: "post",
//     source: "wordpress",
//   }).findOne({
//     where: {
//       id: "2",
//     },
//     include: {
//       user: (post) => {
//         const userId = post.userId;
//         return repo<UserEntity>({
//           entityName: "user",
//           source: "wordpress",
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
//     entityName: "wallet",
//     source: "evm",
//   }).findOne({
//     where: {
//       address: "0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB",
//       network: "iotex",
//     },
//   });
//   console.log("[3] =>", JSON.stringify(data, null, 2));
// };

// fetchEvmBalance();
