import { UserEntity } from "./entities/user";
import { repo, URPC } from "@unilab/urpc";
import { WalletPlugin } from "@unilab/uniweb3";
import { Plugin } from "@unilab/urpc-core";
import { Logging } from "@unilab/urpc-core/middleware";
import { MemoryAdapter } from "@unilab/urpc-adapters";

const MyPlugin: Plugin = {
  entities: [UserEntity],
};

// Example 1: Using Local URPC Configuration
URPC.init({
  plugins: [MyPlugin, WalletPlugin],
  middlewares: [Logging()],
  entityConfigs: {
    user: {
      defaultSource: "memory",
    },
  },
  globalAdapters: [MemoryAdapter],
});

const demo = async () => {
  // Create some test data
  const newUser = await repo({
    entity: UserEntity,
    source: "memory",
  }).create({
    data: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
    },
  });
  console.log("Created user:", newUser);

  // Query with Entity class - return Entity instance
  const userByClass = await repo({
    entity: UserEntity,
    source: "memory",
  }).findOne({
    where: {
      id: "1",
    },
  });
  console.log("User by class:", userByClass);
  userByClass?.click(" 123 ");
  userByClass?.greet(" this is a test message ");

  // Query with string - returns JSON data
  const userByString = await repo<UserEntity>({
    entity: "user",
    source: "memory",
  }).findOne({
    where: {
      id: "1",
    },
  });
  console.log("User by string:", userByString);
};

demo();

const fetchUser = async () => {
  const data = await repo<UserEntity>({
    entity: "user",
    // source: "memory",
  }).findMany({
    where: {
      id: "1",
      // email: "john.doe@example.com",
    },
  });
  console.log("[1] =>", JSON.stringify(data, null, 2));
};

fetchUser();

// // Example 2: Using HTTP Client Configuration
// URPC.init({
//   baseUrl: "http://localhost:3000",
//   timeout: 10000,
//   headers: {
//     Authorization: "Bearer your-token",
//     "Content-Type": "application/json",
//   },
// });

// // HTTP客户端模式的使用示例
// const httpDemo = async () => {
//   // 在HTTP模式下，数据通过HTTP API获取
//   const users = await repo<UserEntity>({
//     entity: "user",
//     source: "api", // 可选，传给后端API
//   }).findMany({
//     where: {
//       name: "John",
//     },
//     limit: 10,
//   });
//   console.log("HTTP users:", users);
// };

// httpDemo();

// const allEntities = await repo({
//   entity: "schema",
//   source: "_global",
// }).findMany();
// console.log("All entities:", JSON.stringify(allEntities, null, 2));
