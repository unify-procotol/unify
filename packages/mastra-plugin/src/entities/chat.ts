import { EntityConfigs, SchemaObject } from "@unilab/urpc-core";
import { PlanOutput } from "../type";

export class ChatEntity {
  static displayName = "ChatEntity";

  input: string = "";
  output: PlanOutput = {
    execution_plan: {
      steps: [],
      total_steps: 0,
    },
    results: [],
    summary: false,
    summaryText: "",
  };
  agent?: string;
  model?: string;
  proxy?: boolean = false;
  entities?: string[];
  entitySchemas?: Record<string, SchemaObject> = {};
  entitySources?: Record<string, string[]> = {};
  entityConfigs?: EntityConfigs = {};
}
