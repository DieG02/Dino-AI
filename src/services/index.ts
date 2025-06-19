import { UserProfile } from "../models";
import { ProfileExtractor } from "./extract-profile";
import { PostGenerator } from "./generate-post";
// import weeklyPost from "./get-weekly-post";
// import welcomeMessage from "./system-welcome-message";

export enum Service {
  PROFILE_EXTRACTION = "PROFILE_EXTRACTION",
  LINKEDIN_POST_GENERATION = "LINKEDIN_POST_GENERATION",
}

export type PromptContext = {
  generate: () => string;
  create: (...props: any) => string;
  update: (...data: any) => string;
  schema: any;
};

export const ServicesMap: Record<Service, Partial<PromptContext>> = {
  [Service.PROFILE_EXTRACTION]: ProfileExtractor,
  [Service.LINKEDIN_POST_GENERATION]: PostGenerator,
  // ... map other prompts here
};
