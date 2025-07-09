import { Fields } from "@unilab/urpc-core";

export class LLMEntity {
  @Fields.string({
    description: "The model of the llm",
  })
  model = "";

  @Fields.string({
    description: "The prompt of the llm",
  })
  prompt = "";

  @Fields.string({
    description: "The output of the llm",
  })
  output = "";
}
