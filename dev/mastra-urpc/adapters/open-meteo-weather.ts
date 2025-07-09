import { BaseAdapter, FindOneArgs } from "@unilab/urpc-core";
import { WeatherEntity } from "../entities/weather";

export class WeatherAdapter extends BaseAdapter<WeatherEntity> {
  async findOne(
    args: FindOneArgs<WeatherEntity>
  ): Promise<WeatherEntity | null> {
    const { latitude, longitude, current, hourly } = args.where;

    if (latitude === undefined || longitude === undefined) {
      throw new Error("Latitude and longitude are required");
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
}
