import { Fields } from "@unilab/urpc-core";

export class TokenEntity {
  @Fields.string({
    description: "The symbol of the token",
  })
  symbol = "";

  @Fields.number({
    description: "The decimals of the token",
  })
  decimals = 0;
}

export class WalletEntity {
  @Fields.string({
    description: "The address of the wallet",
  })
  address = "";

  @Fields.string({
    description: "The balance of the wallet",
  })
  balance = "";

  @Fields.string({
    description: "The network of the wallet",
  })
  network = "";

  @Fields.record(() => TokenEntity, {
    optional: true,
    description: "The tokens of the wallet",
  })
  token?: TokenEntity = new TokenEntity();
}
