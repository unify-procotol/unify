import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export async function gptTranslation(
  title: string,
  content: string,
  locales: string[]
) {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    prompt: `Translate the following text into ${locales.join(", ")}: title: ${title} content: ${content}`,
    schema: z.object({
      locales: z.array(z.object({
        locale: z.string().describe("The locale of the translation"),
        title: z.string().describe("The translated title"),
        content: z.string().describe("The translated content"),
      }))
    }),
  });

  return result.object.locales.reduce((acc, locale) => {
    // @ts-ignore
    acc[locale.locale] = {
      title: locale.title,
      content: locale.content,
    };
    return acc;
  }, {});
}
