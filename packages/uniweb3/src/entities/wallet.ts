import { Fields } from "@unilab/urpc-core";
import { createPublicClient, http, PublicClient } from "viem";
import { getChain } from "../utils";
import { Connection } from "@solana/web3.js";

export class TokenEntity {
  static displayName = "TokenEntity";

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
  static displayName = "WalletEntity";

  @Fields.string({
    description: "The address of the wallet",
  })
  address = "";

  @Fields.string({
    description: "The balance of the wallet",
  })
  balance = "";

  @Fields.number({
    optional: true,
    description: "The chain id of the network",
  })
  chainId?: number = 1;

  @Fields.string({
    optional: true,
    description: "The rpc url of the network",
  })
  rpcUrl?: string = "";

  @Fields.string({
    description: "The source of the wallet",
  })
  source: "evm" | "solana" = "evm";

  @Fields.record(() => TokenEntity, {
    optional: true,
    description: "The tokens of the wallet",
  })
  token?: TokenEntity = new TokenEntity();

  client?: PublicClient;

  connection?: Connection;

  constructor(args: Partial<WalletEntity>) {
    Object.assign(this, args);

    if (args.source === "solana" && args.rpcUrl) {
      this.connection = new Connection(args.rpcUrl);
    }

    if (args.source === "evm") {
      if (args.chainId) {
        this.client = createPublicClient({
          chain: getChain(args.chainId),
          transport: http(),
        });
      }
      if (args.rpcUrl) {
        this.client = createPublicClient({
          transport: http(args.rpcUrl),
        });
      }
    }
  }
}
