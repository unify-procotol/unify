import { repo, URPC } from "@unilab/urpc";

URPC.init({
  baseUrl: "http://localhost:9000",
  timeout: 10000,
});

const demo = async () => {
  const user = await repo({
    entity: "user",
    source: "pg",
  }).findOne({
    where: {
      id: "7TauFwKdrOWNrErouqzalMcJaPuAkDyh",
    },
  });
  console.log("user=>", user);

  // const likeCount = await repo({
  //   entity: "LikeCountView",
  //   source: "pg",
  // }).findMany({
  //   // limit: 2,
  //   where: {
  //     targetId: {
  //       // $startsWith: "c3fuit827",
  //       // $endsWith: "c3fuit827",
  //       // $contains: "c3fuit827",
  //       // $mode: "insensitive",
  //       $not: null,
  //     },
  //   },
  // });
  // console.log("likeCount=>", likeCount);

  // const tables = await repo({
  //   entity: "_tables",
  //   source: "pg",
  // }).tables({});
  // console.log("tables=>", tables);
};

demo();
