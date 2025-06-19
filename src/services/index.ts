import profileExtractionPrompt from "./extract-profile";
import linkedinPostPrompt from "./generate-post";
// import weeklyPostPrompt from "./get-weekly-post";
// import welcomeMessagePrompt from "./system-welcome-message";

export enum Service {
  PROFILE_EXTRACTION = "PROFILE_EXTRACTION",
  LINKEDIN_POST_GENERATION = "LINKEDIN_POST_GENERATION",
}

const promptMap: Record<Service, string | (() => string)> = {
  [Service.PROFILE_EXTRACTION]: profileExtractionPrompt,
  [Service.LINKEDIN_POST_GENERATION]: linkedinPostPrompt,
  // ... map other prompts here
};

export const getPrompt = (key: Service): string | (() => string) => {
  const prompt = promptMap[key];
  if (!prompt) {
    throw new Error(`Prompt with key "${key}" not found.`);
  }
  return prompt;
};
