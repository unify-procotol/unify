import { logging } from "@unilab/urpc-core/middleware";
import { URPC, URPCAPI } from "@unilab/urpc-next/app-router";
import { MastraPlugin } from "@unilab/mastra-plugin";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { MockAdapter } from "@unilab/urpc-adapters";
import { WalletPlugin } from "@unilab/uniweb3";
import { URPCSimpleAgent } from "@unilab/mastra-plugin/agents";

let api: URPCAPI;
export function getAPI() {
  if (!api) {
    const DataPlugin: Plugin = {
      entities: [UserEntity, PostEntity],
    };

    api = URPC.init({
      plugins: [
        DataPlugin,
        WalletPlugin,
        MastraPlugin({
          agents: {
            "urpc-simple-agent": new URPCSimpleAgent({
              URPC,
              defaultModel: "google/gemini-2.0-flash-001",
              openrouterApiKey: process.env.OPENROUTER_API_KEY,
              debug: false,
            }),
          },
          defaultAgent: "urpc-simple-agent",
        }),
      ],
      // middlewares: [logging()],
      entityConfigs: {
        wallet: {
          defaultSource: "evm",
        },
        user: {
          defaultSource: "mock",
        },
        post: {
          defaultSource: "mock",
        },
      },
      globalAdapters: [MockAdapter],
    });
  }
  return api;
}
