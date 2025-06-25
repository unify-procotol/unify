import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { joinRepo, repo, UnifyClient } from "@unilab/client";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";

import { SolanaAdapter, EVMAdapter } from "@unilab/uniweb3";
import { WalletEntity } from "@unilab/uniweb3/entities";

UnifyClient.init({
  enableDebug: true,
  adapters: [
    {
      source: "user",
      adapter: new UserAdapter(),
    },
    {
      source: "post",
      adapter: new PostAdapter(),
    },

    { source: "solana", adapter: new SolanaAdapter() },
    { source: "evm", adapter: new EVMAdapter() },
  ],
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
