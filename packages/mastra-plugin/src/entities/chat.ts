import { EntityConfigs, Fields, SchemaObject } from "@unilab/urpc-core";
import { Output, PlanOutput } from "../utils/type";

export class ChatEntity {
  static displayName = "ChatEntity";

  input: string = "";
  model?: string;
  output?: Output | PlanOutput;
  proxy?: boolean = false;
  entitySchemas?: Record<string, SchemaObject> = {};
  entitySources?: Record<string, string[]> = {};
  entityConfigs?: EntityConfigs = {};
}
