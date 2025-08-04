import { URPC } from "@unilab/urpc-hono";
import { UserEntity } from "./entities/user";
import { Plugin } from "@unilab/urpc-core";
import { UserAdapter } from "./adapters/user";
import { MastraPlugin } from "@unilab/mastra-plugin";
import { MockAdapter } from "@unilab/urpc-adapters";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { URPCSimpleAgent } from "@unilab/mastra-plugin/agents";
import { GeocodingEntity, GeocodingQueryResult } from "./entities/geocoding";
import { GeocodingAdapter } from "./adapters/open-meteo-geocoding";
import {
  Current,
  CurrentUnits,
  Hourly,
  HourlyUnits,
  WeatherEntity,
  WeatherQueryResult,
} from "./entities/weather";
import { WeatherAdapter } from "./adapters/open-meteo-weather";
import { TokenEntity } from "./entities/token";
import { MoralisTokenAdapter } from "./adapters/moralis-token";

const MyPlugin: Plugin = {
  entities: [UserEntity],
  adapters: [
    {
      entity: "UserEntity",
      source: "call-stream-test",
      adapter: new UserAdapter(),
    },
  ],
};

export const GeocodingPlugin: Plugin = {
  entities: [GeocodingEntity, GeocodingQueryResult],
  adapters: [
    {
      source: "open-meteo",
      entity: "GeocodingEntity",
      adapter: new GeocodingAdapter(),
    },
  ],
};

export const WeatherPlugin: Plugin = {
  entities: [
    WeatherEntity,
    WeatherQueryResult,
    Current,
    CurrentUnits,
    Hourly,
    HourlyUnits,
  ],
  adapters: [
    {
      source: "open-meteo",
      entity: "WeatherEntity",
      adapter: new WeatherAdapter(),
    },
  ],
};

const Web3Plugin: Plugin = {
  entities: [TokenEntity],
  adapters: [
    {
      source: "moralis",
      entity: "TokenEntity",
      adapter: new MoralisTokenAdapter(),
    },
  ],
};

const app = new Hono();
app.use(cors());

URPC.init({
  app,
  plugins: [
    MyPlugin,
    GeocodingPlugin,
    WeatherPlugin,
    Web3Plugin,
    MastraPlugin({
      agents: {
        l1: new URPCSimpleAgent({
          URPC,
          defaultModel: "google/gemini-2.0-flash-001",
          openrouterApiKey: process.env.OPENROUTER_API_KEY,
          debug: true,
        }),
      },
      defaultAgent: "l1",
    }),
  ],
  entityConfigs: {
    user: {
      defaultSource: "mock",
    },
    geocoding: {
      defaultSource: "open-meteo",
    },
    weather: {
      defaultSource: "open-meteo",
    },
  },
  globalAdapters: [
    {
      source: "mock",
      factory: () => new MockAdapter(),
    },
  ],
});

// insert user
URPC.repo({
  entity: "UserEntity",
  source: "mock",
}).create({
  data: {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://example.com/avatar.png",
  },
});

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};
