import { repo, URPC } from "@unilab/urpc";
import {
  _DataEntity,
  _SchemaEntity,
} from "@unilab/urpc-core/builtin-plugin-entities";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demo = async () => {
  // Test findMany - should return all entities with their adapters
  console.log("=== Testing findMany ===");
  const allEntities = await repo<_SchemaEntity>({
    entity: "_schema",
  }).findMany();
  console.log("All entities:", JSON.stringify(allEntities, null, 2));

  // Test findOne - should return specific entity with adapters
  console.log("\n=== Testing findOne ===");
  const singleEntity = await repo<_SchemaEntity>({
    entity: "_schema",
  }).findOne({
    where: {
      name: "UserEntity",
    },
  });
  console.log("Single entity:", JSON.stringify(singleEntity, null, 2));

  const _data = await repo<_DataEntity>({
    entity: "_data",
  }).findMany();
  console.log("_data:", JSON.stringify(_data, null, 2));
};

demo();
