import type { DataSourceAdapter, BaseEntity } from "@unilab/core";

export interface ClientConfig {
  enableDebug?: boolean;
  namespace?: string;
}

export interface AdapterRegistration<T extends BaseEntity = BaseEntity> {
  source: string;
  adapter: DataSourceAdapter<T>;
}

export type AdapterRegistry = Map<string, DataSourceAdapter<BaseEntity>>;
