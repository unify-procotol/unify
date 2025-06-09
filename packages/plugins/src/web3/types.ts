// 实体接口
export interface Entity {
  findOne: (args?: any) => Promise<any>;
}

// 插件接口
export interface Plugin {
  id: string;
  entities: {
    [key: string]: Entity;
  };
}

// 网络处理器接口
export interface NetworkHandler {
  getBalance(address: string): Promise<number>;
  symbol: string;
}

// 支持的网络类型
export type SupportedNetwork =
  | "solana"
  | "ethereum"
  | "iotex"
  | "polygon"
  | "bsc";

// 余额查询参数
export interface BalanceQueryArgs {
  id: string;
  network: SupportedNetwork;
}

// 余额响应
export interface BalanceResponse {
  balance: number;
  symbol: string;
  timestamp: string;
}
