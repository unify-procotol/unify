import { BaseAdapter, FindManyArgs, FindOneArgs } from "@unilab/urpc-core";
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

class PostAdapter extends BaseAdapter<PostEntity> {
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
        if (userIdQuery.$eq) {
          const result = postData.filter(
            (post) => post.userId === userIdQuery.$eq
          );
          return result;
        }
        if (userIdQuery.$in) {
          const result = postData.filter((post) =>
            userIdQuery.$in.includes(post.userId)
          );
          return result;
        }
        // 其他操作符可以继续添加
      } else {
        // 直接值比较
        const result = postData.filter((post) => post.userId === where.userId);
        return result;
      }
    }

    return postData;
  }

  async findOne(args: FindOneArgs<PostEntity>): Promise<PostEntity | null> {
    const where = args.where;
    const { id, userId } = where;

    if (id) {
      return postData.find((post) => post.id === id) || null;
    }

    if (userId) {
      return postData.find((post) => post.userId === userId) || null;
    }

    return postData[0] || null;
  }
}

export { PostAdapter };
