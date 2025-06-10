import { createSource } from "unify-api";
import { os } from "@orpc/server";
import { z } from "zod";

const source = createSource();

source.register({
  id: "orpc-demo",
  entities: {
    user: {
      findOne: os
        .input(
          z.object({
            id: z.coerce.number().int().min(1),
            name: z.string(),
          })
        )
        .handler(({ input }) => {
          return {
            id: input.id,
            name: input.name,
          };
        }),
    },
  },
});

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