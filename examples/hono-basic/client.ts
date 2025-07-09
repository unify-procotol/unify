import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { repo, URPC, joinRepo } from "@unilab/urpc-client";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

// const fetchUser = async () => {
//   const data = await repo<UserEntity>({
//     entity: "user",
//     source: "demo",
//   }).findMany({
//     where: {
//       id: "2",
//       // email: "john.doe@example.com",
//     },
//     include: {
//       posts: (userList) => {
//         const ids = userList.map((user) => user.id);
//         // return repo<PostEntity>({
//         //   entity: "post",
//         //   source: "demo",
//         // }).findMany({
//         //   where: {
//         //     userId: {
//         //       $in: ids,
//         //     },
//         //   },
//         // });

//         // If you don't set the where parameter, you must use joinRepo, but in other cases you can use repo directly.
//         return joinRepo<PostEntity, UserEntity>({
//           entity: "post",
//           source: "demo",
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
//   console.log("[1] =>", JSON.stringify(data, null, 2));
// };

// fetchUser();

// const fetchPost = async () => {
//   const data = await repo<PostEntity>({
//     entity: "post",
//     source: "demo",
//   }).findOne({
//     where: {
//       id: "1",
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

const createUser = async () => {
  const data = await repo<UserEntity>({
    entity: "user",
    source: "demo",
  }).create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://example.com/avatar.jpg",
    },
  });
  console.log("[3] =>", JSON.stringify(data, null, 2));
};

createUser();
