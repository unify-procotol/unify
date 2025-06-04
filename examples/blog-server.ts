import { createSource } from "unify-server";
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

const source = createSource();

// 创建源配置，使用表配置和内置CRUD方法
source.register({
  ...blogConfig,
  // 可选：添加中间件
  middleware: [requireAuth],
});

source.register({
  id: "github",
  entities: {
    user: {
      findMany: async () => {
        return [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ];
      },
      findOne: async (args: any) => {
        const userId = parseInt(args?.id as string);
        const user = [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ].find((u) => u.id === userId);
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
console.log("- GET /blog/user (list users)");
console.log("- GET /blog/user/:id (get user by id)");
console.log("- POST /blog/user (create user)");
console.log("- PUT /blog/user/:id (update user)");
console.log("- DELETE /blog/user/:id (delete user)");
console.log("- GET /blog/post (list published posts)");
console.log("- GET /blog/post/:id (get post by id)");
console.log("- POST /blog/post (create post)");
console.log("- PUT /blog/post/:id (update post)");
console.log("- DELETE /blog/post/:id (delete post)");
console.log("- GET /blog/comment (list comments)");
console.log("- POST /blog/comment (create comment)");
console.log("- ... (other comment endpoints)");

console.log("- GET /github/user (list users)");
console.log("- GET /github/user/:id (get user by id)");
console.log("- POST /github/user (create user)");

export default {
  port: 3000,
  fetch: app.fetch,
};
