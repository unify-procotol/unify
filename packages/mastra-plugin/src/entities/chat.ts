import { Fields } from "@unilab/urpc-core";

export class Output {
  static displayName = "Output";

  @Fields.string({
    description: "The operation to be performed",
  })
  operation: string = "";

  @Fields.string({
    description: "The entity to be operated on",
  })
  entity: string = "";

  @Fields.string({
    description: "The source of the operation",
  })
  source: string = "";

  @Fields.record(() => Object, {
    description: "The data returned from the operation",
  })
  data: any = null;

  @Fields.string({
    description: "The message returned from the operation",
  })
  message: string = "";

  @Fields.boolean({
    description: "Whether the operation was successful",
  })
  success: boolean = false;

  @Fields.string({
    description: "The urpc code returned from the operation",
  })
  urpc_code: string | null = null;
}

export class ChatEntity {
  static displayName = "ChatEntity";

  @Fields.string({
    description: "The input to the mastra model",
  })
  input: string = "";

  @Fields.string({
    optional: true,
    description: "The model to be used",
  })
  model?: string;

  @Fields.record(() => Output, {
    optional: true,
    description: "The output from the mastra model",
  })
  output?: Output;
}
