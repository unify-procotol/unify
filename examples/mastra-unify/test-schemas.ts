import { generateSchemas } from "@unilab/core";
import {
  Current,
  CurrentUnits,
  Hourly,
  HourlyUnits,
  WeatherEntity,
  WeatherQueryResult,
} from "./entities/weather";
import { GeocodingEntity, GeocodingQueryResult } from "./entities/geocoding";

const schemas = generateSchemas([
  GeocodingEntity,
  GeocodingQueryResult,
  WeatherEntity,
  WeatherQueryResult,
  Current,
  CurrentUnits,
  Hourly,
  HourlyUnits,
]);
console.log("Generated schemas:");
console.log(JSON.stringify(schemas, null, 2));
