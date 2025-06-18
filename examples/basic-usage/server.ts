import { createSource } from "@unify/server";
import { BasicUsageSourceConfig } from "./config";
import { FileStorage, PGStorage } from "@unify/storage";

const source = createSource({
  options: {
    // storage: new FileStorage("./data"),
    storage: new PGStorage({
      connectionString: process.env.DATABASE_URL!,
    }),
  },
});

source.register(BasicUsageSourceConfig);

const app = source.getApp();

console.log(
  app.routes.map((route) => `- ${route.method} ${route.path}`).join("\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};
