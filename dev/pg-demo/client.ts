import { repo, URPC } from "@unilab/urpc";

URPC.init({
  baseUrl: "http://localhost:9000",
  timeout: 10000,
});

const demo = async () => {
  // const user = await repo({
  //   entity: "user",
  //   source: "pg",
  // }).findOne({
  //   where: {
  //     id: "7TauFwKdrOWNrErouqzalMcJaPuAkDyh",
  //   },
  // });
  // console.log("user=>", user);

  const likeCount = await repo({
    entity: "likeCount",
    source: "pg",
  }).findMany({
    limit: 2,
  });
  console.log("likeCount=>", likeCount);
};

demo();
