import { repo, URPC } from "@unilab/urpc";
import { SchemaEntity } from "@unilab/builtin-plugin/entities";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demo = async () => {
  // Test findMany - should return all entities with their adapters
  console.log("=== Testing findMany ===");
  const allEntities = await repo<SchemaEntity>({
    entity: "schema",
    source: "_global",
  }).findMany();
  console.log("All entities:", JSON.stringify(allEntities, null, 2));
  
  // Test findOne - should return specific entity with adapters
  console.log("\n=== Testing findOne ===");
  const singleEntity = await repo<SchemaEntity>({
    entity: "schema",
    source: "_global",
  }).findOne({
    where: {
      name: "UserEntity",
    },
  });
  console.log("Single entity:", JSON.stringify(singleEntity, null, 2));
};

demo();
