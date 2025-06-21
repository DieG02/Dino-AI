import { ProfileExtractor } from "./extract-profile";
import { PostGenerator } from "./generate-post";
import { IdeasGenerator } from "./generate-ideas";
// import welcomeMessage from "./system-welcome-message";

export enum Service {
  PROFILE_EXTRACTION = "PROFILE_EXTRACTION",
  LINKEDIN_POST_GENERATION = "LINKEDIN_POST_GENERATION",
  WEEKLY_IDEAS_GENERATION = "WEEKLY_IDEAS_GENERATION",
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
  [Service.WEEKLY_IDEAS_GENERATION]: IdeasGenerator,
  // ... map other prompts here
};
