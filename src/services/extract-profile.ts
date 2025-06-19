import { zodTextFormat } from "openai/helpers/zod";
import { PromptContext } from "./index";
import { z } from "zod";

// Shared schema for both operations
const zodInterface = z.object({
  role: z.string(),
  industry: z.string(),
  goal: z.string(),
  techStack: z.array(z.string()),
  languages: z.array(z.string()).nullable().optional(),
});

export const schema = zodTextFormat(zodInterface, "ExtractProfile");

export const instructions = () => `
Extract the following details from this LinkedIn-style profile description.
Focus ONLY on these fields (ignore others):
- role (e.g., "Frontend Developer")
- industry (e.g., "Web Development")
- goal (e.g., "Seeking remote jobs in EU")
- techStack (array of technologies, e.g., ["React", "Node.js"])
- languages (array of languages, omit if not mentioned)

Return as JSON matching this schema:
${JSON.stringify(zodInterface.shape, null, 2)}
`;

export const updateInstructions = (
  originalData: object,
  updatesRequested: string
) => `
Update this extracted profile data based on the requested changes: ${updatesRequested}

Current Data:
${JSON.stringify(originalData, null, 2)}

Rules:
1. Only modify fields mentioned in the update request
2. Keep all other fields unchanged
3. Maintain the exact same JSON structure
4. Never add new fields not in the original schema

Return the updated JSON data.
`;

// Consolidated exports
export const ProfileExtractor: Omit<PromptContext, "create"> = {
  generate: instructions,
  update: updateInstructions,
  schema,
};
