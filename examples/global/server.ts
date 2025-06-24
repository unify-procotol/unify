import { Unify } from "@unilab/server";
import { EntityAdapter } from "./adapters/entity";

const app = Unify.register([
  { source: "global", adapter: new EntityAdapter() },
]);

export default {
  port: 3000,
  fetch: app.fetch,
};
