import {
  BaseAdapter,
  ErrorCodes,
  FindManyArgs,
  FindOneArgs,
  URPCError,
} from "@unilab/urpc-core";
import { WeatherEntity } from "../entities/weather";

export class WeatherAdapter extends BaseAdapter<WeatherEntity> {
  async findOne(
    args: FindOneArgs<WeatherEntity>
  ): Promise<WeatherEntity | null> {
    let {
      name,
      latitude,
      longitude,
      current = "temperature_2m,wind_speed_10m",
      hourly = "temperature_2m,relative_humidity_2m,wind_speed_10m",
    } = args.where;

    // Must contain at least one of the name or latitude/longitude.
    if (!name && (latitude === undefined || longitude === undefined)) {
      throw new URPCError(
        ErrorCodes.BAD_REQUEST,
        "Must contain at least one of the name or latitude/longitude."
      );
    }

    if (name) {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${name}`
      );
      const data: any = await response.json();
      const results = data.results;
      if (results.length === 0) {
        throw new URPCError(ErrorCodes.NOT_FOUND, "No results found");
      }
      const result = results[0];
      latitude = result.latitude;
      longitude = result.longitude;
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${current}&hourly=${hourly}`
    );

    const data: any = await response.json();
    return {
      latitude,
      longitude,
      current,
      hourly,
      result: data,
    } as WeatherEntity;
  }

  async findMany(args: FindManyArgs<WeatherEntity>): Promise<WeatherEntity[]> {
    const where = args.where;
    if (!where) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "Where is required");
    }

    const result = await this.findOne({
      where: {
        name: typeof where.name === "string" ? where.name : where.name?.eq,
        latitude:
          typeof where.latitude === "number"
            ? where.latitude
            : where.latitude?.eq,
        longitude:
          typeof where.longitude === "number"
            ? where.longitude
            : where.longitude?.eq,
        current:
          typeof where.current === "string"
            ? where.current
            : where.current?.eq,
        hourly:
          typeof where.hourly === "string" ? where.hourly : where.hourly?.eq,
      },
    });

    if (!result) {
      throw new URPCError(ErrorCodes.NOT_FOUND, "No results found");
    }

    return [result as WeatherEntity];
  }
}
