import { Timestamp } from "@google-cloud/firestore";
import { REMINDERS_COLLECTION } from "../config/constants";
import { scheduleReminder } from "../config/cron";
import { Reminder } from "../models";
import { db } from "./index";

const ReminderCollection = db.collection(REMINDERS_COLLECTION);

export async function addReminder(
  reminder: Omit<Reminder, "id" | "createdAt">
) {
  const now = Timestamp.now();
  const docRef = await ReminderCollection.add({
    ...reminder,
    createdAt: now,
  });

  await scheduleReminder({
    ...reminder,
    id: docRef.id,
    createdAt: now,
  });

  return docRef.id;
}

export async function getReminders(chatId: string): Promise<Reminder[]> {
  const snapshot = await ReminderCollection.where("chatId", "==", chatId).get();

  if (snapshot.empty) {
    console.log("No reminders found for user:", chatId);
    return [];
  }

  const reminders = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      datetime: data.datetime.toDate(),
    } as Reminder;
  });

  return reminders;
}

export async function deleteReminders(ids: string | string[]) {
  const idArray = Array.isArray(ids) ? ids : [ids];
  const batch = db.batch();

  for (const id of idArray) {
    const ref = ReminderCollection.doc(id);
    batch.delete(ref);
  }

  await batch.commit();
  console.log(`🗑️ Deleted ${idArray.length} reminder(s):`, idArray);
}
