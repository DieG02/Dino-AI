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

const getJobDescription = (): string => {
  return `
    Extract these fields from the job description:
    - title: Job title (if not found, default to "[job_title]")
    - company: Company name (if not found, default to "[company_name]")
    - skills: Array of required skills
    - experiences: Required years/level (e.g., "3+ years", "Mid-level", "Senior")
    - stack: Technologies mentioned (e.g., ["Node.js", "React", "AWS Lambda"])
    
    Return the extracted information as a JSON object.
    `;
};

const instructions = (
  type: DMType,
  profile: UserProfile,
  jd: any,
  selectedExperience?: UserExperience
): string => {
  const hasSelectedExp = Boolean(selectedExperience);
  const currentCompany =
    selectedExperience?.company || "current/most recent company";
  const expDuration = "experience duration";
  const keySkills =
    selectedExperience?.skills?.slice(0, 3) || profile.techStack?.slice(0, 3);

  const commonBase = `
    Job Description:
    - Role: ${jd.title}
    - Company: ${jd.company}
    - Key Requirements: ${jd.skills?.slice(0, 5).join(", ")}
    - Experience Level: ${jd.experience}

    Candidate Profile:
    - Name: ${profile.username}
    - ${
      hasSelectedExp
        ? `Relevant Experience: ${selectedExperience?.role} at ${currentCompany} (${expDuration})`
        : `Top Skills: ${keySkills?.join(", ")}`
    }

    Message Requirements:
    - Length: 250-300 characters
    - Tone: Professional but approachable
    - Structure: Clear value proposition + call to action
    - Must include: 
      * 1-2 most relevant skills from JD
      ${
        hasSelectedExp
          ? `* Specific achievement at ${currentCompany}`
          : "* Overall career highlight"
      }
  `;

  switch (type) {
    case "employee":
      return `
  Create a referral request message for an employee at ${jd.company} for the ${
        jd.title
      } position.
  Follow these guidelines:
  1. Start with a personal connection (alumni, shared interest, etc.) if possible
  2. Briefly highlight your most relevant experience (${
    hasSelectedExp
      ? `focus on your time at ${currentCompany}`
      : "focus on key skills"
  })
  3. Politely ask if they'd be open to referring you
  4. Offer to provide more details

  ${commonBase}
  Example structure:
  "Hi [Name], I noticed you work at ${
    jd.company
  } as [their role]. I'm currently exploring opportunities as a ${
        jd.title
      } and think my experience in [skill] at ${currentCompany} could be a great fit. Would you be open to chatting about a potential referral?"`;

    case "recruiter":
      return `
  Compose a direct message to a recruiter/hiring manager at ${jd.company} for the ${jd.title} role.
  Key requirements:
  1. Open with clear intent about the specific role
  2. Quantify achievements where possible (e.g., "improved performance by X%")
  3. Show knowledge of the company's work/products
  4. Include a specific call to action (request for interview)

  ${commonBase}
  Example structure:
  "Dear [Recruiter Name], I'm excited to apply for the ${jd.title} position at ${jd.company}. With my ${expDuration} of [key skill] experience at ${currentCompany} where I [specific achievement], I believe I could contribute to [specific company project/goal]. Could we schedule a call to discuss?"`;

    case "info":
      return `
  Draft an informational interview request for someone at ${jd.company} (not necessarily in the ${jd.title} role).
  Important elements:
  1. Show genuine curiosity about their work/company
  2. Mention specific aspects of the company that interest you
  3. Request 15-20 minutes of their time
  4. Offer flexibility in scheduling

  ${commonBase}
  Example structure:
  "Hello [Name], I came across your profile while researching ${jd.company}'s work in [specific area]. As someone with experience in [your skill], I'd love to learn more about how your team approaches [relevant challenge]. Would you have 15 minutes to share your insights?"`;
  }
};

export default {
  generate: getJobDescription,
  create: instructions,
  schema,
} as Partial<Features>;
