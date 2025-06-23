export class WalletEntity {
  address = "";
  balance = "";
  network = "";
  token?: {
    symbol: string;
    decimals: number;
  };
}
