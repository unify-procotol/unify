import { logging } from "@unilab/urpc-core/middleware";
import { URPC, URPCAPI } from "@unilab/urpc-next/app-router";
import { MastraPlugin } from "@unilab/mastra-plugin";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { MockAdapter } from "@unilab/urpc-adapters";
import { WalletPlugin } from "@unilab/uniweb3";
import { getMastraInstance } from "@unilab/mastra-plugin/agents";

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
          mastraInstance: getMastraInstance({
            URPC,
            openrouterApiKey: process.env.OPENROUTER_API_KEY!,
            // debug: true,
          }),
          defaultAgent: "urpcSimpleAgent",
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
