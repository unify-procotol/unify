import { BaseAdapter, FindOneArgs } from "@unilab/core";
import { WeatherEntity } from "../entities/weather";

export class WeatherAdapter extends BaseAdapter<WeatherEntity> {
  async findOne(
    args: FindOneArgs<WeatherEntity>
  ): Promise<WeatherEntity | null> {
    return null;
  }
}
