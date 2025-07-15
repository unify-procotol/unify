import { Logging } from "@unilab/urpc-core/middleware";
import { URPC, URPCAPI } from "@unilab/urpc-next/app-router";
import { MastraPlugin } from "@unilab/mastra-plugin/next-app-router";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "@/entities/user";
import { PostEntity } from "@/entities/post";
import { MockAdapter } from "@unilab/urpc-adapters";

let api: URPCAPI;
export function getAPI() {
  if (!api) {
    const DataPlugin: Plugin = {
      entities: [UserEntity, PostEntity],
    };

    api = URPC.init({
      plugins: [
        DataPlugin,
        MastraPlugin({
          model: "openai/gpt-4o-mini",
          openrouterApiKey: process.env.OPENROUTER_API_KEY,
          debug: true,
        }),
      ],
      // middlewares: [Logging()],
      entityConfigs: {
        user: {
          defaultSource: "mock",
        },
        post: {
          defaultSource: "mock",
        },
      },
      globalAdapters: [MockAdapter],
    });

    // Initialize data
    URPC.repo({
      entity: "user",
      source: "mock",
    }).create({
      data: {
        id: "1",
        name: "John",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      },
    });
    URPC.repo({
      entity: "post",
      source: "mock",
    }).create({
      data: {
        id: "1",
        title: "Welcome to URPC Agent",
        content:
          "This is the first sample article, demonstrating the basic functionality of URPC Agent.",
        userId: "1",
      },
    });
  }
  return api;
}
