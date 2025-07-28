import { Output, PlanOutput } from "../type";

export class ChatEntity {
  static displayName = "ChatEntity";

  input: string = "";
  model?: string;
  output?: Output | PlanOutput;
}
