import { zodTextFormat } from "openai/helpers/zod";
import { UserProfile } from "../models";
import { Features } from "./index";
import { z } from "zod";

const zodInterface = z.object({
  title: z.string().describe("The job description that the user provided."),
  letter: z
    .string()
    .describe(
      "A personalized cover letter for the user to apply to this job, tailored to their profile."
    ),
  summary: z
    .string()
    .describe(
      "A breakdown of key skills required for this job, mapped to the user's profile and estimating the match percentage."
    ),
  questions: z
    .array(z.string())
    .min(3)
    .max(7)
    .describe(
      "A list of thoughtful questions the user might be asked in an interview for this job."
    ),
});

const schema = zodTextFormat(zodInterface, "JobApplicationResponse");

const instructions = (profile: UserProfile): string => {
  const hasExperience = profile.experiences && profile.experiences.length > 0;
  const experiencesText = hasExperience
    ? profile.experiences
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
    You are CareerBot, a senior recruiter and AI career assistant that helps users apply to jobs based on their profile and a job description.

    Your task is to return a JSON object with three components:

    1. A personalized, confident, well-written cover letter tailored to this job opportunity and the user’s profile, around 200 words.
    2. A **personalized summary** comparing the job requirements with *your* known skills and experiences, including a percentage match.
    3. A list of thoughtful interview questions the candidate might be asked based on the job description.

    User’s Profile:
    - Role: ${profile.role}
    - Industry: ${profile.industry}
    - Skills: ${profile.techStack.join(" | ")}
    ${
      profile.languages && profile.languages.length > 0
        ? `- Languages: ${profile.languages.join(" | ")}`
        : ""
    }
    ${profile.goal ? `- Career Goal: ${profile.goal}` : ""}
    ${
      hasExperience
        ? `- Experience:\n${experiencesText}`
        : "- No previous experience listed."
    }
    Your cover letter must be tailored to this specific job. Only include skills if they are relevant to the opportunity. If experience it's not provided, fill it with match skills to balance the letter.

    The summary must explain which skills match, and where there might be gaps (e.g., 'User lacks direct experience in Kubernetes but has worked with Docker').
    This summary must directly address the user using "you" and "your".
    End that section with an approximate match percentage (high priority to the seniority, take it from experiences field attached).

    Interview questions should reflect the job responsibilities and technical expectations in the description.

    Return only the following JSON format:

    \`\`\`json
    {
      "title": "[Insert short summary or title of job]",
      "letter": "...",
      "summary": "...",
      "questions": [
        "...",
        "...",
        "..."
      ]
    }
    \`\`\`

    Return the JSON only. No commentary or explanation.

    Job Description:
    """
  `;
};

export default {
  generate: instructions,
  schema,
} as Partial<Features>;
