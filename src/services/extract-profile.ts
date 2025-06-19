import { z } from "zod";

export const instructions = `
Extract the following details from this LinkedIn-style profile description.
Focus ONLY on these fields (ignore others):
- role (e.g., "Frontend Developer")
- industry (e.g., "Web Development")
- goal (e.g., "Seeking remote jobs in EU")
- techStack (array of technologies, e.g., ["React", "Node.js"])
- languages (array of languages, omit if not mentioned)
`;

export const schema = z.object({
  role: z.string(),
  industry: z.string(),
  goal: z.string(),
  techStack: z.array(z.string()),
  languages: z.array(z.string()).nullable().optional(), // optional if not always present
});
