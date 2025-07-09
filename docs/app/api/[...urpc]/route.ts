// Next.js configuration for static compatibility
export const dynamic = 'force-static';
export const revalidate = false;

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Define the static API routes that need to be pre-generated
  return [
    { urpc: ['schema', 'find_one'] },
    { urpc: ['schema', 'find_many'] },
    { urpc: ['user', 'find_one'] },
    { urpc: ['user', 'find_many'] },
    { urpc: ['user', 'create'] },
    { urpc: ['user', 'update'] },
    { urpc: ['user', 'delete'] },
    { urpc: ['post', 'find_one'] },
    { urpc: ['post', 'find_many'] },
    { urpc: ['post', 'create'] },
    { urpc: ['post', 'update'] },
    { urpc: ['post', 'delete'] },
  ];
}

import { Logging } from "@unilab/urpc-core/middleware";
import { URPC } from "@unilab/urpc-next/app-router";

import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "@/lib/entities/user";
import { PostEntity } from "@/lib/entities/post";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
};

const api = URPC.init({
  plugins: [MyPlugin],
  middlewares: [Logging()],
  entityConfigs: {
    user: {
      defaultSource: "mock",
    },
    post: {
      defaultSource: "mock",
    },
  },
});

export const { GET, POST, PATCH, DELETE } = api;
