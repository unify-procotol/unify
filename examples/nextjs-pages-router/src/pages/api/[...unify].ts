import { Unify } from "@unify/server";
import { SolanaAdapter, EVMAdapter } from "@unify/uniweb3";
import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import type { PageConfig } from "next";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const app = new Hono().basePath("/api");

Unify.init({ app });
Unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() },
]);

app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export default handle(app);
