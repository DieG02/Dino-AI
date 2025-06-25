import { ProfileExtractor } from "./extract-profile";
import { PostGenerator } from "./generate-post";
import { IdeasGenerator } from "./generate-ideas";
import { ApplyJobExtractor } from "./extract-application";
import { ReferralGenerator } from "./generate-referral";
import { FollowUpExtractor } from "./extract-followup";
// import welcomeMessage from "./system-welcome-message";

export enum Service {
  PROFILE_EXTRACTION = "PROFILE_EXTRACTION",
  LINKEDIN_POST_GENERATION = "LINKEDIN_POST_GENERATION",
  WEEKLY_IDEAS_GENERATION = "WEEKLY_IDEAS_GENERATION",
  APPLY_TO_JOB_EXTRACTION = "APPLY_TO_JOB_EXTRACTION",
  REFERRAL_GENERATION = "REFERRAL_GENERATION",
  FOLLOW_UP_EXTRACTION = "FOLLOW_UP_EXTRACTION",
  // Add other services here as needed
}

export type PromptContext = {
  generate: (...props: any) => string;
  create: (...props: any) => string;
  update: (...data: any) => string;
  schema: any;
};

export const ServicesMap: Record<Service, Partial<PromptContext>> = {
  [Service.PROFILE_EXTRACTION]: ProfileExtractor,
  [Service.LINKEDIN_POST_GENERATION]: PostGenerator,
  [Service.WEEKLY_IDEAS_GENERATION]: IdeasGenerator,
  [Service.APPLY_TO_JOB_EXTRACTION]: ApplyJobExtractor,
  [Service.REFERRAL_GENERATION]: ReferralGenerator,
  [Service.FOLLOW_UP_EXTRACTION]: FollowUpExtractor,
  // ... map other prompts here
};
