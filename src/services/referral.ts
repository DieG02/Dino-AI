import { zodTextFormat } from "openai/helpers/zod";
import { UserProfile, UserExperience } from "../models";
import { Features } from "./index";
import { z } from "zod";

const zodInterface = z.object({
  text: z.string().describe("The full referral message ready to use"),
  type: z.enum(["employee", "recruiter", "info"]),
  changes: z.union([z.array(z.string()), z.null()]).optional(),
});

const schema = zodTextFormat(zodInterface, "ReferralMessage");

type DMType = "employee" | "recruiter" | "info";

interface Instructions {
  type: DMType;
  profile: UserProfile;
  experiences: UserExperience[];
  jd: {
    position: string;
    company_name: string;
    skills?: string[];
  };
}

const instructions = ({
  type,
  profile,
  experiences,
  jd,
}: Instructions): string => {
  const mostRelevantExp = experiences.reduce((prev, current) =>
    (current.skills?.filter((s) => jd.skills?.includes(s)).length || 0) >
    (prev.skills?.filter((s) => jd.skills?.includes(s)).length || 0)
      ? current
      : prev
  );

  const commonContext = `
    Job Opportunity:
    - Position: ${jd.position}
    - Company: ${jd.company_name}
    - Key Requirements: ${jd.skills?.slice(0, 5).join(", ") || "Not specified"}

    Candidate Background:
    - Name: ${profile.firstName || profile.username}
    - Current Role: ${profile.role || "Not specified"}
    - Relevant Experience: ${mostRelevantExp.role} at ${mostRelevantExp.company}
    - Top Matching Skills: ${
      mostRelevantExp.skills
        ?.filter((s) => jd.skills?.includes(s))
        .slice(0, 3)
        .join(", ") ||
      profile.techStack
        ?.filter((t) => jd.skills?.includes(t))
        .slice(0, 3)
        .join(", ")
    }
  `;

  switch (type) {
    case "employee":
      return `
      Create a referral request for someone at ${jd.company_name} following these guidelines:

      1. PERSONAL CONNECTION (if possible):
      - Shared alma mater
      - Mutual connections
      - Common interests

      2. VALUE PROPOSITION:
      - Highlight ${mostRelevantExp.role} experience
      - Mention 1-2 key achievements
      - Show enthusiasm for ${jd.company_name}

      3. CLEAR ASK:
      - Request referral for ${jd.position}
      - Offer to provide more details

      ${commonContext}

      Example:
      "Hi [First Name], 
      I noticed we both [shared connection]. I'm applying for the ${jd.position} role at ${jd.company_name} and believe my experience as a ${mostRelevantExp.role} - particularly when I [specific achievement] - aligns well. Would you consider referring me? I'd be happy to share more details about my background."
      `;

    case "recruiter":
      return `
      Compose a recruiter outreach message with these elements:

      1. OPENING HOOK:
      - Directly reference ${jd.position} position
      - Show knowledge of ${jd.company_name}'s work

      2. QUALIFICATIONS:
      - Quantifiable achievement from ${mostRelevantExp.company}
      - Technical skills matching JD
      - Cultural fit evidence

      3. CALL TO ACTION:
      - Request interview
      - Suggest availability

      ${commonContext}

      Example:
      "Dear [Recruiter Name],
      I'm excited to apply for the ${jd.position} role at ${jd.company_name}. At ${mostRelevantExp.company}, I [specific achievement with metric], using [JD-relevant skills]. I'm particularly impressed by ${jd.company_name}'s work on [specific project]. Could we schedule a call next week?"
      `;

    case "info":
      return `
      Craft an informational interview request with:

      1. GENUINE INTEREST:
      - Specific aspect of ${jd.company_name}'s work
      - Their team/department focus

      2. RELEVANT BACKGROUND:
      - Your related experience
      - What you hope to learn

      3. EASY NEXT STEPS:
      - 15-20 minute request
      - Flexible scheduling

      ${commonContext}

      Example:
      "Hello [First Name],
      I've been following ${jd.company_name}'s work in [specific area], especially how your team approaches [challenge]. As a ${profile.role} with experience in [relevant skill], I'd appreciate 15 minutes to learn about [specific topic]. Would you have time in the coming weeks?"
      `;
  }
};

export default {
  create: instructions,
  schema,
} as Partial<Features>;
