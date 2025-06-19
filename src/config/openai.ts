import { getPrompt, Service } from "../services";
import { zodTextFormat } from "openai/helpers/zod";
import { openai } from "../index";

/**
 * Asynchronously extracts structured data from natural language input using OpenAI's library.
 *
 * @param input The raw text string to process.
 * @param key The context for extraction, guiding how the input is interpreted.
 * @returns A promise that resolves to a structured object containing the extracted data.
 */
export const extract = async (input: string, key: Service): Promise<any> => {
  input = input.trim();

  // Retrieve the prompt string/function using the key
  const systemContent = getPrompt(key);
  const { instructions, schema } = systemContent;

  // const completion = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: [
  //     { role: "system", content: instructions },
  //     { role: "user", content: input },
  //   ],
  //   response_format: { type: "json_object" },
  // });

  // const rawContent = completion.choices[0].message.content;

  const rawContent = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: instructions },
      {
        role: "user",
        content: input,
      },
    ],
    text: {
      format: zodTextFormat(schema, "profile"),
    },
  });

  const response = rawContent.output_parsed;
  console.log("Raw content from OpenAI response:", response);

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
