import {
  Current,
  CurrentUnits,
  Hourly,
  HourlyUnits,
  WeatherEntity,
  WeatherQueryResult,
} from "./entities/weather";
import { GeocodingEntity, GeocodingQueryResult } from "./entities/geocoding";
import { EnhancedUnifyToolBuilder } from "./unify-tool";
import { WeatherAdapter } from "./adapters/open-meteo-weather";
import { GeocodingAdapter } from "./adapters/geocoding";

const WeatherPlugin = {
  entities: [
    GeocodingEntity,
    GeocodingQueryResult,
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
      entity: "GeocodingEntity",
      adapter: new GeocodingAdapter(),
    },
    {
      source: "open-meteo",
      entity: "WeatherEntity",
      adapter: new WeatherAdapter(),
    },
  ],
};

// Debug the tool builder
const toolBuilder = new EnhancedUnifyToolBuilder(WeatherPlugin);
const analysis = toolBuilder.getPluginAnalysis();

console.log("🔍 Plugin Analysis:");
console.log("==================");
console.log(JSON.stringify(analysis, null, 2));

console.log("\n📋 Entity Info:");
console.log("================");
const entityInfo = toolBuilder.getEntityInfo();
console.log(JSON.stringify(entityInfo, null, 2));
