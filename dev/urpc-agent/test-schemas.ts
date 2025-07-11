import { generateSchemas } from "@unilab/urpc-core";
import { UserEntity } from "./src/entities/user";
import { PostEntity } from "./src/entities/post";

const schemas = generateSchemas([UserEntity, PostEntity]);
console.log("Generated schemas:");
console.log(JSON.stringify(schemas, null, 2));
