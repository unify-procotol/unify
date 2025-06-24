import { repo, UnifyClient } from "@unilab/httply";
import { Entity } from "./entities/entity";
import { generateSchemas } from "@unilab/core";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demo = async () => {
  // Generate schemas from entity classes
  const schemas = generateSchemas([UserEntity, PostEntity]);

  console.log("UserEntity schema:", JSON.stringify(schemas.UserEntity, null, 2));
  console.log("PostEntity schema:", JSON.stringify(schemas.PostEntity, null, 2));
};

demo();
