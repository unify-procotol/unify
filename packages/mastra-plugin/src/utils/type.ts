import { EntityConfigs, SchemaObject } from "@unilab/urpc-core";

export interface URPC {
  getEntitySchemas(): Record<string, SchemaObject>;
  getEntitySources(): Record<string, string[]>;
  getEntityConfigs(): EntityConfigs;
  repo<T extends Record<string, any>>(options: {
    entity: string;
    source: string;
  }): any;
}

export interface MastraOptions {
  defaultModel?: string;
  openrouterApiKey?: string;
  debug?: boolean;
}

export interface Output {
  operation: string;
  entity: string;
  source: string;
  data: any;
  message: string;
  success: boolean;
  urpc_code: string | null;
}
