import { createSource } from "unify-api";
import { BasicUsageSourceConfig } from "./config";

const source = createSource();

source.register(BasicUsageSourceConfig);

const app = source.getApp();

console.log(
  app.routes.map((route) => `- ${route.method} ${route.path}`).join("\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};
