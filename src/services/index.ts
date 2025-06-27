import ProfileExtractor from "./extract-profile";
import ExperienceExtractor from "./extract-experience";
import PostGenerator from "./generate-post";
import IdeasGenerator from "./generate-ideas";
import ApplyJobExtractor from "./extract-application";
import ReferralGenerator from "./generate-referral";
import FollowUpExtractor from "./extract-followup";

export enum Service {
  PROFILE = "PROFILE",
  EXPERIENCE = "EXPERIENCE",
  LINKEDIN_POST = "LINKEDIN_POST",
  WEEKLY_IDEAS = "WEEKLY_IDEAS",
  APPLY_TO = "APPLY_TO",
  REFERRAL = "REFERRAL",
  FOLLOW_UP = "FOLLOW_UP",
}

export type Features = {
  generate: (...props: any) => string;
  create: (...props: any) => string;
  update: (...data: any) => string;
  schema: any;
};

export const ServicesMap: Record<Service, Partial<Features>> = {
  [Service.PROFILE]: ProfileExtractor,
  [Service.EXPERIENCE]: ExperienceExtractor,
  [Service.LINKEDIN_POST]: PostGenerator,
  [Service.WEEKLY_IDEAS]: IdeasGenerator,
  [Service.APPLY_TO]: ApplyJobExtractor,
  [Service.REFERRAL]: ReferralGenerator,
  [Service.FOLLOW_UP]: FollowUpExtractor,
};
