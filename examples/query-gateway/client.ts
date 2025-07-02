import { repo, UnifyClient } from "@unilab/unify-client";
import {
  Current,
  CurrentUnits,
  Hourly,
  HourlyUnits,
  WeatherQueryResult,
  WeatherEntity,
} from "./entities/weather";
import { generateSchemas } from "@unilab/core";
import { GeocodingEntity } from "./entities/geocoding";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

// const schemas = generateSchemas([
//   WeatherEntity,
//   WeatherQueryResult,
//   Current,
//   CurrentUnits,
//   Hourly,
//   HourlyUnits,
//   GeocodingEntity,
// ]);
// console.log("schemas=>", schemas);

async function test() {
  // get the latitude and longitude of a city
  const data = await repo<GeocodingEntity>({
    entityName: "geocoding",
    source: "open-meteo",
  }).findOne({
    where: {
      name: "london",
    },
  });

  console.log("[1] =>", data);

  if (!data) {
    throw new Error("No data found");
  }

  const latitude = data.result.latitude;
  const longitude = data.result.longitude;

  // get the weather of a city
  const data2 = await repo<WeatherEntity>({
    entityName: "weather",
    source: "open-meteo",
  }).findOne({
    where: {
      latitude: latitude,
      longitude: longitude,
      current: "temperature_2m,wind_speed_10m",
      hourly: "temperature_2m,wind_speed_10m",
    },
  });

  console.log("[2] =>", data2);
}

test();
