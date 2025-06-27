import { Firestore, Timestamp } from "@google-cloud/firestore";
import { Collection } from "../config/constants";
import { UserProfile } from "./index";
import { db } from "../store";

export class ProfileManager {
  private readonly uid: string;
  private _profile: UserProfile;

  constructor(uid: string) {
    this.uid = uid;
    this._profile = {} as UserProfile;
  }

  private get collection() {
    return db.collection(Collection.USERS).doc(this.uid);
  }

  // Main profile reference
  get me(): UserProfile {
    return this._profile;
  }

  // Public methods
  async refresh(): Promise<UserProfile> {
    const doc = await this.collection.get();

    this._profile = doc.data() as UserProfile;
    return this._profile;
  }

  async update(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      await this.collection.set(updates, { merge: true });

      this._profile = {
        ...(this._profile || {}),
        ...updates,
      } as UserProfile;

      return true;
    } catch (error) {
      console.error("Update failed:", error);
      return false;
    }
  }

  async create(ctx: any): Promise<UserProfile> {
    const newProfile: UserProfile = {
      uid: this.uid,
      firstName: ctx.from?.first_name ?? "",
      lastName: ctx.from?.last_name ?? "",
      username: ctx.from?.username ?? "",
      role: "",
      industry: "",
      goal: "",
      techStack: [],
      languages: [],
      joinedAt: Timestamp.now(),
    };
    await this.update(newProfile);
    return newProfile;
  }
}
