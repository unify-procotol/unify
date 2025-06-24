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
  },
];

class PostAdapter implements DataSourceAdapter<PostEntity> {
  async findMany(args?: FindManyArgs<PostEntity>): Promise<PostEntity[]> {
    const where = args?.where || {};
    console.log(
      "PostAdapter.findMany called with where:",
      JSON.stringify(where, null, 2)
    );

    // 如果有 id 条件，按 id 过滤
    if (where.id) {
      const idValue = typeof where.id === "object" ? where.id.$eq : where.id;
      return postData.filter((post) => post.id === idValue);
    }

    // 如果有 userId 条件，按 userId 过滤
    if (where.userId) {
      if (typeof where.userId === "object") {
        // 处理操作符
        const userIdQuery = where.userId as any;
        console.log("Processing userId query:", userIdQuery);
        if (userIdQuery.$eq) {
          const result = postData.filter(
            (post) => post.userId === userIdQuery.$eq
          );
          console.log("$eq result:", result);
          return result;
        }
        if (userIdQuery.$in) {
          const result = postData.filter((post) =>
            userIdQuery.$in.includes(post.userId)
          );
          console.log("$in result:", result);
          return result;
        }
        // 其他操作符可以继续添加
      } else {
        // 直接值比较
        const result = postData.filter((post) => post.userId === where.userId);
        console.log("Direct userId comparison result:", result);
        return result;
      }
    }

    console.log("No specific conditions, returning all posts:", postData);
    return postData;
  }

  async findOne(args: FindOneArgs<PostEntity>): Promise<PostEntity | null> {
    const where = args.where;

    // 如果有 id 条件，按 id 查找
    if (where.id) {
      const idValue = typeof where.id === "object" ? where.id.$eq : where.id;
      return postData.find((post) => post.id === idValue) || null;
    }

    // // 如果有 userId 条件，按 userId 查找第一个匹配的文章
    if (where.userId) {
      const userIdValue =
        typeof where.userId === "object" ? where.userId.$eq : where.userId;
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
