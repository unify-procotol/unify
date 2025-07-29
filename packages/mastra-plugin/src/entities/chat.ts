import { EntityConfigs, SchemaObject } from "@unilab/urpc-core";

export class ChatEntity {
  static displayName = "ChatEntity";

  input: string = "";
  output: any;
  agent?: string;
  model?: string;
  proxy?: boolean = false;
  entities?: string[];
  entitySchemas?: Record<string, SchemaObject> = {};
  entitySources?: Record<string, string[]> = {};
  entityConfigs?: EntityConfigs = {};
}
