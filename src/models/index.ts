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
  country?: string;
  linkedinUrl?: string;
  joinedAt: number; // timestamp
}

// --- WEEKLY POST SUGGESTIONS ---
export interface PostSuggestion {
  id: string;
  uid: string;
  createdAt: number;
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
  createdAt: number;
  scheduledFor?: number; // optional future post
}

// --- REMINDERS ---
export interface Reminder {
  id: string;
  uid: string;
  text: string;
  time: number; // timestamp for sending
  createdAt: number;
}

// --- APPLICATION SUPPORT ---
export interface JobApplicationSupport {
  id: string;
  uid: string;
  jobDescription: string;
  coverLetter: string;
  skillMatch: string;
  questionsToAsk: string[];
  createdAt: number;
}

// --- MESSAGES SCOPE (For Analytics or Logs) ---
export interface BotMessageLog {
  id: string;
  uid: string;
  messageType: "command" | "prompt" | "reply" | "error";
  messageText: string;
  commandName?: string;
  createdAt: number;
}

// --- SYSTEM CONFIG (optional dynamic prompts, versions, etc) ---
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  updatedAt: number;
}
