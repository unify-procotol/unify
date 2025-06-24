import { Unify } from "@unilab/server";
import { UserAdapter } from "./adapters/user";
import { PostAdapter } from "./adapters/post";

const app = Unify.register([
  { source: "user", adapter: new UserAdapter() },
  { source: "post", adapter: new PostAdapter() },
]);

export default {
  port: 3000,
  fetch: app.fetch,
};
