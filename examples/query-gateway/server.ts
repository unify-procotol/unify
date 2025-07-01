import { Unify } from "@unilab/unify-hono";
import { WeatherEntity } from "./entities/weather";
import { Plugin } from "@unilab/core";
import { WeatherAdapter } from "./adapters/open-meteo-weather";

const MyPlugin: Plugin = {
  entities: [WeatherEntity],
  adapters: [
    {
      source: "open-meteo",
      entityName: "WeatherEntity",
      adapter: new WeatherAdapter(),
    },
  ],
};

const app = Unify.init({
  plugins: [MyPlugin],
});

export default {
  port: 3000,
  fetch: app.fetch,
};
