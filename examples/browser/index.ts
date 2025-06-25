import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { joinRepo, repo, UnifyClient } from "@unilab/client";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";

UnifyClient.init({
  enableDebug: false,
  adapters: [
    {
      source: "user",
      adapter: new UserAdapter(),
    },
    {
      source: "post",
      adapter: new PostAdapter(),
    },
  ],
});

const fetchUser = async () => {
  const data = await repo<UserEntity>("user", "user").findMany({
    // where: {
    //   id: "1",
    //   // email: "john.doe@example.com",
    // },
    include: {
      posts: (userList) => {
        const ids = userList.map((user) => user.id);
        return joinRepo<PostEntity, UserEntity>("post", "post", {
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
  console.log("fetchUser===>", JSON.stringify(data, null, 2));
};

fetchUser();

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
