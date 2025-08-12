import { Mastra } from "@mastra/core";
import { EntityConfigs, SchemaObject } from "@unilab/urpc-core";

export interface URPC {
  getEntitySchemas(): Record<string, SchemaObject>;
  getEntitySources(): Record<string, string[]>;
  getEntityConfigs(): EntityConfigs;
  repo(options: { entity: string; source: string }): any;
}

export interface MastraPluginOptions {
  mastraInstance: Mastra;
  defaultAgent?: string;
}

export type URPCAgentRuntimeContext = {
  "entity-schemas": Record<string, SchemaObject>;
  "entity-sources": Record<string, string[]>;
  "entity-configs": EntityConfigs;
  "model": string;
};

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
