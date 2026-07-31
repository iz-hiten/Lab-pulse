import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - using environment variables or fallback to config file
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'xanthic-basis-9cf5x',
  appId: process.env.FIREBASE_APP_ID || '1:1072694544490:web:b67b85cd4a2baf548ea213',
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyCUbWIn7fafNT4PKHTlDcjUQXPd-h5Z6Ks',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'xanthic-basis-9cf5x.firebaseapp.com',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'xanthic-basis-9cf5x.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '1072694544490',
};

const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-labpulse-7445edf1-4a8c-44a2-a1ee-efd3531ed616';

let app;
let firestoreInstance;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  firestoreInstance = getFirestore(app, firestoreDatabaseId);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Initialize without database ID as fallback
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    firestoreInstance = getFirestore(app);
  } catch (fallbackError) {
    console.error('Firebase fallback initialization error:', fallbackError);
  }
}

export const firestore = firestoreInstance;
