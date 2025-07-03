import { Fields } from "@unilab/core";

class TokenEntity {
  @Fields.string()
  symbol = "";

  @Fields.number()
  decimals = 0;
}

export class WalletEntity {
  @Fields.string()
  address = "";

  @Fields.string()
  balance = "";

  @Fields.string()
  network = "";

  @Fields.record(() => TokenEntity, {
    optional: true,
  })
  token?: TokenEntity = new TokenEntity();
}
