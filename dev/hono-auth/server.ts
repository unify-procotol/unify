import { repo, URPC } from "@unilab/urpc-hono";
export { Allow } from "@unilab/urpc-core";
import { Allow, AuthUser, Plugin } from "@unilab/urpc-core";
import { GhostAdapter } from "./adapters/ghost";
import { auth, cache, logging } from "@unilab/urpc-core/middleware";
import { PostEntity } from "./entities/post";
import { UserEntity } from "./entities/user";
import { UserAdapter } from "./adapters/user";
import { Context } from "hono";
import { decodeToken } from "./jwt";
import { bentocache } from "./bentocache";

const GhostPlugin: Plugin = {
  entities: [PostEntity, UserEntity],
  adapters: [
    { source: "ghost", entity: "PostEntity", adapter: new GhostAdapter() },
    { source: "ghost", entity: "UserEntity", adapter: new UserAdapter() },
  ],
};

const app = URPC.init({
  plugins: [GhostPlugin],
  middlewares: [
    auth({
      getUser: async (c: Context) => {
        try {
          const token = c.req.header("Authorization")?.split(" ")[1];
          if (!token) {
            return null;
          }
          const user = decodeToken(token);
          console.log("getUser=>", user);
          return user;
        } catch (error) {
          return null;
        }
      },
    }),
    cache({
      bentocache,
    }),
    logging(),
  ],
  entityConfigs: {
    user: {
      defaultSource: "ghost",
    },
    org: {
      defaultSource: "ghost",
    },
    post: {
      defaultSource: "ghost",
      // allowApiCrud: Allow.authenticated, // Only authenticated users can perform CRUD operations
      // allowApiCrud: Allow.everyone, // Allows all CRUD operations
      // allowApiCrud: true, // Allows all CRUD operations
      // allowApiCrud: "admin", // Only users with the 'admin' role can update
      // allowApiDelete: ["admin", "manager"], // Only users with 'admin' or 'manager' roles can delete,
      // allowApiCrud: (user: AuthUser | null) => user?.name == "Jane", // Only the user 'Jane' can read
      allowApiRead: (user, entityData) => {
        // console.log("entityData=>", entityData);
        // console.log("user=>", user);
        if (Array.isArray(entityData)) {
          return true;
        }
        return entityData?.authorId == user?.id;
      }, // Users can only update posts they own

      // allowApiCreate
      // allowApiUpdate
      // allowApiDelete

      cache: {
        findMany: {
          ttl: "30s",
        },
        findOne: {
          ttl: "30s",
        },
        // custom methods
        // call: {
        //   ttl: "1m",
        //   grace: "6h",
        // },

        call: true
      },
    },
  },
});

export default {
  port: 9000,
  timeout: 30000,
  fetch: app.fetch,
};
