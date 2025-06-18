import axios from "axios";
import { context } from "./index";
import { Wizard } from "../config/constants";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Asynchronously extracts structured data from natural language input.
 *
 * @param input The raw text string to process.
 * @param key The context for extraction, guiding how the input is interpreted.
 * @returns A promise that resolves to a structured object containing the extracted data.
 */
export const extract = async (input: string, key: Wizard): Promise<any> => {
  input = input.trim();

  const prompt: () => string = context[key];
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: prompt() },
        { role: "user", content: input },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return JSON.parse(res.data.choices[0].message.content);
};
