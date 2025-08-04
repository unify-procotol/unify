import { URPC } from "@unilab/urpc-hono";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "./entities/user";
import { PostEntity } from "./entities/post";
import { MockAdapter } from "@unilab/urpc-adapters";
import { _SchemaEntity } from "@unilab/urpc-core/builtin-plugin-entities";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
};

const app = URPC.init({
  plugins: [MyPlugin],
  globalAdapters: [
    {
      source: "mock",
      factory: () => new MockAdapter(),
    },
  ],
  entityConfigs: {
    _data: {
      initData: [
        {
          key: "URPC_SERVER_INFO",
          value: {
            title: "URPC Server",
            desc: "URPC Server",
            logo: "https://example.com/logo.png",
          },
        },
      ],
    },
    user: {
      defaultSource: "mock",
    },
    post: {
      defaultSource: "mock",
    },
  },
});

export default {
  port: 3000,
  fetch: app.fetch,
};
