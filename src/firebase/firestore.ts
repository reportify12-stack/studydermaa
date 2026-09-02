import {
  Firestore,
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
  DocumentReference,
  CollectionReference,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Handle Firestore errors with contextual diagnostics
 */
export function handleFirestoreError(error: unknown, context?: string): never {
  if (error && typeof error === 'object' && 'code' in error) {
    const fsError = error as FirestoreError;
    const msg = `[Firestore Error${context ? ` in ${context}` : ''}] ${fsError.code}: ${fsError.message}`;
    console.error(msg, fsError);
    throw new Error(msg);
  }
  console.error(`[Unexpected Error${context ? ` in ${context}` : ''}]`, error);
  throw error instanceof Error ? error : new Error(String(error));
}

/**
 * Generic typed collection reference helper
 */
export const getTypedCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

/**
 * Generic typed document reference helper
 */
export const getTypedDoc = <T = DocumentData>(collectionName: string, docId: string) => {
  return doc(db, collectionName, docId) as DocumentReference<T>;
};

export {
  db,
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
};
