import { Fields } from "@unilab/core";

export class WeatherEntity {
  @Fields.number({
    description: "Latitude",
  })
  latitude = 0;

  @Fields.number({
    description: "Longitude",
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
  @Fields.number()
  latitude = 0;

  @Fields.number()
  longitude = 0;

  @Fields.number()
  generationtime_ms = 0;

  @Fields.number()
  utc_offset_seconds = 0;

  @Fields.string()
  timezone = "GMT";

  @Fields.string()
  timezone_abbreviation = "GMT";

  @Fields.number()
  elevation = 30;

  @Fields.record(() => Current)
  current = new Current();

  @Fields.record(() => CurrentUnits)
  current_units = new CurrentUnits();

  @Fields.record(() => Hourly)
  hourly = new Hourly();

  @Fields.record(() => HourlyUnits)
  hourly_units = new HourlyUnits();
}

export class Current {
  @Fields.string()
  time = "";

  @Fields.number()
  interval = 0;

  @Fields.number()
  temperature_2m = 0;

  @Fields.number()
  wind_speed_10m = 0;
}

export class CurrentUnits {
  @Fields.string()
  time = "iso8601";

  @Fields.string()
  interval = "seconds";

  @Fields.string()
  temperature_2m = "°C";

  @Fields.string()
  wind_speed_10m = "km/h";
}

export class Hourly {
  @Fields.array(() => String)
  time = [];

  @Fields.array(() => Number)
  temperature_2m = [];

  @Fields.array(() => Number)
  relative_humidity_2m = [];

  @Fields.array(() => Number)
  wind_speed_10m = [];
}

export class HourlyUnits {
  @Fields.string()
  time = "iso8601";

  @Fields.string()
  temperature_2m = "°C";

  @Fields.string()
  relative_humidity_2m = "%";

  @Fields.string()
  wind_speed_10m = "km/h";
}
