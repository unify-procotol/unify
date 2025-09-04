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

  // const likeCount = await repo({
  //   entity: "LikeCountView",
  //   source: "pg",
  // }).findMany({
  //   // limit: 2,
  //   where: {
  //     targetId: {
  //       // startsWith: "c3fuit827",
  //       // endsWith: "c3fuit827",
  //       // contains: "c3fuit827",
  //       // mode: "insensitive",
  //       not: null,
  //     },
  //   },
  // });
  // console.log("likeCount=>", likeCount);

  // const tables = await repo({
  //   entity: "_system",
  //   source: "pg",
  // }).tables({});
  // console.log("tables=>", tables);

  // const data = await repo({
  //   entity: "_system",
  //   source: "pg",
  // }).query({
  //   queryText: "SELECT symbol, info FROM tokens WHERE info->>'name' ILIKE $1",
  //   values: ["%iotex%"],
  // });
  // console.log("data=>", data);

  // const tokens = await repo({
  //   entity: "tokens",
  //   source: "pg",
  // }).findMany({
  //   where: {
  //     OR: [
  //       {
  //         symbol: {
  //           contains: "IOTX",
  //           mode: "insensitive",
  //         },
  //       },
  //       {
  //         coingecko_id: {
  //           contains: "IOTX",
  //           mode: "insensitive",
  //         },
  //       },
  //       {
  //         info: {
  //           path: ["name"],
  //           contains: "IOTX",
  //           mode: "insensitive",
  //         },
  //       },
  //     ],
  //   },
  //   limit: 1,
  // });

  // const tokens = await repo({
  //   entity: "tokens",
  //   source: "pg",
  // }).findMany({
  //   // where: {
  //   //   info: {
  //   //     path: ["price_change_percentage_24h"],
  //   //     gt: 0,
  //   //   },
  //   // },
  //   // order_by: {
  //   //   info: {
  //   //     path: ["price_change_percentage_24h"],
  //   //     sortOrder: "desc",
  //   //   },
  //   // },
  //   where: {
  //     info: {
  //       path: ["links", "twitter_screen_name"],
  //       eq: "iotex_io",
  //     },
  //   },
  //   limit: 1,
  // });

  // console.log("tokens=>", tokens);

  const result = await URPC.repo({
    entity: "metrics.projectView",
    source: "pg",
  }).findMany({
    limit: 2,
  });
  console.log("result=>", result);
};

demo();
