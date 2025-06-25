import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { joinRepo, repo, UnifyClient } from "@unilab/client";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";
import { WalletPlugin } from "@unilab/uniweb3";
import { WalletEntity } from "@unilab/uniweb3/entities";
import { Plugin } from "@unilab/core";
import { Logging } from "@unilab/core/middleware";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
  adapters: [
    { source: "user", entityName: "UserEntity", adapter: new UserAdapter() },
    { source: "post", entityName: "PostEntity", adapter: new PostAdapter() },
  ],
};

UnifyClient.init({
  enableDebug: true,
  plugins: [MyPlugin, WalletPlugin],
  middleware: [Logging()],
});

// const fetchUser = async () => {
//   const data = await repo<UserEntity>("user", "user").findMany({
//     // where: {
//     //   id: "1",
//     //   // email: "john.doe@example.com",
//     // },
//     include: {
//       posts: (userList) => {
//         const ids = userList.map((user) => user.id);
//         return joinRepo<PostEntity, UserEntity>("post", "post", {
//           localField: "id",
//           foreignField: "userId",
//         }).findMany({
//           where: {
//             userId: {
//               $in: ids,
//             },
//           },
//         });
//       },
//     },
//   });
//   console.log("fetchUser===>", JSON.stringify(data, null, 2));
// };

// fetchUser();

// const fetchPost = async () => {
//   const data = await repo<PostEntity>("post", "post").findOne({
//     where: {
//       id: "2",
//     },
//     include: {
//       user: (post) => {
//         const userId = post.userId;
//         return repo<UserEntity>("user", "user").findOne({
//           where: {
//             id: userId,
//           },
//         });
//       },
//     },
//   });
//   console.log("fetchPost===>", JSON.stringify(data, null, 2));
// };

// fetchPost();

const fetchEvmBalance = async () => {
  const data = await repo<WalletEntity>("wallet", "evm").findOne({
    where: {
      address: "0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB",
      network: "iotex",
    },
  });
  console.log("fetchEvmBalance===>", JSON.stringify(data, null, 2));
};

fetchEvmBalance();
