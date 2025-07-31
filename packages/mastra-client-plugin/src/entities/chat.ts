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
  };
  model?: string;
  agent?: string;
  entities?: string[];
}
