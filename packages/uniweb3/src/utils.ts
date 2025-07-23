import { Chain } from "viem";
import * as chains from "viem/chains";

export function getChain(chainId: number): Chain | undefined {
  return Object.values(chains).find((chain) => chain.id === chainId);
}
