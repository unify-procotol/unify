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
  middlewares: [logging()],
  globalAdapters: [
    {
      source: "mock",
      // factory: (entityClassName) => {
      //   // init data
      //   const data =
      //     entityClassName === "UserEntity"
      //       ? [
      //           {
      //             id: "1",
      //             name: "John Doe",
      //             email: "john.doe@example.com",
      //             avatar: "https://example.com/avatar.png",
      //           },
      //           {
      //             id: "2",
      //             name: "Jane Doe",
      //             email: "jane.doe@example.com",
      //             avatar: "https://example.com/avatar.png",
      //           },
      //         ]
      //       : [];
      //   return new MockAdapter({
      //     delay: 500,
      //     data,
      //   });
      // },
      factory: () =>
        new MockAdapter({
          delay: 500,
        }),
    },
    {
      source: "memory",
      factory: () => new MemoryAdapter(),
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
        {
          id: "2",
          name: "Jane Doe",
          email: "jane.doe@example.com",
          avatar: "https://example.com/avatar.png",
        },
      ],
    },
  },
});

async function demo() {
  // init data
  // await repo<UserEntity>({
  //   entity: "user",
  //   // source: "mock",
  // }).createMany({
  //   data: [
  //     {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john.doe@example.com",
  //       avatar: "https://example.com/avatar.png",
  //     },
  //     {
  //       id: "2",
  //       name: "Jane Doe",
  //       email: "jane.doe@example.com",
  //       avatar: "https://example.com/avatar.png",
  //     },
  //   ],
  // });

  const user = await repo({
    entity: "user",
  }).findMany();

  console.log("[0] =>", user);

  // const allEntities = await repo({
  //   entity: "_schema",
  // }).findMany();
  // console.log("All entities:", JSON.stringify(allEntities, null, 2));
}

demo();
