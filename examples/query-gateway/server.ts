import { Unify } from "@unilab/unify-hono";
import { WeatherEntity } from "./entities/weather";
import { Plugin } from "@unilab/core";
import { WeatherAdapter } from "./adapters/open-meteo-weather";
import { GeocodingAdapter } from "./adapters/geocoding";

const MyPlugin: Plugin = {
  entities: [WeatherEntity],
  adapters: [
    {
      source: "open-meteo",
      entityName: "WeatherEntity",
      adapter: new WeatherAdapter(),
    },
    {
      source: "open-meteo",
      entityName: "GeocodingEntity",
      adapter: new GeocodingAdapter(),
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
