import Profile from "./profile";
import Experience from "./experience";
import Post from "./post";
import Ideas from "./ideas";
import JobDescription from "./job-description";
import Application from "./application";
import Referral from "./referral";
import FollowUp from "./follow-up";

export enum Service {
  PROFILE = "PROFILE",
  EXPERIENCE = "EXPERIENCE",
  LINKEDIN_POST = "LINKEDIN_POST",
  WEEKLY_IDEAS = "WEEKLY_IDEAS",
  JOB_DESCRIPTION = "JOB_DESCRIPTION",
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
  [Service.PROFILE]: Profile,
  [Service.EXPERIENCE]: Experience,
  [Service.LINKEDIN_POST]: Post,
  [Service.WEEKLY_IDEAS]: Ideas,
  [Service.JOB_DESCRIPTION]: JobDescription,
  [Service.APPLY_TO]: Application,
  [Service.REFERRAL]: Referral,
  [Service.FOLLOW_UP]: FollowUp,
};
