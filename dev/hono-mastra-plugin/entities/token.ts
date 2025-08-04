import { Fields } from "@unilab/urpc-core";

export class TokenEntity {
  static displayName = "TokenEntity";

  @Fields.string({
    description: "The address of the token contract",
  })
  address = "";

  @Fields.string({
    description: "The name of the token",
  })
  name = "";

  @Fields.string({
    description: "The symbol of the token",
  })
  symbol = "";

  @Fields.string({
    description: "The decimals of the token",
  })
  decimals = "";

  @Fields.number({
    description: "The USD price of the token",
  })
  usdPrice = 0;

  @Fields.string({
    optional: true,
    description: "The 24 hour percent change of the token",
  })
  "24hrPercentChange"?: string;

  @Fields.string({
    optional: true,
    description: "The exchange address of the token",
  })
  exchangeAddress?: string;

  @Fields.string({
    optional: true,
    description: "The exchange name of the token",
  })
  exchangeName?: string;
}
