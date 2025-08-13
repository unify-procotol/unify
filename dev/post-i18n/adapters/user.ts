import { BaseAdapter, FindManyArgs, FindOneArgs } from "@unilab/urpc-core";
import { UserEntity } from "../entities/user";

const mockData = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://example.com/avatar.png",
  },
];

export class UserAdapter extends BaseAdapter<UserEntity> {
  async findMany(args: FindManyArgs<UserEntity>): Promise<UserEntity[]> {
    const _id = args.where?.id;
    const id = typeof _id === "string" ? _id : _id?.eq;
    if (id) {
      return mockData.filter((user) => user.id === id);
    }

    const ids = typeof _id === "string" ? undefined : _id?.in;
    if (ids) {
      return mockData.filter((user) => ids.includes(user.id));
    }

    return mockData;
  }

  async findOne(args: FindOneArgs<UserEntity>): Promise<UserEntity | null> {
    const id = args.where?.id;
    if (id) {
      return mockData.find((user) => user.id === id) || null;
    }
    return null;
  }
}
