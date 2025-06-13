import { createSource } from "unify-api";
import { SolanaPlugin, EVMPlugin } from "../../../../../packages/plugins/dist/uniweb3";
import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import type { PageConfig } from "next";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const app = new Hono().basePath("/api");

const source = createSource({
  app,
});

source.register([EVMPlugin, SolanaPlugin]);

app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export default handle(app);
