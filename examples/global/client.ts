import { repo, UnifyClient } from "@unify/client";
import { Entity } from "./entities/entity";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

export * from "./entities/user";
export * from "./entities/post";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demo = async () => {
  const { defaultMetadataStorage } = require("class-transformer/cjs/storage");
  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: defaultMetadataStorage,
  });

  await repo<Entity>("entity", "global").create({
    data: {
      name: "demo",
      schemas: schemas,
    },
  });

  const data = await repo<Entity>("entity", "global").findMany();
  console.log("length===>", data.length);
  console.log("fetchEntities===>", JSON.stringify(data, null, 2));
};

demo();
