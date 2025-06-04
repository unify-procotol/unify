import { createSource } from "unify-server";
import blogConfig from "./blog-config.ts";

// 创建源配置，使用表配置和内置CRUD方法
const source = createSource(blogConfig);

// 启动服务器
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

export default {
  port: 3000,
  fetch: app.fetch,
};
