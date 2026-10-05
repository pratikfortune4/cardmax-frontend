import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  if (!firebaseConfig.apiKey) return null;
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getFirebaseMessaging(): Messaging | null {
  const app = getFirebaseApp();
  if (!app) return null;
  
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    return getMessaging(app);
  }
  return null;
}
