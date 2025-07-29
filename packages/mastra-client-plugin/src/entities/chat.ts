export class ChatEntity {
  static displayName = "ChatEntity";

  input: string = "";
  output: any;
  model?: string;
  agent?: string;
  entities?: string[];
}
