import { Unify } from "@unilab/unify-hono";
import { WalletPlugin } from "@unilab/uniweb3";
import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import type { PageConfig } from "next";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const app = new Hono().basePath("/api");

Unify.init({
  app,
  plugins: [WalletPlugin],
});

app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export default handle(app);
