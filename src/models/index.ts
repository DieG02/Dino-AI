import { Timestamp } from "firebase-admin/firestore";

export type ExperienceType =
  | "work"
  | "project"
  | "education"
  | "volunteering"
  | "other";

// --- USER PROFILE ---
export interface UserProfile {
  uid: string; // Telegram user id
  username?: string;
  firstName?: string;
  lastName?: string;
  role: string; // e.g. "Frontend Developer"
  industry: string; // e.g. "Web Development"
  goal: string; // e.g. "Find a remote job in EU"
  techStack: string[]; // e.g. ["React", "Node.js", "TypeScript"]
  languages: string[]; // e.g. ["English", "Spanish"]
  experience: UserExperience[]; // Array of past roles/projects
  country?: string;
  linkedinUrl?: string;
  joinedAt: Timestamp;
}

// --- WEEKLY POST SUGGESTIONS ---
export interface UserExperience {
  role: string;
  company: string;
  start?: Timestamp;
  end?: Timestamp | null;
  description?: string;
  skills?: string[];
  type: ExperienceType;
  location?: string;
}

// --- WEEKLY POST SUGGESTIONS ---
export interface PostSuggestion {
  id: string;
  uid: string;
  createdAt: Timestamp;
  promptUsed: string;
  content: string;
  tags: string[];
}

// --- USER GENERATED POSTS ---
export interface UserPost {
  id: string;
  uid: string;
  text: string;
  type: "insight" | "project" | "career" | "question";
  generatedWithAI?: boolean;
  createdAt: Timestamp;
  scheduledFor?: Timestamp;
}

// --- REMINDERS ---
export interface Reminder {
  id: string;
  chatId: string;
  task: string;
  datetime: Date;
  contact: string;
  createdAt: Timestamp;
}

// --- APPLICATION SUPPORT ---
export interface JobApplicationSupport {
  id: string;
  uid: string;
  jobDescription: string;
  coverLetter: string;
  skillMatch: string;
  questionsToAsk: string[];
  createdAt: Timestamp;
}

// --- MESSAGES SCOPE (For Analytics or Logs) ---
export interface BotMessageLog {
  id: string;
  uid: string;
  messageType: "command" | "prompt" | "reply" | "error";
  messageText: string;
  commandName?: string;
  createdAt: Timestamp;
}

// --- SYSTEM CONFIG (optional dynamic prompts, versions, etc) ---
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  updatedAt: Timestamp;
}
