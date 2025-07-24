import { URPC } from "@unilab/urpc-next/app-router";
import { Allow, AuthUser, Plugin } from "@unilab/urpc-core";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { GhostAdapter } from "./adapters/ghost";
import { UserAdapter } from "./adapters/user";
import { auth } from "@unilab/urpc-core/middleware";
import { auth as betterAuth } from "./auth";
import { headers } from "next/headers";

const GhostPlugin: Plugin = {
  entities: [PostEntity, UserEntity],
  adapters: [
    { source: "ghost", entity: "PostEntity", adapter: new GhostAdapter() },
    { source: "ghost", entity: "UserEntity", adapter: new UserAdapter() },
  ],
};

export const api = URPC.init({
  plugins: [GhostPlugin],
  middlewares: [
    auth({
      getUser: async (request: any) => {
        try {
          const session = await betterAuth.api.getSession({
            headers: await headers(),
          });
          console.log("session=>", session);
          const user = session
            ? {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                roles: [session.user.role || ""],
                activeOrganizationId: session.session.activeOrganizationId,
              }
            : null;
          return user;
        } catch (error) {
          return null;
        }
      },
    }),
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
      // allowApiCrud: (user: AuthUser | null) => {
      //   console.log("user=>", user);
      //   return user?.name == "osdodo";
      // }, // Only the user 'Jane' can read
      // allowApiUpdate: (user, entityData) => {
      //   console.log("entityData=>", entityData);
      //   console.log("user=>", user);
      //   if (Array.isArray(entityData)) {
      //     return true;
      //   }
      //   return entityData?.authorId == user?.id;
      // }, // Users can only update posts they own
      
      allowApiCrud: (user, entityData) => {
        console.log("entityData=>", entityData);
        console.log("user=>", user);
        if (Array.isArray(entityData)) {
          return true;
        }
        return entityData?.orgId == user?.activeOrganizationId;
      },

      // allowApiCreate
      // allowApiUpdate
      // allowApiDelete
    },
  },
});
