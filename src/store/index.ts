import * as admin from "firebase-admin";
import * as user from "./user";

// --- Firebase Initialization ---

if (!admin.apps.length) {
  const serviceAccountJson = Buffer.from(
    process.env.GOOGLE_SERVICES_BASE64!,
    "base64"
  ).toString("utf8");

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
export const db = admin.firestore();

export const store = {
  upsertUser: user.upsert,
};
