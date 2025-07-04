import { Fields } from "@unilab/core";

export class GeocodingEntity {
  @Fields.string({
    description: "The name of the city to search for",
  })
  name = "";

  @Fields.record(() => GeocodingQueryResult, {
    optional: true,
    description: "The result of the geocoding query",
  })
  result = new GeocodingQueryResult();
}

export class GeocodingQueryResult {
  @Fields.number({
    description: "The latitude of the city",
  })
  latitude = 0;

  @Fields.number({
    description: "The longitude of the city",
  })
  longitude = 0;
}
