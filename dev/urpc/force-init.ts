import { UserEntity } from "./entities/user";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { logging } from "@unilab/urpc-core/middleware";
import { MemoryAdapter, MockAdapter } from "@unilab/urpc-adapters";

const MyPlugin: Plugin = {
  entities: [UserEntity],
};

URPC.init({
  plugins: [MyPlugin],
  globalAdapters: [
    {
      source: "memory",
      factory: () => new MemoryAdapter(),
    },
  ],
  entityConfigs: {
    user: {
      defaultSource: "memory",
      initData: [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          avatar: "https://example.com/avatar.png",
        },
        {
          id: "2",
          name: "Jane Doe",
          email: "jane.doe@example.com",
          avatar: "https://example.com/avatar.png",
        },
      ],
    },
  },
  middlewares: [logging()],
});

URPC.init({
  forceInit: true,
  plugins: [MyPlugin],
  globalAdapters: [
    {
      source: "mock",
      factory: () => new MockAdapter(),
    },
  ],
  entityConfigs: {
    user: {
      defaultSource: "mock",
      initData: [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          avatar: "https://example.com/avatar.png",
        },
      ],
    },
  },
});

async function demo() {
  try {
    const user = await repo({
      entity: "user",
      source: "memory",
    }).findMany();

    console.log("[0] =>", user);
  } catch (error: any) {
    console.log("[0] error =>", error.message);
  }

  try {
    const user2 = await repo({
      entity: "user",
      source: "mock",
    }).findMany();

    console.log("[1] =>", user2);
  } catch (error: any) {
    console.log("[1] error =>", error.message);
  }
}

demo();
