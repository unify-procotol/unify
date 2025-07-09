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
    .beforeCreate(async (context) => {
      console.log(
        "🚀 Builder: Before Create Hook",
        "context: ",
        context
      );
    })
    .afterCreate(async (context) => {
      console.log(
        "✨ Builder: After Create Hook",
        "context: ",
        context
      );
    })
    .beforeUpdate(async (context) => {
      console.log(
        "🔄 Builder: Before Update Hook",
        "context: ",
        context
      );
    })
    .afterUpdate(async (context) => {
      console.log(
        "✅ Builder: After Update Hook",
        "context: ",
        context
      );
    })
    .beforeDelete(async (context) => {
      console.log(
        "🗑️ Builder: Before Delete Hook",
        "context: ",
        context
      );
    })
    .afterDelete(async (context) => {
      console.log(
        "💀 Builder: After Delete Hook",
        "context: ",
        context
      );
    })
    .beforeAny(async (context) => {
      console.log(
        "🔄 Builder: Before Any Hook",
        "context: ",
        context
      );
    })
    .afterAny(async (context) => {
      console.log(
        "✅ Builder: After Any Hook",
        "context: ",
        context
      );
    });
});

URPC.init({
  enableDebug: true,
  plugins: [MyPlugin, WalletPlugin],
  middlewares: [HookMiddleware, Logging()],
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
