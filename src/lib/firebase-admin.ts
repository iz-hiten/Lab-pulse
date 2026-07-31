// Server-side Firebase initialization for Vercel serverless
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

export function getFirebaseAdmin() {
  if (!app) {
    // Check if already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      // Initialize with Firebase config
      // For Vercel, we'll use the client config and let Firebase handle auth
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'xanthic-basis-9cf5x',
      });
    }
  }

  if (!db) {
    db = getFirestore(app);
    // Set the database ID if using named database
    if (process.env.FIRESTORE_DATABASE_ID) {
      db = getFirestore(app, process.env.FIRESTORE_DATABASE_ID);
    }
  }

  return { app, db };
}

export function getFirestoreDb(): Firestore {
  const { db } = getFirebaseAdmin();
  return db;
}
