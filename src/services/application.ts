import { zodTextFormat } from "openai/helpers/zod";
import { UserExperience, UserProfile } from "../models";
import { Features } from "./index";
import { z } from "zod";

const zodInterface = z.object({
  title: z
    .string()
    .describe(
      "The job title or short summary extracted from the job description."
    ),
  letter: z
    .string()
    .describe("A personalized cover letter tailored to the user's profile."),
  summary: z
    .string()
    .describe(
      "A comparison of the job requirements with the user's skills and experience, ending with a match percentage."
    ),
  questions: z
    .array(z.string())
    .min(3)
    .max(7)
    .describe("Likely interview questions based on the job description."),
});

const schema = zodTextFormat(zodInterface, "JobApplicationResponse");

export const instructions = (
  profile: UserProfile,
  experiences: UserExperience[]
): string => {
  const hasExperience = experiences.length > 0;

  const experiencesText = hasExperience
    ? experiences
        .map(
          (exp) => `
            - Role: ${exp.role}
            - Company: ${exp.company ?? "N/A"}
            - Duration: ${exp.start ?? "?"} to ${exp.end ?? "Present"}
            - Skills: ${exp.skills?.join(" | ") ?? "N/A"}
            - Description: ${exp.description ?? ""}
          `
        )
        .join("\n")
    : "No formal experiences provided.";

  return `
    You are CareerBot, an expert recruiter and AI career assistant. Your job is to help users apply to jobs based on their profile and a job description.

    Generate a JSON object with the following:

    1. **title** — A short title or summary based on the job description.
    2. **letter** — A well-written, confident cover letter (~200 words), customized to the user's profile.
    3. **summary** — A skill and experience comparison between the user and the job. Speak directly to the user ("you", "your"). Highlight both matches and missing areas. End with a match percentage.
    4. **questions** — A list of 3 to 7 thoughtful interview questions that the user might be asked for this position.

    User Profile:
    - Role: ${profile.role}
    - Industry: ${profile.industry}
    - Skills: ${profile.techStack.join(" | ")}
    ${
      profile.languages?.length
        ? `- Languages: ${profile.languages.join(" | ")}`
        : ""
    }
    ${profile.goal ? `- Career Goal: ${profile.goal}` : ""}
    ${
      hasExperience
        ? `- Experience:\n${experiencesText}`
        : "- No previous experience listed."
    }

    📌 Guidelines:
    - Focus only on relevant skills and experiences.
    - If the user has no experience, emphasize transferable skills.
    - The summary must clearly state where the user fits and where gaps exist.
    - Match percentage must prioritize seniority and relevance.
    - Do not make up facts — base output on profile content.

    Return a JSON object matching this schema:
    ${JSON.stringify(zodInterface.shape, null, 2)}
  `;
};

export default {
  generate: instructions,
  schema,
} as Partial<Features>;
