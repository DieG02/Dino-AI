import { CronJob } from "cron";
import { Reminder } from "../models";
import { sendMessageToUser } from "../lib/utils";
import { deleteReminders } from "../store/reminders";
import { Timestamp } from "firebase-admin/firestore";
import { REMINDERS_COLLECTION } from "./constants";
import { db } from "../store";

export const activeJobs = new Map<string, CronJob>();

export async function scheduleReminder(reminder: Reminder) {
  const { id, chatId, datetime, task, contact } = reminder;

  if (activeJobs.has(id)) return;

  const now = new Date();
  if (datetime <= now) {
    await sendMessageToUser(
      parseInt(chatId),
      `⚠️ Skipping reminder ${id} — datetime is in the past.`
    );
    return;
  }

  const job = new CronJob(datetime, async () => {
    await sendMessageToUser(
      parseInt(chatId),
      `🔹 *Follow Up on ${contact}:*\n\n${task}`
    );
    console.log("Sending reminder to:", chatId);
    activeJobs.delete(id);
    await deleteReminders(id);
  });

  job.start();
  activeJobs.set(id, job);
}

export async function restoreReminders() {
  const now = new Date();

  // Delete outdated reminders
  const outdatedSnap = await db
    .collection(REMINDERS_COLLECTION)
    .where("datetime", "<=", Timestamp.fromDate(now))
    .get();

  const deletePromises = outdatedSnap.docs.map((doc) =>
    db.collection(REMINDERS_COLLECTION).doc(doc.id).delete()
  );

  await Promise.all(deletePromises);
  console.log(`🗑️ Deleted ${deletePromises.length} outdated reminders`);

  // Schedule future reminders
  const futureSnap = await db
    .collection(REMINDERS_COLLECTION)
    .where("datetime", ">", Timestamp.fromDate(now))
    .get();

  futureSnap.forEach(async (doc) => {
    const data = doc.data();
    const reminder: Reminder = {
      id: doc.id,
      datetime: data.datetime.toDate(),
      task: data.task,
      chatId: data.chatId,
      createdAt: data.createdAt,
      contact: data.contact,
    };
    await scheduleReminder(reminder);
  });
}
