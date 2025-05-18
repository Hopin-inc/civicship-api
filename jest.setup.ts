import "reflect-metadata";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config({ path: ".env.test.local" });

if (!process.env.SKIP_FIREBASE && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'test@example.com',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || 'test-key',
    }),
  });
}
