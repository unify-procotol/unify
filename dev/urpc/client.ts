import { repo, URPC } from "@unilab/urpc";
import { UserEntity } from "./entities/user";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demo = async () => {
  await repo<UserEntity>({
    entity: "UserEntity",
    source: "api-mock",
  }).upsertMany({
    data: [
      {
        id: "1",
        name: "test2",
      },
      {
        id: "2",
        name: "Jane",
        email: "jane@example.com",
        avatar: "https://example.com/avatar.png",
      },
    ],
    onConflictDoUpdate: {
      target: "id",
    },
  });

  const res = await repo<UserEntity>({
    entity: "UserEntity",
    source: "api-mock",
  }).findMany();

  console.log("res=>", res);

  repo({
    entity: "LED",
    source: "iot",
  }).upsertMany({
    data: [
      {
        location: "Living Room",
        brightness: 20,
      },
      {
        location: "Bedroom",
        brightness: 50,
      },
    ],
    onConflictDoUpdate: {
      target: "location",
    },
  });
};

demo();
