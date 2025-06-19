import { openai } from "../index";
import { ResponseCreateParamsWithTools } from "openai/lib/ResponsesParser";

type OpenAIOptionalParams = Partial<ResponseCreateParamsWithTools>;

interface ExtractHanlder {
  input: string;
  system: string;
  schema: { type: "json_object" };
  config?: OpenAIOptionalParams;
}

/**
 * Asynchronously extracts structured data from natural language input using OpenAI's library.
 *
 * @param input The raw text string to process.
 * @param key The context for extraction, guiding how the input is interpreted.
 * @returns A promise that resolves to a structured object containing the extracted data.
 */

export const extract = async ({
  input,
  system,
  schema,
  config,
}: ExtractHanlder): Promise<any> => {
  input = input.trim();

  const rawContent = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content: input,
      },
    ],
    text: {
      format: schema,
    },
    ...(config ?? {}),
  });

  if (rawContent) {
    try {
      return rawContent.output_parsed;
    } catch (e) {
      console.error(
        "Failed to parse JSON from OpenAI response:",
        rawContent,
        e
      );
      throw new Error("Invalid JSON response from AI. Please try again.");
    }
  }

  throw new Error("No content received from AI.");
};
