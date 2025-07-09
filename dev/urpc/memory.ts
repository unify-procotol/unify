import { UserEntity } from "./entities/user";
import { repo, URPC } from "@unilab/urpc";
import { WalletPlugin } from "@unilab/uniweb3";
import { Plugin } from "@unilab/urpc-core";
import { Logging } from "@unilab/urpc-core/middleware";
import { MemoryAdapter } from "@unilab/urpc-adapters";

const MyPlugin: Plugin = {
  entities: [UserEntity],
};

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

// const fetchEvmBalance = async () => {
//   const data = await repo<WalletEntity>({
//     entity: "wallet",
//     source: "evm",
//   }).findOne({
//     where: {
//       address: "0x...",
//       network: "ethereum",
//     },
//   });
//   console.log("[3] =>", JSON.stringify(data, null, 2));
// };

// fetchEvmBalance();

// const allEntities = await repo({
//   entity: "schema",
//   source: "_global",
// }).findMany();
// console.log("All entities:", JSON.stringify(allEntities, null, 2));
