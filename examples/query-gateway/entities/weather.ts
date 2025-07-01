import { Fields } from "@unilab/core";

// Location information
class LocationEntity {
  @Fields.string()
  city = "";

  @Fields.string()
  region = "";

  @Fields.string()
  woeid = "";

  @Fields.string()
  country = "";

  @Fields.string()
  lat = "";

  @Fields.string()
  long = "";

  @Fields.string()
  timezone_id = "";
}

// Wind information
class WindEntity {
  @Fields.number()
  chill = 0;

  @Fields.string()
  direction = "";

  @Fields.number()
  speed = 0;
}

// Atmosphere information
class AtmosphereEntity {
  @Fields.number()
  humidity = 0;

  @Fields.number()
  visibility = 0;

  @Fields.number()
  pressure = 0;
}

// Astronomy information
class AstronomyEntity {
  @Fields.string()
  sunrise = "";

  @Fields.string()
  sunset = "";
}

// Weather condition
class ConditionEntity {
  @Fields.number()
  temperature = 0;

  @Fields.string()
  text = "";

  @Fields.number()
  code = 0;
}

// Current observation
class CurrentObservationEntity {
  @Fields.number()
  pubDate = 0;

  @Fields.record(() => WindEntity)
  wind = new WindEntity();

  @Fields.record(() => AtmosphereEntity)
  atmosphere = new AtmosphereEntity();

  @Fields.record(() => AstronomyEntity)
  astronomy = new AstronomyEntity();

  @Fields.record(() => ConditionEntity)
  condition = new ConditionEntity();
}

// Weather forecast
class ForecastEntity {
  @Fields.string()
  day = "";

  @Fields.number()
  date = 0;

  @Fields.number()
  high = 0;

  @Fields.number()
  low = 0;

  @Fields.string()
  text = "";

  @Fields.number()
  code = 0;
}

// Main weather entity
export class WeatherEntity {
  @Fields.record(() => LocationEntity)
  location = new LocationEntity();

  @Fields.record(() => CurrentObservationEntity)
  current_observation = new CurrentObservationEntity();

  @Fields.array(() => ForecastEntity)
  forecasts: ForecastEntity[] = [];
}
