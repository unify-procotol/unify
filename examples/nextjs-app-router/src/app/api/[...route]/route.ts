import { createSource } from "@unify/server";
import { SolanaPlugin, EVMPlugin } from "@unify/uniweb3";
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
