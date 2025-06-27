import { zodTextFormat } from "openai/helpers/zod";
import { Features } from "./index";
import { z } from "zod";

const zodInterface = z.object({
  position: z.string().describe("Job title or role being hired for"),
  company_name: z
    .string()
    .nullable()
    .describe("Name of the hiring company, if available"),
  description: z
    .string()
    .describe(
      "Main summary of the responsibilities, scope or purpose of the position"
    ),
  skills: z.array(z.string()).describe("Key required skills or technologies"),
  seniority: z
    .string()
    .describe("Experience level (e.g., 'Junior', '3+ years', 'Senior')"),
  location: z
    .string()
    .nullable()
    .describe("Geographic location mentioned (e.g., city, country, region)"),
  modality: z
    .enum(["remote", "onsite", "hybrid"])
    .nullable()
    .describe("Work modality if mentioned explicitly"),
});

export const schema = zodTextFormat(zodInterface, "ExtractJobDescription");

export const instructions = () => `
  Extract the following structured fields from the pasted job description.

  Only include these keys:

  - position (e.g., "Backend Developer")
  - company_name (e.g., "Stripe") — omit if not clearly mentioned
  - description (main paragraph or sentence that summarizes the role’s core responsibility or scope)
  - skills (array of key skills or technologies, e.g., ["React", "Docker", "Kubernetes"])
  - seniority (e.g., "Junior", "3+ years", "Senior")
  - location (if mentioned, include city, country or region; otherwise null)
  - modality (if explicitly stated: "remote", "onsite", or "hybrid")

  ⚠️ Rules:
  1. Do **not** guess missing fields — only extract what is clearly stated
  2. For 'description', capture the **core purpose** of the job, ideally from the opening paragraph or a “responsibilities” section
  3. If "remote", "hybrid", or "onsite" is mentioned, use that value for modality
  4. If location is mentioned as part of a sentence or heading, extract it as a plain string
  5. If a field is completely missing, **omit it from the final object**
  6. Use fallbacks only for required fields:
    - position: "[position]"
    - seniority: "[unspecified]"
    - description: "[no description found]"

  Return a JSON object matching this schema:
  ${JSON.stringify(zodInterface.shape, null, 2)}
`;

export default {
  generate: instructions,
  schema,
} as Partial<Features>;
