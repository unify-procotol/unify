import { EntityConfigs, SchemaObject } from "@unilab/urpc-core";

export interface URPC {
  getEntitySchemas(): Record<string, SchemaObject>;
  getEntitySources(): Record<string, string[]>;
  getEntityConfigs(): EntityConfigs;
  repo(options: { entity: string; source: string }): any;
}

export interface AgentInterface {
  setProxyConfig?(config: {
    entitySchemas: Record<string, SchemaObject>;
    entitySources: Record<string, string[]>;
    entityConfigs: EntityConfigs;
  }): void;

  processRequest(params: {
    input: string;
    model?: string;
    proxy?: boolean;
    entities?: string[];
  }): Promise<PlanOutput>;

  streamResponse?(params: {
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

export interface StepOutput {
  operation: string;
  entity: string;
  source: string;
  data: any;
  message: string;
  success: boolean;
  urpc_code: string | null;
}

export interface ExecutionPlan {
  steps: Array<{
    description: string;
    urpc_code: string;
    order: number;
  }>;
  total_steps: number;
}

export interface PlanOutput {
  execution_plan: ExecutionPlan;
  results: StepOutput[];
  message?: string;
  summary?: boolean;
  summaryText?: string;
}

export interface AnalysisResult {
  needsAnalysis: boolean;
  analysisText?: string;
  originalResult?: PlanOutput;
}
