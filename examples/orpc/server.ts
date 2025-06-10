import { createSource } from "unify-api";
import { sourceConfig } from "./config";

const source = createSource();

source.register(sourceConfig);

const app = source.getApp();

console.log("All routes:");
console.log(
  app.routes.map((route) => `- ${route.method} ${route.path}`).join("\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};

// curl -X GET 'http://localhost:3000/user/123?source_id=orpc-demo&name=张三'
