import { UserEntity } from "./entities/user";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { logging } from "@unilab/urpc-core/middleware";
import { MockAdapter } from "@unilab/urpc-adapters";

const MyPlugin: Plugin = {
  entities: [UserEntity],
};

URPC.init({
  plugins: [MyPlugin],
  middlewares: [logging()],
  entityConfigs: {
    user: {
      defaultSource: "mock",
    },
  },
  globalAdapters: [MockAdapter],
});

async function demo() {
  await repo<UserEntity>({
    entity: "user",
    // source: "mock",
  }).create({
    data: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://example.com/avatar.png",
    },
  });

  await repo<UserEntity>({
    entity: "user",
    // source: "mock",
  }).create({
    data: {
      id: "2",
      name: "Jane Doe",
      email: "jane.doe@example.com",
      avatar: "https://example.com/avatar.png",
    },
  });

  const user = await repo({
    entity: "user",
    // source: "mock",
  }).findMany();

  console.log("[0] =>", user);
}

demo();
