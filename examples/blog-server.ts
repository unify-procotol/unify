import { createSource } from "unify-api";
import blogConfig from "./blog-config.ts";

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

source.register({
  id: "test-api",
  entities: {
    user: {
      findMany: async () => {
        return [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ];
      },
      findOne: async (args: any) => {
        const userId = args?.id;
        const user = [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ].find((u) => u.id.toString() === userId);
        if (!user) {
          throw { status: 404, message: "User not found" };
        }
        return user;
      },
      create: async (args: any) => {
        return { id: 1, name: "Alice" };
      },
    },
  },
});

const app = source.getApp();

console.log("🚀 Blog API Server is starting on port 3000...");
console.log("Available endpoints:");
console.log(
  app.routes.map((route) => `- ${route.method} ${route.path}`).join("\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};
