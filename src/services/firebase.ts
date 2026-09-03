import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  // @ts-expect-error — export existe no entry react-native; tipagem web não declara
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

const firebaseConfig = {
  apiKey: requireEnv(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    'EXPO_PUBLIC_FIREBASE_API_KEY',
  ),
  authDomain: requireEnv(
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  ),
  projectId: requireEnv(
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  ),
  storageBucket: requireEnv(
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  ),
  messagingSenderId: requireEnv(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  ),
  appId: requireEnv(
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    'EXPO_PUBLIC_FIREBASE_APP_ID',
  ),
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function createAuth(firebaseApp: FirebaseApp): Auth {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

const auth: Auth = createAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
