import { Unify } from "@unilab/server";
import { EntityAdapter } from "./adapters/entity";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { UserAdapter } from "../hono-basic/adapters/user";
import { PostAdapter } from "../hono-basic/adapters/post";

// Entity-source mapping will be automatically analyzed from adapters configuration

const app = Unify.init({
  entities: [UserEntity, PostEntity],
  adapters: [
    //问题：是不是要改成这样？多个entity怎么弄
    // {
    //   entity: UserEntity,
    //   source:[
    //     {
    //       name:"google",
    //       adapter:new UserAdapter()
    //     }
    //   ]
    // }
    { source: "_global", adapter: new EntityAdapter() },
    { source: "google", adapter: new UserAdapter() },
    { source: "github", adapter: new UserAdapter() },
    { source: "post", adapter: new PostAdapter() },
  ],
});

export default {
  port: 3000,
  fetch: app.fetch,
};
