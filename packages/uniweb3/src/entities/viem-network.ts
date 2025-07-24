import { Fields } from "@unilab/urpc-core";
import { createPublicClient, http, PublicClient } from "viem";
import { getChain } from "../utils";

export class ViemNetworkEntity {
  static displayName = "ViemNetworkEntity";

  @Fields.number({
    description: "The chain id of the network",
  })
  chainId = 1;

  @Fields.string({
    description: "The name of the network",
  })
  name = "";

  @Fields.string({
    description: "The rpc url of the network",
  })
  rpcUrl = "";

  client?: PublicClient;

  constructor(args: Partial<ViemNetworkEntity>) {
    Object.assign(this, args);
    this.client = createPublicClient({
      chain: getChain(args.chainId || 1),
      transport: http(args.rpcUrl),
    });
  }
}
