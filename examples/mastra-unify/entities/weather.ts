import { Fields } from "@unilab/core";

export class WeatherEntity {
  @Fields.number({
    description: "input parameter: latitude",
  })
  latitude = 0;

  @Fields.number({
    description: "input parameter: longitude",
  })
  longitude = 0;

  @Fields.string({
    optional: true,
    description:
      "A list of weather variables to get current conditions, separated by commas, e.g. temperature_2m,wind_speed_10m",
  })
  current = "temperature_2m,wind_speed_10m";

  @Fields.string({
    optional: true,
    description:
      "A list of weather variables which should be returned. Values can be comma separated, or multiple &hourly= parameter in the URL can be used. e.g. temperature_2m,relative_humidity_2m,wind_speed_10m",
  })
  hourly = "temperature_2m,relative_humidity_2m,wind_speed_10m";

  @Fields.record(() => WeatherQueryResult, {
    optional: true,
    description: "The result of the weather query",
  })
  result = new WeatherQueryResult();
}

export class WeatherQueryResult {
  @Fields.number({
    description: "latitude, e.g. 52.52",
  })
  latitude = 0;

  @Fields.number({
    description: "longitude, e.g. 13.41",
  })
  longitude = 0;

  @Fields.number({
    description: "generationtime_ms",
  })
  generationtime_ms = 0;

  @Fields.number({
    description: "utc_offset_seconds",
  })
  utc_offset_seconds = 0;

  @Fields.string({
    description: "timezone, e.g. GMT",
  })
  timezone = "GMT";

  @Fields.string({
    description: "timezone_abbreviation, e.g. GMT",
  })
  timezone_abbreviation = "GMT";

  @Fields.number({
    description: "elevation, e.g. 30",
  })
  elevation = 30;

  @Fields.record(() => Current, {
    optional: true,
    description: "Current object, contains current weather data",
  })
  current = new Current();

  @Fields.record(() => CurrentUnits, {
    optional: true,
    description: "CurrentUnits object, contains units for current weather data",
  })
  current_units = new CurrentUnits();

  @Fields.record(() => Hourly, {
    optional: true,
    description: "Hourly object, contains hourly weather data",
  })
  hourly = new Hourly();

  @Fields.record(() => HourlyUnits, {
    optional: true,
    description: "HourlyUnits object, contains units for hourly weather data",
  })
  hourly_units = new HourlyUnits();
}

export class Current {
  @Fields.string({
    description: "time, e.g. 2021-01-01T00:00",
  })
  time = "";

  @Fields.number({
    description: "interval, e.g. 3600",
  })
  interval = 0;

  @Fields.number({
    description: "temperature_2m, e.g. 20",
  })
  temperature_2m = 0;

  @Fields.number({
    description: "wind_speed_10m, e.g. 10",
  })
  wind_speed_10m = 0;
}

export class CurrentUnits {
  @Fields.string({
    description: "time units, e.g. iso8601",
  })
  time = "iso8601";

  @Fields.string({
    description: "interval units, e.g. seconds",
  })
  interval = "seconds";

  @Fields.string({
    description: "temperature_2m units, e.g. °C",
  })
  temperature_2m = "°C";

  @Fields.string({
    description: "wind_speed_10m units, e.g. km/h",
  })
  wind_speed_10m = "km/h";
}

export class Hourly {
  @Fields.array(() => String, {
    description: "time array, e.g. [2021-01-01T00:00, 2021-01-01T01:00, ...]",
  })
  time = [];

  @Fields.array(() => Number, {
    description: "temperature_2m array, e.g. [20, 21, 22, ...]",
  })
  temperature_2m = [];

  @Fields.array(() => Number, {
    description: "relative_humidity_2m array, e.g. [40, 41, 42, ...]",
  })
  relative_humidity_2m = [];

  @Fields.array(() => Number, {
    description: "wind_speed_10m array, e.g. [10, 11, 12, ...]",
  })
  wind_speed_10m = [];
}

export class HourlyUnits {
  @Fields.string({
    description: "time units, e.g. iso8601",
  })
  time = "iso8601";

  @Fields.string({
    description: "temperature_2m units, e.g. °C",
  })
  temperature_2m = "°C";

  @Fields.string({
    description: "relative_humidity_2m units, e.g. %",
  })
  relative_humidity_2m = "%";

  @Fields.string({
    description: "wind_speed_10m units, e.g. km/h",
  })
  wind_speed_10m = "km/h";
}
