import { db } from "./index";
import { UserProfile } from "../models";
import { Collection } from "../config/constants";

/**
 * Updates the user profile in Firestore
 * @param telegramId - Telegram user ID
 * @param data - Partial UserProfile to merge
 */
export async function upsert(
  telegramId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const uid = String(telegramId);
  const userRef = db.collection(Collection.USERS).doc(uid);
  await userRef.set(profile, { merge: true });
}
