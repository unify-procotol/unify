import { Repo, UnifyClient } from "@unify/client";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const fetchUser = async () => {
  const data = await Repo<UserEntity>("user", "user").findMany({
    where: {
      id: "1",
      // email: "john.doe@example.com",
    },
    select: {
      posts: true,
    },
  });
  console.log("fetchUser===>", data);
};

fetchUser();

// const fetchPost = async () => {
//   const data = await Repo<PostEntity>("post", "post").findOne({
//     where: {
//       id: "2",
//     },
//     select: {
//       user: true,
//     },
//   });
//   console.log("fetchPost===>", data);
// };

// fetchPost();
