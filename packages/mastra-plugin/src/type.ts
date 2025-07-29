import { EntityConfigs, SchemaObject } from "@unilab/urpc-core";

export interface URPC {
  getEntitySchemas(): Record<string, SchemaObject>;
  getEntitySources(): Record<string, string[]>;
  getEntityConfigs(): EntityConfigs;
  repo(options: { entity: string; source: string }): any;
}

export interface AgentInterface {
  setProxyConfig(config: {
    entitySchemas: Record<string, SchemaObject>;
    entitySources: Record<string, string[]>;
    entityConfigs: EntityConfigs;
  }): void;

  processRequest(params: {
    input: string;
    model?: string;
    proxy?: boolean;
    entities?: string[];
  }): Promise<any>;
}

export interface MastraPluginOptions {
  agents: Record<string, AgentInterface>;
  defaultAgent?: string;
}
