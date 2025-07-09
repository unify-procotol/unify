import { URPC } from "@unilab/urpc-hono";
import { Plugin } from "@unilab/urpc-core";
import { GhostAdapter } from "./adapters/ghost";
import { i18nAIMiddleware, Logging } from "@unilab/urpc-core/middleware";
import { PostEntity } from "./entities/post";
import { UserEntity } from "./entities/user";
import { UserAdapter } from "./adapters/user";
import { CacheEntity } from "./entities/cache";
import { MemoryAdapter } from "./adapters/memory";
import { LLMEntity } from "./entities/llm";
import { OpenrouterAdapter } from "./adapters/openrouter";

const GhostPlugin: Plugin = {
  entities: [PostEntity, UserEntity],
  adapters: [
    { source: "ghost", entity: "PostEntity", adapter: new GhostAdapter() },
    { source: "ghost", entity: "UserEntity", adapter: new UserAdapter() },
  ],
};

const CachePlugin: Plugin = {
  entities: [CacheEntity],
  adapters: [
    {
      source: "memory",
      entity: "CacheEntity",
      adapter: new MemoryAdapter({
        ttl: 1000 * 60 * 5,
        max: 500,
        maxSize: 5000,
      }),
    },
    // { source: "redis", entity: "CacheEntity", adapter: new RedisAdapter() },
  ],
};

const LLMPlugin: Plugin = {
  entities: [LLMEntity],
  adapters: [
    {
      source: "openrouter",
      entity: "LLMEntity",
      adapter: new OpenrouterAdapter(),
    },
  ],
};

const app = URPC.init({
  plugins: [GhostPlugin, CachePlugin, LLMPlugin],
  middlewares: [
    i18nAIMiddleware({
      required: {
        cache: {
          entity: "CacheEntity",
          source: "memory",
        },
        llm: {
          entity: "LLMEntity",
          source: "openrouter",
        },
      },
    }),
    Logging()
  ],
  entityConfigs: {
    cache: {
      defaultSource: "memory",
      exclude: ["i18nAIMiddleware"],
    },
    llm: {
      defaultSource: "openrouter",
      exclude: ["i18nAIMiddleware"],
    },
    post: {
      defaultSource: "ghost",
      cache: { ttl: 1000 * 60 * 5 },
      fields: {
        title: {
          i18n: {
            prompt: "100 words or less",
            model: "openai/gpt-4o-mini",
          },
        },
        content: {
          i18n: {
            prompt: "200 words or less",
            model: "openai/gpt-4o-mini",
          },
        },
      },
    },
  },
});

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};
