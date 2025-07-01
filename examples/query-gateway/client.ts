import { repo, UnifyClient } from "@unilab/unify-client";
import {
  Current,
  CurrentUnits,
  Hourly,
  HourlyUnits,
  Result,
  WeatherEntity,
} from "./entities/weather";
import { generateSchemas } from "@unilab/core";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const schemas = generateSchemas([
  WeatherEntity,
  Result,
  Current,
  CurrentUnits,
  Hourly,
  HourlyUnits,
]);
console.log("schemas=>", schemas);

async function test() {
  const data = await repo<WeatherEntity>("weather", "open-meteo").findOne({
    where: {
      latitude: 52.52,
      longitude: 13.41,
      current: "temperature_2m,wind_speed_10m",
      hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m",
    },
  });

  console.log("data==>", data);
}

test();
