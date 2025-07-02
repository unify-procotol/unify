import { Fields } from "@unilab/core";

export class GeocodingEntity {
  @Fields.string({
    description: "The name of the city to search for",
  })
  name = "";

  @Fields.record(() => GeocodingQueryResult)
  result = new GeocodingQueryResult();
}

export class GeocodingQueryResult {
  @Fields.number()
  latitude = 0;

  @Fields.number()
  longitude = 0;
}
