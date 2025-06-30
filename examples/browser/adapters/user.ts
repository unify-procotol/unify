import {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  UpsertArgs,
} from "@unilab/core";
import { UserEntity } from "../entities/user";

const userData = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://example.com/avatar.png",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: "https://example.com/avatar2.png",
  },
];

class UserAdapter implements DataSourceAdapter<UserEntity> {
  async findMany(args: FindManyArgs<UserEntity>): Promise<UserEntity[]> {
    const where = args?.where || {};
    if (where.id) {
      const idValue = typeof where.id === "object" ? where.id.$eq : where.id;
      return userData.filter((user) => user.id === idValue);
    }
    if (where.name) {
      const nameValue =
        typeof where.name === "object" ? where.name.$eq : where.name;
      return userData.filter((user) => user.name === nameValue);
    }
    if (where.email) {
      const emailValue =
        typeof where.email === "object" ? where.email.$eq : where.email;
      return userData.filter((user) => user.email === emailValue);
    }
    return userData;
  }

  async findOne(args: FindOneArgs<UserEntity>): Promise<UserEntity | null> {
    const { id } = args.where;
    if (!id) {
      return null;
    }

    return userData.find((user) => user.id === id) || null;
  }

  async create(args: CreationArgs<UserEntity>): Promise<UserEntity> {
    const { name, email, avatar } = args.data;
    if (!name || !email || !avatar) {
      throw {
        status: 400,
        message: "Invalid arguments",
      };
    }
    const newUser = {
      id: (userData.length + 1).toString(),
      name,
      email,
      avatar,
    };
    userData.push(newUser);
    return newUser;
  }

  async update(args: UpdateArgs<UserEntity>): Promise<UserEntity> {
    throw new Error("Not implemented");
  }

  async upsert(args: UpsertArgs<UserEntity>): Promise<UserEntity> {
    throw new Error("Not implemented");
  }

  async delete(args: DeletionArgs<UserEntity>): Promise<boolean> {
    return false;
  }
}

export { UserAdapter };
