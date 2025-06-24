import { repo, UnifyClient } from "@unify/client";
import { Entity } from "./entities/entity";
import { WalletEntity } from "@unify/uniweb3/entities";
import { classToAST } from "./utils/ast-converter";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demo = async () => {
  await repo<Entity>("entity", "global").create({
    data: {
      name: "WalletEntity",
      ast: classToAST(WalletEntity),
    },
  });

  const data = await repo<Entity>("entity", "global").findMany();
  console.log("length===>", data.length);
  console.log("fetchEntities===>", JSON.stringify(data, null, 2));
};

demo();
