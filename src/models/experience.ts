import { Collection } from "../config/constants";
import { UserExperience, ExperienceType } from "../models";
import { Timestamp } from "@google-cloud/firestore";
import { db } from "../store";

export class ExperienceManager {
  private readonly uid: string;
  private _cache: UserExperience[] | null = null;

  constructor(uid: string) {
    this.uid = uid;
  }

  private get collection() {
    return db
      .collection(Collection.USERS)
      .doc(this.uid)
      .collection(Collection.EXPERIENCE);
  }

  // Main cache access
  get all(): UserExperience[] {
    if (!this._cache)
      throw new Error("Cache not loaded. Call refresh() first.");
    return this._cache;
  }

  async add(experience: Omit<UserExperience, "id">): Promise<UserExperience> {
    const docRef = await this.collection.add({
      ...experience,
      createdAt: Timestamp.now(),
    });

    const newExp = { ...experience, id: docRef.id };
    this._cache?.push(newExp);
    return newExp;
  }

  async update(id: string, updates: Partial<UserExperience>): Promise<void> {
    await this.collection.doc(id).update(updates);
    this._cache =
      this._cache?.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ) || null;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
    this._cache = this._cache?.filter((exp) => exp.id !== id) || null;
  }

  async refresh(): Promise<UserExperience[]> {
    const snapshot = await this.collection.get();
    this._cache = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<UserExperience, "id">),
    }));
    return this._cache;
  }

  async find(id: string): Promise<UserExperience | undefined> {
    if (this._cache) return this._cache.find((exp) => exp.id === id);

    const doc = await this.collection.doc(id).get();
    return doc.exists
      ? { id: doc.id, ...(doc.data() as Omit<UserExperience, "id">) }
      : undefined;
  }

  filter(type: ExperienceType): UserExperience[] {
    return this.all.filter((exp) => exp.type === type);
  }
}
