import { URPC, URPCAPI } from "@unilab/urpc-next/app-router";
import { MastraPlugin } from "@unilab/mastra-plugin";
import { URPCSimpleAgent } from "@unilab/mastra-plugin/agents";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
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
          agents: {
            l1: new URPCSimpleAgent({
              URPC,
              defaultModel: "google/gemini-2.0-flash-001",
              openrouterApiKey: process.env.OPENROUTER_API_KEY,
              // debug: true,
            }),
          },
          defaultAgent: "l1",
        }),
      ],
      entityConfigs: {
        user: {
          defaultSource: "mock",
        },
        post: {
          defaultSource: "mock",
        },
      },
      globalAdapters: [
        {
          source: "mock",
          factory: () => new MockAdapter(),
        },
      ],
    });
  }
  return api;
}
