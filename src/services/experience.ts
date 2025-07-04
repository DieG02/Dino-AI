import { zodTextFormat } from "openai/helpers/zod";
import { Features } from "./index";
import { z } from "zod";

const zodInterface = z.object({
  status: z.enum(["COMPLETED", "PENDING", "REJECTED"]),
  experience: z.object({
    role: z.string(),
    company: z.string(),
    description: z.string(),
    skills: z.array(z.string()),
    location: z.string().nullable(),
    type: z.enum(["work", "project", "education", "volunteering", "other"]),
    start: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Must be MM/YYYY")
      .nullable(),
    end: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Must be MM/YYYY")
      .nullable(),
  }),
  missing: z
    .array(z.enum(["role", "company", "description"]))
    .or(z.literal("")),
});

const schema = zodTextFormat(zodInterface, "ExtractExperience");

const instructions = () => `
  You are an AI assistant designed to extract structured professional experience from user input. The data will be used to build a resume and must follow these rules:

  Important:
  
  The description must be rewritten as a professional, CV-style summary.
  Include appropriate keywords for the role/industry.
  Avoid generic phrases like “did things”; focus on achievements, responsibilities, and technologies.
  Use the given value of type as the experience type (e.g., "work", "volunteering", etc.).

  Rules:

  Extract the following required fields:
  • role — a concise job title (e.g., "Backend Developer")
  • company — organization or employer name
  • description — 1–2 professional, well-written sentences suitable for a CV. Use action verbs and include role-relevant keywords.

  Optionally extract:
  • skills — a list of technologies, tools, or methods mentioned
  • location — if available, use a short location string (e.g., "Milan, Italy")
  • start/end: MM/YYYY format

  Status Handling:
  • If all required fields are found, set status = "COMPLETED"
  • If any required fields are missing, set status = "PENDING" and list which fields are missing
  • If the input is irrelevant or unusable, set status = "REJECTED"

  Return ONLY a valid JSON matching this schema:
  ${JSON.stringify(zodInterface.shape, null, 2)}
`;

const updateInstructions = (
  originalData: z.infer<typeof zodInterface>,
  updatesRequested: string
) => `
  Update this experience data based on: ${updatesRequested}

  Current Data:
  ${JSON.stringify(originalData, null, 2)}

  Rules:
  1. Only modify fields mentioned in the request
  2. Maintain original schema structure
  3. Update status if completeness changes

  Return the updated JSON data.
`;

export default {
  generate: instructions,
  update: updateInstructions,
  schema,
} as Partial<Features>;
