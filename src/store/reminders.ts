import { Timestamp } from "@google-cloud/firestore";
import { Collection } from "../config/constants";
import { scheduleReminder } from "../config/cron";
import { Reminder } from "../models";
import { db } from "./index";

const ReminderCollection = db.collection(Collection.REMINDERS);

export class ReminderManager {
  /**
   * Add a new reminder for a user.
   */
  static async add(
    chatId: string,
    reminder: Omit<Reminder, "id" | "createdAt" | "chatId">
  ): Promise<string> {
    const now = Timestamp.now();
    const fullReminder = {
      ...reminder,
      chatId,
      createdAt: now,
    };

    const docRef = await ReminderCollection.add(fullReminder);

    await scheduleReminder({
      ...fullReminder,
      id: docRef.id,
    });

    return docRef.id;
  }

  /**
   * Get all reminders for a specific user.
   */
  static async getAll(chatId: string): Promise<Reminder[]> {
    const snapshot = await ReminderCollection.where(
      "chatId",
      "==",
      chatId
    ).get();

    if (snapshot.empty) {
      console.log("No reminders found for user:", chatId);
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        datetime: data.datetime.toDate(),
      } as Reminder;
    });
  }

  /**
   * Delete one or multiple reminders by ID.
   */
  static async delete(ids: string | string[]): Promise<void> {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const batch = db.batch();

    for (const id of idArray) {
      const ref = ReminderCollection.doc(id);
      batch.delete(ref);
    }

    await batch.commit();
    console.log(`🗑️ Deleted ${idArray.length} reminder(s):`, idArray);
  }
}
