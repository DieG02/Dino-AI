// --- APP ---
export const BOT_NAME = "Dino AI";

// --- FIRESTORE ---
export const USERS_COLLECTION = "users";
export const EXPERIENCES_COLLECTION = "experiences";
export const REMINDERS_COLLECTION = "reminders";
export const POST_SUGGESTIONS_COLLECTION = "suggestions";
export const POSTS_COLLECTION = "posts";
export const APPLICATIONS_COLLECTION = "applications";
export const MESSAGES_COLLECTION = "messages";
export const SYSTEM_CONFIG_COLLECTION = "system/config";

export enum Collection {
  USERS = USERS_COLLECTION,
  EXPERIENCE = EXPERIENCES_COLLECTION,
  REMINDERS = REMINDERS_COLLECTION,
  POST_SUGGESTIONS = POST_SUGGESTIONS_COLLECTION,
  POSTS = POSTS_COLLECTION,
  APPLICATIONS = APPLICATIONS_COLLECTION,
  MESSAGES = MESSAGES_COLLECTION,
  SYSTEM_CONFIG = SYSTEM_CONFIG_COLLECTION,
}

export enum Wizard {
  SET_PROFILE = "set-profile-wizard",
  EXPERIENCE = "experience-wizard",
  WRITE_POST = "write-post-wizard",
  WEEKLY_IDEAS = "weekly-ideas-wizard",
  APPLY_TO = "apply-to-wizard",
  REFERRAL = "referral-wizard",
  FOLLOW_UP = "follow-up-wizard",
}
