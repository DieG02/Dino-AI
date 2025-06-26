import { Collection } from "../config/constants";
import { UserExperience } from "../models";
import { db } from "./index";

const experienceCollection = (uid: string) =>
  db.collection(Collection.USERS).doc(uid).collection(Collection.EXPERIENCE);

// Create (Add new experience)
export const addExperience = async (uid: string, data: UserExperience) => {
  const docRef = await experienceCollection(uid).add(data);
  return { id: docRef.id };
};

// Read (Get all experiences for a user)
export const getExperiences = async (uid: string) => {
  const snapshot = await experienceCollection(uid).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));
};

// Update (Modify one experience by ID)
export const updateExperience = async (
  uid: string,
  experienceId: string,
  data: Partial<UserExperience>
) => {
  await experienceCollection(uid).doc(experienceId).update(data);
};

// Delete (Remove one experience by ID)
export const deleteExperience = async (uid: string, experienceId: string) => {
  await experienceCollection(uid).doc(experienceId).delete();
};
