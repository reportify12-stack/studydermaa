import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfigFallback from '../../firebase-applet-config.json';

// Configuration priority:
// 1. Vite environment variables (VITE_FIREBASE_*)
// 2. Provisioned firebase-applet-config.json

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFallback.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFallback.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFallback.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFallback.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFallback.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFallback.appId || '',
};

// Initialize Firebase Services
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

// Initialize Firestore with resilient auto-detect long polling & multi-tab cache
let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  db = getFirestore(app);
}

const storage: FirebaseStorage = getStorage(app);

/**
 * Diagnostic helper to verify live Firebase Auth and Firestore connectivity
 */
export async function verifyFirebaseConnection(): Promise<{
  connected: boolean;
  projectId: string;
  databaseId?: string;
  authReady: boolean;
  error?: string;
}> {
  try {
    const isAuthReady = !!auth;
    const isDbReady = !!db;
    return {
      connected: isAuthReady && isDbReady,
      projectId: firebaseConfig.projectId,
      databaseId: '(default)',
      authReady: isAuthReady,
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: firebaseConfig.projectId,
      authReady: false,
      error: err?.message || String(err),
    };
  }
}

export { app, auth, db, storage, firebaseConfig };
