import { createSource } from "unify-api";
import { SolanaPlugin, EVMPlugin } from "../../../../../../packages/plugins/dist/uniweb3";
import { Hono } from "hono";

export const runtime = "nodejs";

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

export const GET = app.fetch;
export const POST = app.fetch;
