import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { repo, UnifyClient, joinRepo } from "@unilab/unify-client";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const fetchUser = async () => {
  const data = await repo<UserEntity>({
    entityName: "user",
    source: "demo",
  }).findMany({
    where: {
      id: "2",
      // email: "john.doe@example.com",
    },
    include: {
      posts: (userList) => {
        const ids = userList.map((user) => user.id);
        // return repo<PostEntity>({
        //   entityName: "post",
        //   source: "demo",
        // }).findMany({
        //   where: {
        //     userId: {
        //       $in: ids,
        //     },
        //   },
        // });

        // If you don't set the where parameter, you must use joinRepo, but in other cases you can use repo directly.
        return joinRepo<PostEntity, UserEntity>({
          entityName: "post",
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
//     entityName: "post",
//     source: "demo",
//   }).findOne({
//     where: {
//       id: "1",
//     },
//     include: {
//       user: (post) => {
//         const userId = post.userId;
//         return repo<UserEntity>({
//           entityName: "user",
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

// const createUser = async () => {
//   const data = await repo<UserEntity>({
//     entityName: "user",
//     source: "demo",
//   }).create({
//     data: {
//       name: "John Doe",
//       email: "john.doe@example.com",
//       avatar: "https://example.com/avatar.jpg",
//     },
//   });
//   console.log("[3] =>", JSON.stringify(data, null, 2));
// };

// createUser();
