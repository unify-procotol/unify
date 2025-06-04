import { createSource, QueryArgs } from "unify-server";

// 模拟的认证中间件
const requireAuth = async (c: any, next: () => Promise<void>) => {
  const token = c.req.header("Authorization");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // 在实际应用中，这里会验证 token
  await next();
};

// 模拟数据库
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

const posts = [
  { id: 1, title: "Hello World", content: "First post", userId: 1 },
  { id: 2, title: "Second Post", content: "Another post", userId: 2 },
];

// 创建源配置
const source = createSource({
  id: "github",
  entities: {
    user: {
      // GET /github/user
      findMany: async (args?: QueryArgs) => {
        let result = [...users];

        if (args?.limit) {
          result = result.slice(0, args.limit);
        }

        if (args?.select) {
          result = result.map((user) => {
            const selected: any = {};
            args.select!.forEach((field) => {
              if (user.hasOwnProperty(field)) {
                selected[field] = (user as any)[field];
              }
            });
            return selected;
          });
        }

        return result;
      },

      // GET /github/user/:id
      findOne: async (args?: QueryArgs) => {
        const userId = parseInt(args?.id as string);
        const user = users.find((u) => u.id === userId);

        if (!user) {
          throw { status: 404, message: "User not found" };
        }

        if (args?.select) {
          const selected: any = {};
          args.select.forEach((field) => {
            if (user.hasOwnProperty(field)) {
              selected[field] = (user as any)[field];
            }
          });
          return selected;
        }

        return user;
      },

      // POST /github/user
      create: async (args?: QueryArgs) => {
        const newUser = {
          id: users.length + 1,
          name: args?.name as string,
          email: args?.email as string,
        };
        users.push(newUser);
        return newUser;
      },
    },

    post: {
      // GET /github/post
      findMany: async (args?: QueryArgs) => {
        let result = [...posts];

        if (args?.limit) {
          result = result.slice(0, args.limit);
        }

        if (args?.where) {
          result = result.filter((post) => {
            return Object.entries(args.where!).every(([key, value]) => {
              return (post as any)[key] === value;
            });
          });
        }

        if (args?.order_by) {
          const [field, direction] = Object.entries(args.order_by)[0];
          result.sort((a, b) => {
            const aVal = (a as any)[field];
            const bVal = (b as any)[field];
            if (direction === "desc") {
              return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          });
        }

        return result;
      },

      // GET /github/post/:id
      findOne: async (args?: QueryArgs) => {
        const postId = parseInt(args?.id as string);
        const post = posts.find((p) => p.id === postId);

        if (!post) {
          throw { status: 404, message: "Post not found" };
        }

        return post;
      },
    },
  },

  // 可选：添加中间件
  middleware: [requireAuth],
});

// 启动服务器
const app = source.getApp();

// 内置路由已自动添加：
// GET / - 返回API服务器信息和路由列表
// GET /api-doc - 返回OpenAPI文档

console.log("🚀 Server is starting on port 3000...");

export default {
  port: 3000,
  fetch: app.fetch,
};
