import * as profileExtraction from "./extract-profile";
import * as linkedinPost from "./generate-post";
// import weeklyPost from "./get-weekly-post";
// import welcomeMessage from "./system-welcome-message";

export enum Service {
  PROFILE_EXTRACTION = "PROFILE_EXTRACTION",
  LINKEDIN_POST_GENERATION = "LINKEDIN_POST_GENERATION",
}

const promptMap: Record<Service, { instructions: string; schema: any }> = {
  [Service.PROFILE_EXTRACTION]: profileExtraction,
  [Service.LINKEDIN_POST_GENERATION]: linkedinPost,
  // ... map other prompts here
};

export const getPrompt = (
  key: Service
): { instructions: string; schema: any } => {
  const prompt = promptMap[key];
  if (!prompt) {
    throw new Error(`Prompt with key "${key}" not found.`);
  }
  return prompt;
};
