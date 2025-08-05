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

  const navList = await repo({
    entity: "navList",
    source: "pg",
  }).findMany({
    // where: {
    //   id: 1
    // },
    limit: 5,
  });

  console.log("navList=>", navList);
};

demo();
