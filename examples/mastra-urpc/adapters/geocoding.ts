import { BaseAdapter, FindOneArgs } from "@unilab/urpc-core";
import { GeocodingEntity } from "../entities/geocoding";

export class GeocodingAdapter extends BaseAdapter<GeocodingEntity> {
  async findOne(
    args: FindOneArgs<GeocodingEntity>
  ): Promise<GeocodingEntity | null> {
    const { name } = args.where;

    if (!name) {
      throw new Error("name is required");
    }

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${name}`
    );

    const data: any = await response.json();

    const results = data.results;
    if (results.length === 0) {
      throw new Error("No results found");
    }

    const result = results[0];

    return {
      name,
      result: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
    } as GeocodingEntity;
  }
}
