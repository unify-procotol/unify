import {
  BaseAdapter,
  CreationArgs,
  ErrorCodes,
  URPCError,
} from "@unilab/urpc-core";
import { LLMEntity } from "../entities/llm";

export class OpenrouterAdapter extends BaseAdapter<LLMEntity> {
  async create(args: CreationArgs<LLMEntity>): Promise<LLMEntity> {
    const { model, prompt } = args.data;
    if (!model || !prompt) {
      throw new URPCError(
        ErrorCodes.BAD_REQUEST,
        "Model, input and output are required"
      );
    }
    const output = await generateText({
      model,
      prompt,
    });
    return {
      model,
      prompt,
      output,
    };
  }
}

async function generateText({
  model = "openai/gpt-4o-mini",
  prompt,
}: {
  model?: string;
  prompt: string;
}) {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("API request error:", error.message);
    return null;
  }
}
