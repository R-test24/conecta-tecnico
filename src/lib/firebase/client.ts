import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const useEmulators = process.env.NODE_ENV === "development"
  && process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true";
export const firebaseConfigured = useEmulators || Object.values(config).every(Boolean);

export function getFirebaseClient() {
  if (!firebaseConfigured) return null;
  const existing = getApps().find(item => item.name === "conecta-tecnico");
  const options = useEmulators ? { apiKey: "demo-key", projectId: "demo-conecta-tecnico" } : config;
  const app = existing ?? initializeApp(options, "conecta-tecnico");
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  if (useEmulators && !existing) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  }
  return { auth, firestore, storage: getStorage(app) };
}
