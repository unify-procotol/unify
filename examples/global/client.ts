import { repo, UnifyClient } from "@unilab/httply";
import { Entity } from "./entities/entity";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demo = async () => {
  // const res = await repo<Entity>("entity", "_global").findOne({
  //   where: {
  //     name: "PostEntity",
  //   },
  // });
  const res = await repo<Entity>("entity", "_global").findMany();
  console.log("res=>", res);
};

demo();
