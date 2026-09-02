import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Subject,
  Chapter,
  Topic,
  Note,
  UserNoteProgress,
  Announcement,
  TingkatanType,
} from '../types';
import { recordLearningActivity } from './streakService';
import { awardUserXp } from './xpService';

// ==========================================
// SUBJECTS
// ==========================================

export const getPublishedSubjects = async (): Promise<Subject[]> => {
  try {
    const q = query(collection(db, 'subjects'), where('published', '==', true));
    const querySnap = await getDocs(q);
    const subjects = querySnap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
    return subjects.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

export const getAllSubjectsAdmin = async (): Promise<Subject[]> => {
  try {
    const querySnap = await getDocs(collection(db, 'subjects'));
    const subjects = querySnap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
    return subjects.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching all subjects (admin):', error);
    return [];
  }
};

// ==========================================
// CHAPTERS & TOPICS
// ==========================================

export const getChaptersBySubject = async (
  subjectId: string,
  tingkatan?: TingkatanType
): Promise<Chapter[]> => {
  try {
    let q = query(
      collection(db, 'chapters'),
      where('subjectId', '==', subjectId),
      where('published', '==', true)
    );
    if (tingkatan) {
      q = query(q, where('tingkatan', '==', tingkatan));
    }
    const snap = await getDocs(q);
    const chapters = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chapter));
    return chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

export const getTopicsByChapter = async (chapterId: string): Promise<Topic[]> => {
  try {
    const q = query(
      collection(db, 'topics'),
      where('chapterId', '==', chapterId),
      where('published', '==', true)
    );
    const snap = await getDocs(q);
    const topics = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Topic));
    return topics.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
};

// ==========================================
// NOTES
// ==========================================

export const getPublishedNotes = async (filters?: {
  subjectId?: string;
  tingkatan?: TingkatanType;
  chapterId?: string;
  searchQuery?: string;
}): Promise<Note[]> => {
  try {
    let q = query(collection(db, 'notes'), where('published', '==', true));
    
    if (filters?.subjectId) {
      q = query(q, where('subjectId', '==', filters.subjectId));
    }
    if (filters?.tingkatan) {
      q = query(q, where('tingkatan', '==', filters.tingkatan));
    }
    if (filters?.chapterId) {
      q = query(q, where('chapterId', '==', filters.chapterId));
    }

    const snap = await getDocs(q);
    let notes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note));

    // Client-side text search filtering for instant response without heavy index requirements
    if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
      const sq = filters.searchQuery.trim().toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(sq) ||
          n.summary.toLowerCase().includes(sq) ||
          n.subjectName.toLowerCase().includes(sq) ||
          (n.keyPoints && n.keyPoints.some((kp) => kp.toLowerCase().includes(sq)))
      );
    }

    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const getNoteById = async (noteId: string): Promise<Note | null> => {
  try {
    const docRef = doc(db, 'notes', noteId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Note;
  } catch (error) {
    console.error('Error fetching note by id:', error);
    return null;
  }
};

// ==========================================
// USER PROGRESS & BOOKMARKS
// ==========================================

export const getUserNoteProgress = async (
  uid: string,
  noteId: string
): Promise<UserNoteProgress | null> => {
  try {
    const progressRef = doc(db, 'userProgress', uid, 'notes', noteId);
    const snap = await getDoc(progressRef);
    if (snap.exists()) {
      return snap.data() as UserNoteProgress;
    }
    return null;
  } catch (error) {
    console.error('Error fetching note progress:', error);
    return null;
  }
};

export const getAllUserNoteProgress = async (
  uid: string
): Promise<Record<string, UserNoteProgress>> => {
  try {
    const progressCol = collection(db, 'userProgress', uid, 'notes');
    const snap = await getDocs(progressCol);
    const result: Record<string, UserNoteProgress> = {};
    snap.docs.forEach((d) => {
      result[d.id] = d.data() as UserNoteProgress;
    });
    return result;
  } catch (error) {
    console.error('Error fetching all user note progress:', error);
    return {};
  }
};

export const markNoteCompleted = async (
  uid: string,
  noteId: string
): Promise<{ xpAwarded: number; leveledUp: boolean }> => {
  const progressRef = doc(db, 'userProgress', uid, 'notes', noteId);
  const snap = await getDoc(progressRef);

  const isAlreadyCompleted = snap.exists() && snap.data().completed === true;

  if (isAlreadyCompleted) {
    return { xpAwarded: 0, leveledUp: false };
  }

  const now = new Date().toISOString();
  await setDoc(
    progressRef,
    {
      noteId,
      completed: true,
      completionDate: now,
      lastViewed: now,
    },
    { merge: true }
  );

  // Record daily streak
  await recordLearningActivity(uid);

  // Award +25 XP for completing a lesson note
  const xpResult = await awardUserXp(uid, 25, 'note');

  return { xpAwarded: 25, leveledUp: xpResult.leveledUp };
};

export const toggleNoteBookmark = async (
  uid: string,
  noteId: string,
  currentBookmarked: boolean
): Promise<boolean> => {
  const newBookmarked = !currentBookmarked;
  const progressRef = doc(db, 'userProgress', uid, 'notes', noteId);
  const userRef = doc(db, 'users', uid);

  await setDoc(
    progressRef,
    {
      noteId,
      bookmarked: newBookmarked,
      lastViewed: new Date().toISOString(),
    },
    { merge: true }
  );

  if (newBookmarked) {
    await updateDoc(userRef, {
      bookmarks: arrayUnion(noteId),
    });
  } else {
    await updateDoc(userRef, {
      bookmarks: arrayRemove(noteId),
    });
  }

  return newBookmarked;
};

// ==========================================
// ANNOUNCEMENTS
// ==========================================

export const getPublishedAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const q = query(
      collection(db, 'announcements'),
      where('published', '==', true)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};
