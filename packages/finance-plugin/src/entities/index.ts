import { Fields } from "@unilab/urpc-core";

export class TimeSeriesEntity {
  static displayName = "TimeSeriesEntity";

  @Fields.string({
    description: "The time of the time series",
  })
  "1. open" = '';

  @Fields.string({
    description: "The high of the time series",
  })
  "2. high" = '';

  @Fields.string({
    description: "The low of the time series",
  })
  '3. low' = '';

  @Fields.string({
    description: "The close of the time series",
  })
  "4. close" = '';

  @Fields.string({
    description: "The volume of the time series",
  })
  "5. volume" = '';
}

export class CurrencyEntity {
  static displayName = "CurrencyEntity";

  @Fields.string({
    description: "The function of the currency",
  })
  function = "";

  @Fields.string({
    description: "The symbol of the currency",
  })
  symbol = "";

  @Fields.record(() => TimeSeriesEntity, {
    description: "The time series of the currency",
  })
  'Time Series (Daily)': Record<string, TimeSeriesEntity> = {};
}