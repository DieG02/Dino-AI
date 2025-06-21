import { PostSuggestion } from "../models";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { db } from "./index";
import {
  POST_SUGGESTIONS_COLLECTION,
  USERS_COLLECTION,
} from "../config/constants";

interface GetSuggestionsOptions {
  limit?: number;
  afterDate?: Date;
  beforeDate?: Date;
  type?: "bold" | "funny" | "technical" | "story-driven" | "thought-provoking";
}

export class SuggestionsManager {
  private static collection(userId: string) {
    return db
      .collection(USERS_COLLECTION)
      .doc(userId)
      .collection(POST_SUGGESTIONS_COLLECTION);
  }

  /**
   * Add new suggestion
   */
  static async add(
    userId: string,
    suggestion: Omit<PostSuggestion, "uid" | "id" | "createdAt">
  ): Promise<string> {
    const docRef = await this.collection(userId).add({
      ...suggestion,
      uid: userId,
      createdAt: FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Delete suggestion by ID
   */
  static async delete(userId: string, suggestionId: string): Promise<void> {
    await this.collection(userId).doc(suggestionId).delete();
  }

  /**
   * Get suggestions with filters and pagination
   */
  static async getAll(
    userId: string,
    options: GetSuggestionsOptions = {}
  ): Promise<PostSuggestion[]> {
    let query = this.collection(userId).orderBy("createdAt", "desc");

    // Apply filters
    if (options.afterDate) {
      query = query.where(
        "createdAt",
        ">=",
        Timestamp.fromDate(options.afterDate)
      );
    }
    if (options.beforeDate) {
      query = query.where(
        "createdAt",
        "<=",
        Timestamp.fromDate(options.beforeDate)
      );
    }
    if (options.type) {
      query = query.where("type", "==", options.type);
    }

    // Apply limit (default 25, max 100)
    const limit = Math.min(options.limit || 25, 100);
    query = query.limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(), // Convert Firestore timestamp to JS Date
    })) as PostSuggestion[];
  }

  /**
   * Delete all suggestions older than specified date
   */
  static async cleanupOldSuggestions(
    userId: string,
    cutoffDate: Date
  ): Promise<number> {
    const oldSuggestions = await this.getAll(userId, {
      beforeDate: cutoffDate,
    });

    const batch = db.batch();
    oldSuggestions.forEach((suggestion) => {
      batch.delete(this.collection(userId).doc(suggestion.id));
    });

    await batch.commit();
    return oldSuggestions.length;
  }

  /**
   * Get suggestion by ID
   */
  static async getById(
    userId: string,
    suggestionId: string
  ): Promise<PostSuggestion | null> {
    const doc = await this.collection(userId).doc(suggestionId).get();
    return doc.exists
      ? ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()?.createdAt.toDate(),
        } as PostSuggestion)
      : null;
  }
}
