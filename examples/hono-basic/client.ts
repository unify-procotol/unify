import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { repo, UnifyClient, joinRepo } from "@unilab/unify-client";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

// const fetchUser = async () => {
//   const data = await repo<UserEntity>("user", "user").findMany({
//     where: {
//       id: "2",
//       // email: "john.doe@example.com",
//     },
//     include: {
//       posts: (userList) => {
//         const ids = userList.map((user) => user.id);
//         // return repo<PostEntity>("post", "post").findMany({
//         //   where: {
//         //     userId: {
//         //       $in: ids,
//         //     },
//         //   },
//         // });

//         // 没有设置where参数，则必须使用joinRepo，其他情况可以直接使用repo
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
//       id: "1",
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


const createUser = async () => {
  const data = await repo<UserEntity>("user", "user").create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://example.com/avatar.jpg",
    },
  });
  console.log("createUser===>", JSON.stringify(data, null, 2));
};

createUser();