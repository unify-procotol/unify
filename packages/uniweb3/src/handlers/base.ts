export interface NetworkHandler {
  getBalance(address: string): Promise<number>;
  symbol: string;
}
