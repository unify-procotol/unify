import { UserEntity } from "./entities/user";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { logging } from "@unilab/urpc-core/middleware";
import { MemoryAdapter } from "@unilab/urpc-adapters";

const MyPlugin: Plugin = {
  entities: [UserEntity],
};

// Using Hybrid URPC Configuration (both local and HTTP fallback)
URPC.init({
  plugins: [MyPlugin],
  // middlewares: [logging()],
  entityConfigs: {
    user: {
      defaultSource: "memory",
    },
  },
  globalAdapters: [
    {
      source: "memory",
      factory: () => new MemoryAdapter(),
    },
  ],

  baseUrl: "http://localhost:3000",
  timeout: 10000,
  headers: {
    Authorization: "Bearer your-token",
    "Content-Type": "application/json",
  },
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
  userByClass?.click();
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

// HTTP client mode usage example
const httpDemo = async () => {
  // In HTTP mode, data is obtained through HTTP API
  const users = await repo<UserEntity>({
    entity: "user",
    source: "api-mock", // Optional, passed to backend API
  }).findMany({
    where: {
      id: "1",
    },
    limit: 10,
  });
  console.log("HTTP users:", users);
};

httpDemo();

// const allEntities = await repo({
//   entity: "_schema",
// }).findMany();
// console.log("All entities:", JSON.stringify(allEntities, null, 2));
