import type { DataSourceAdapter } from "@unilab/core";

export interface ClientConfig {
  enableDebug?: boolean;
  adapters: AdapterRegistration<any>[];
}

export interface AdapterRegistration<T extends Record<string, any>> {
  source: string;
  adapter: DataSourceAdapter<T>;
}

export type AdapterRegistry = Map<
  string,
  DataSourceAdapter<Record<string, any>>
>;
