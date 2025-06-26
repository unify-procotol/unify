import { Unify } from "@unilab/unify-hono";
import { WalletPlugin } from "@unilab/uniweb3";
import { Hono, Context } from "hono";

export const runtime = "nodejs";

// 创建自定义的 Hono app 实例
const app = new Hono().basePath("/api");

// 添加自定义中间件或路由
app.get("/custom", (c: Context) => {
  return c.json({ message: "This is a custom route!" });
});

Unify.init({
  app,
  plugins: [WalletPlugin],
});

app.get("/hello", (c: Context) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export const GET = app.fetch;
export const POST = app.fetch;
