import * as admin from "firebase-admin";

// --- Firebase Initialization ---
if (!admin.apps.length) {
  if (!process.env.GOOGLE_SERVICES_BASE64) {
    throw new Error(
      "Missing GOOGLE_SERVICES_BASE64 environment variable. " +
        "Please provide your Firebase service account credentials as base64."
    );
  }

  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICES_BASE64, "base64").toString("utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    throw new Error(
      `Firebase initialization failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export const db = admin.firestore();
