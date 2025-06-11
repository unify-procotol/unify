import { createSource } from "unify-api";
import blogConfig from "./config.ts";

// 模拟的认证中间件
const requireAuth = async (c: any, next: () => Promise<void>) => {
  const token = c.req.header("Authorization");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // 在实际应用中，这里会验证 token
  await next();
};

const source = createSource({
  storageOptions: {
    type: "pg",
    config: {
      connectionString: process.env.DATABASE_URL!,
    },
  },
});

// 创建源配置，使用表配置和内置CRUD方法
source.register({
  ...blogConfig,
  // 可选：添加中间件
  middleware: [requireAuth],
});

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

source.register({
  id: "test-api",
  entities: {
    user: {
      findMany: async (args) => {
        const { where, select } = args || {};
        let result: any[] = [];
        if (where) {
          // result = users.filter((u) => u.id === where.id);
          result = users.filter((record) =>
            Object.entries(where).every(([key, value]) => record[key] === value)
          );
        } else {
          result = users;
        }
        if (select) {
          result = result.map((u) => select.map((field) => u[field]));
        }
        return result;
      },
      findOne: async (args) => {
        const { where, select } = args || {};
        let result: any = {};
        if (where) {
          result = users.find((record) =>
            Object.entries(where).every(([key, value]) => record[key] === value)
          );
        } else {
          result = users[0];
        }
        if (select) {
          result = select.map((field) => result[field]);
        }
        return result;
      },
      create: async (args) => {
        const { data } = args || {};
        const newUser = {
          id: users.length + 1,
          name: data?.name as string,
        };
        users.push(newUser);
        return newUser;
      },
    },
  },
});

const app = source.getApp();

console.log("🚀 Blog API Server is starting on port 3000...");
console.log(
  app.routes.map((route) => `- ${route.method} ${route.path}`).join("\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};
