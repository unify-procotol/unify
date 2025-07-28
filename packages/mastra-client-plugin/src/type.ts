export interface Output {
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
  execution_plan?: ExecutionPlan;
  results?: Output[];
}
