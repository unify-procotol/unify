import { repo, UnifyClient } from "@unify/client";
import { Entity } from "./entities/entity";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const fetchEntities = async () => {
  const data = await repo<Entity>("entity", "global").findMany();
  console.log("fetchEntities===>", JSON.stringify(data, null, 2));
};

fetchEntities();
