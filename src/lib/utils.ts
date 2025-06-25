import { main } from "../index";
import { UserProfile } from "../models";

/**
 * Merges two partial UserProfile objects into one, applying optional logic for arrays and empty values.
 *
 * @param original - The base user profile object, typically the existing data.
 * @param updates - The new updates to apply, possibly partial or coming from user input.
 *
 * @returns A new Partial<any> object with the merged values.
 */
export function mergeProfile(
  original: Partial<UserProfile>,
  updates: Partial<UserProfile>
): UserProfile {
  const merged: any = { ...original };

  for (const key in updates) {
    const field = key as keyof UserProfile;
    const newValue = updates[field];
    const currentValue: any = original[field];

    if (Array.isArray(newValue)) {
      // Merge arrays uniquely only if new array has content
      if (newValue.length) {
        merged[field] = Array.from(
          new Set([...(currentValue || []), ...newValue])
        );
      } else {
        merged[field] = currentValue;
      }
    } else {
      // Merge scalar values only if non-empty string
      if (newValue && newValue !== "") {
        merged[field] = newValue;
      } else {
        merged[field] = currentValue;
      }
    }
  }

  return merged;
}

/**
 * Parses Telegram command text into {command, topic}
 * @example "/writepost new work" → {command: "writepost", topic: "new work"}
 */
export function parseCommand(fullText: string | undefined): {
  success: boolean;
  command?: string;
  topic?: string;
  error?: string;
} {
  if (!fullText) {
    return { success: false, error: "No command text found" };
  }

  const parts = fullText.trim().split(/\s+/);
  if (parts.length < 1 || !parts[0].startsWith("/")) {
    return { success: false, error: "Invalid command format" };
  }

  const command = parts[0].slice(1);
  const topic = parts.slice(1).join(" ").trim();

  return {
    success: true,
    command,
    topic: topic || undefined,
  };
}

interface Datetime {
  stringFormat: string;
  dateFormat: Date;
}
export function parseDatetime(date: string, time: string): Datetime {
  // Assuming format: date = 'DD/MM/YYYY', time = 'HH:mm'
  const [day, month, year] = date.split("/").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // JS Date: months are 0-indexed (0 = Jan)
  const jsDate = new Date(year, month - 1, day, hour, minute);

  // Store as ISO string
  const isoString = jsDate.toISOString(); // e.g., '2025-06-24T18:26:00.000Z'
  return { stringFormat: isoString, dateFormat: jsDate };
}

export async function sendMessageToUser(chatId: number, message: string) {
  try {
    await main.telegram.sendMessage(chatId, message, {
      parse_mode: "Markdown",
    });
    console.log(`✅ Message sent to ${chatId}: ${message}`);
  } catch (error) {
    console.error(`❌ Failed to send message to ${chatId}`, error);
  }
}
