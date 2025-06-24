import { Unify } from "@unilab/server";
import { EntityAdapter } from "./adapters/entity";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";

const app = Unify.init({
  entities: [UserEntity, PostEntity],
  adapters: [{ source: "_global", adapter: new EntityAdapter() }],
});

export default {
  port: 3000,
  fetch: app.fetch,
};
