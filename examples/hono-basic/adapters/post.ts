import {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "@unify/core";
import { PostEntity } from "../entities/post";

const postData = [
  {
    id: "1",
    title: "Post 1",
    content: "Content 1",
    userId: "1",
  },
  {
    id: "2",
    title: "Post 2",
    content: "Content 2",
    userId: "2",
  },
  {
    id: "3",
    title: "Post 3",
    content: "Content 3",
    userId: "1",
  },
  {
    id: "4",
    title: "Post 4",
    content: "Content 4",
    userId: "2",
  }
];

class PostAdapter implements DataSourceAdapter<PostEntity> {
  async findMany(args?: FindManyArgs<PostEntity>): Promise<PostEntity[]> {
    const where = args?.where || {};
    
    // 如果有 id 条件，按 id 过滤
    if (where.id) {
      const idValue = typeof where.id === 'object' ? where.id.$eq : where.id;
      return postData.filter((post) => post.id === idValue);
    }
    
    // 如果有 userId 条件，按 userId 过滤
    if (where.userId) {
      const userIdValue = typeof where.userId === 'object' ? where.userId.$eq : where.userId;
      return postData.filter((post) => post.userId === userIdValue);
    }
    
    return postData;
  }

  async findOne(args: FindOneArgs<PostEntity>): Promise<PostEntity | null> {
    const where = args.where;
    
    // 如果有 id 条件，按 id 查找
    if (where.id) {
      const idValue = typeof where.id === 'object' ? where.id.$eq : where.id;
      return postData.find((post) => post.id === idValue) || null;
    }
    
    // // 如果有 userId 条件，按 userId 查找第一个匹配的文章
    if (where.userId) {
      const userIdValue = typeof where.userId === 'object' ? where.userId.$eq : where.userId;
      return postData.find((post) => post.userId === userIdValue) || null;
    }
    
    // 如果没有特定条件，返回第一个文章
    return postData[0] || null;
  }

  async create(args: CreationArgs<PostEntity>): Promise<PostEntity> {
    return {
      id: "",
      title: "",
      content: "",
      userId: "",
    };
  }

  async update(args: UpdateArgs<PostEntity>): Promise<PostEntity> {
    return {
      id: "",
      title: "",
      content: "",
      userId: "",
    };
  }

  async delete(args: DeletionArgs<PostEntity>): Promise<boolean> {
    return false;
  }
}

export { PostAdapter };
