import { db } from "./index";
import { UserExperience, UserProfile } from "../models";
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

interface ProfileResponse {
  id: string;
  profile: UserProfile;
  experiences: UserExperience[];
}

export const getProfile = async (uid: string): Promise<ProfileResponse> => {
  const userDocRef = db.collection(Collection.USERS).doc(uid);
  const userSnap = await userDocRef.get();

  if (!userSnap.exists) throw new Error("User not found");

  const profile = userSnap.data() as UserProfile;

  const experiencesSnap = await userDocRef
    .collection(Collection.EXPERIENCE)
    .get();

  const experiences = experiencesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any;

  return {
    id: userSnap.id,
    profile,
    experiences,
  };
};
