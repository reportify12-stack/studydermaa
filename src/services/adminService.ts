import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  UserProfile,
  Subject,
  Chapter,
  Topic,
  Note,
  Quiz,
  Question,
  Announcement,
  QuizAttempt,
  PlatformStats,
  KSSM_DEFAULT_SUBJECTS,
  TingkatanType,
} from '../types';
import { getTodayDateString } from './streakService';

// ==========================================
// REAL PLATFORM STATISTICS (CALCULATED LIVE)
// ==========================================

export const getRealPlatformStats = async (): Promise<PlatformStats> => {
  try {
    const today = getTodayDateString();

    // 1. Students count
    const usersSnap = await getDocs(collection(db, 'users'));
    const allUsers = usersSnap.docs.map((d) => d.data() as UserProfile);
    const students = allUsers.filter((u) => u.role === 'student');
    const totalStudents = students.length;
    const activeStudentsToday = students.filter((u) => u.lastActiveDate === today).length;

    // 2. Subjects count
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    const totalSubjects = subjectsSnap.size;

    // 3. Notes count
    const notesSnap = await getDocs(collection(db, 'notes'));
    const totalNotes = notesSnap.size;

    // 4. Quizzes count
    const quizzesSnap = await getDocs(collection(db, 'quizzes'));
    const totalQuizzes = quizzesSnap.size;

    // 5. Quiz Attempts & Average Score
    const attemptsSnap = await getDocs(collection(db, 'quizAttempts'));
    const attempts = attemptsSnap.docs.map((d) => d.data() as QuizAttempt);
    const totalQuizAttempts = attempts.length;

    let averageQuizScore = 0;
    if (totalQuizAttempts > 0) {
      const sumPercentage = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
      averageQuizScore = Math.round(sumPercentage / totalQuizAttempts);
    }

    return {
      totalStudents,
      activeStudentsToday,
      totalSubjects,
      totalNotes,
      totalQuizzes,
      totalQuizAttempts,
      averageQuizScore,
    };
  } catch (error) {
    console.error('Error calculating real platform stats:', error);
    return {
      totalStudents: 0,
      activeStudentsToday: 0,
      totalSubjects: 0,
      totalNotes: 0,
      totalQuizzes: 0,
      totalQuizAttempts: 0,
      averageQuizScore: 0,
    };
  }
};

export const getAdminStatistics = getRealPlatformStats;

// ==========================================
// USER & STUDENT MANAGEMENT
// ==========================================

export const getAllUsersAdmin = async (): Promise<UserProfile[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list = snap.docs.map((d) => {
      const data = d.data() as UserProfile;
      return {
        ...data,
        status: (data.isSuspended ? 'suspended' : 'active') as 'active' | 'suspended',
      };
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching all users for admin:', error);
    return [];
  }
};

export const getAdminStudents = getAllUsersAdmin;

export const toggleUserSuspension = async (uid: string, currentStatus: boolean): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isSuspended: !currentStatus,
    updatedAt: new Date().toISOString(),
  });
};

export const setStudentStatus = async (uid: string, status: 'active' | 'suspended'): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isSuspended: status === 'suspended',
    updatedAt: new Date().toISOString(),
  });
};

export const updateUserRole = async (uid: string, newRole: 'student' | 'admin'): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role: newRole,
    updatedAt: new Date().toISOString(),
  });
};

export const setStudentRole = updateUserRole;

// ==========================================
// SUBJECT CRUD
// ==========================================

export const getAdminSubjects = async (): Promise<Subject[]> => {
  try {
    const querySnap = await getDocs(collection(db, 'subjects'));
    const subjects = querySnap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
    return subjects.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching admin subjects:', error);
    return [];
  }
};

export const createSubject = async (
  subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Subject> => {
  const now = new Date().toISOString();
  const payload = {
    ...subjectData,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await addDoc(collection(db, 'subjects'), payload);
  return { id: docRef.id, ...payload };
};

export const updateSubject = async (
  id: string,
  subjectData: Partial<Subject>
): Promise<void> => {
  const docRef = doc(db, 'subjects', id);
  await updateDoc(docRef, {
    ...subjectData,
    updatedAt: new Date().toISOString(),
  });
};

export const saveSubject = async (subject: Partial<Subject> & { id?: string }): Promise<void> => {
  const now = new Date().toISOString();
  if (subject.id) {
    const docRef = doc(db, 'subjects', subject.id);
    await updateDoc(docRef, {
      ...subject,
      updatedAt: now,
    });
  } else {
    const payload = {
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || '',
      iconName: subject.iconName || 'BookOpen',
      category: subject.category || 'Teras',
      tingkatanList: subject.tingkatanList || ['Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'],
      order: subject.order || 1,
      published: subject.published ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await addDoc(collection(db, 'subjects'), payload);
  }
};

export const deleteSubject = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'subjects', id));
};

export const initializeKssmSubjects = async (): Promise<number> => {
  const existing = await getDocs(collection(db, 'subjects'));
  if (!existing.empty) {
    return 0;
  }

  const batch = writeBatch(db);
  const now = new Date().toISOString();
  let count = 0;

  for (let i = 0; i < KSSM_DEFAULT_SUBJECTS.length; i++) {
    const item = KSSM_DEFAULT_SUBJECTS[i];
    const newDocRef = doc(collection(db, 'subjects'));
    batch.set(newDocRef, {
      name: item.name,
      code: item.code,
      description: `Mata pelajaran kurikulum standard ${item.name} KSSM Malaysia.`,
      iconName: item.icon,
      category: item.category,
      tingkatanList: ['Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'] as TingkatanType[],
      order: i + 1,
      published: true,
      createdAt: now,
      updatedAt: now,
    });
    count++;
  }

  await batch.commit();
  return count;
};

export const seedStandardKSSMSubjects = initializeKssmSubjects;

// ==========================================
// NOTES CRUD
// ==========================================

export const getAdminNotes = async (): Promise<Note[]> => {
  try {
    const snap = await getDocs(collection(db, 'notes'));
    const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching admin notes:', error);
    return [];
  }
};

export const saveNote = async (data: Partial<Note> & { id?: string }): Promise<void> => {
  const now = new Date().toISOString();
  if (data.id) {
    const docRef = doc(db, 'notes', data.id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: now,
    });
  } else {
    const payload = {
      title: data.title || '',
      subjectId: data.subjectId || '',
      subjectName: data.subjectName || '',
      tingkatan: data.tingkatan || 'Tingkatan 1',
      chapterTitle: data.chapterTitle || '',
      summary: data.summary || '',
      content: data.content || '',
      keyPoints: data.keyPoints || [],
      readTimeMinutes: data.readTimeMinutes || 5,
      published: data.published ?? true,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    await addDoc(collection(db, 'notes'), payload);
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'notes', id));
};

// ==========================================
// QUIZ & QUESTION CRUD
// ==========================================

export const getAdminQuizzes = async (): Promise<Quiz[]> => {
  try {
    const snap = await getDocs(collection(db, 'quizzes'));
    const quizzes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz));
    return quizzes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching admin quizzes:', error);
    return [];
  }
};

export const saveQuiz = async (data: Partial<Quiz> & { id?: string }): Promise<void> => {
  const now = new Date().toISOString();
  if (data.id) {
    const docRef = doc(db, 'quizzes', data.id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: now,
    });
  } else {
    const payload = {
      title: data.title || '',
      subjectId: data.subjectId || '',
      subjectName: data.subjectName || '',
      tingkatan: data.tingkatan || 'Tingkatan 1',
      description: data.description || '',
      durationMinutes: data.durationMinutes || 15,
      totalMarks: data.totalMarks || 20,
      questionCount: 0,
      passPercentage: data.passPercentage || 50,
      published: data.published ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await addDoc(collection(db, 'quizzes'), payload);
  }
};

export const deleteQuiz = async (id: string): Promise<void> => {
  const qSnap = await getDocs(query(collection(db, 'questions'), where('quizId', '==', id)));
  const batch = writeBatch(db);
  qSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'quizzes', id));
  await batch.commit();
};

export const getQuizQuestions = async (quizId: string): Promise<Question[]> => {
  try {
    const q = query(collection(db, 'questions'), where('quizId', '==', quizId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question));
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

export const saveQuestion = async (
  quizId: string,
  data: Partial<Question> & { id?: string; questionText?: string }
): Promise<void> => {
  const now = new Date().toISOString();
  const qText = data.question || data.questionText || '';

  if (data.id) {
    const docRef = doc(db, 'questions', data.id);
    await updateDoc(docRef, {
      ...data,
      question: qText,
      updatedAt: now,
    });
  } else {
    const payload = {
      quizId,
      question: qText,
      type: data.type || 'objective',
      options: data.options || [],
      correctAnswer: data.correctAnswer ?? 'A',
      marks: data.marks || 1,
      explanation: data.explanation || '',
      order: data.order || 1,
      createdAt: now,
    };
    await addDoc(collection(db, 'questions'), payload);

    // Update quiz stats
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      const qCount = (quizSnap.data().questionCount || 0) + 1;
      const currentTotalMarks = (quizSnap.data().totalMarks || 0) + (data.marks || 1);
      await updateDoc(quizRef, {
        questionCount: qCount,
        totalMarks: currentTotalMarks,
        updatedAt: now,
      });
    }
  }
};

export const deleteQuestion = async (questionId: string, quizId: string, marks?: number): Promise<void> => {
  await deleteDoc(doc(db, 'questions', questionId));
  const quizRef = doc(db, 'quizzes', quizId);
  const quizSnap = await getDoc(quizRef);
  if (quizSnap.exists()) {
    const qCount = Math.max(0, (quizSnap.data().questionCount || 1) - 1);
    const totalMarks = Math.max(0, (quizSnap.data().totalMarks || (marks || 1)) - (marks || 1));
    await updateDoc(quizRef, {
      questionCount: qCount,
      totalMarks,
      updatedAt: new Date().toISOString(),
    });
  }
};

export const getAllQuizAttemptsAdmin = async (maxCount = 100): Promise<QuizAttempt[]> => {
  try {
    const q = query(collection(db, 'quizAttempts'), limit(maxCount));
    const snap = await getDocs(q);
    const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizAttempt));
    return attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    console.error('Error fetching admin quiz attempts:', error);
    return [];
  }
};

export const getAdminQuizAttempts = getAllQuizAttemptsAdmin;

// ==========================================
// ANNOUNCEMENTS CRUD
// ==========================================

export const getAdminAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching admin announcements:', error);
    return [];
  }
};

export const saveAnnouncement = async (
  data: Partial<Announcement> & { id?: string }
): Promise<void> => {
  const now = new Date().toISOString();
  if (data.id) {
    const docRef = doc(db, 'announcements', data.id);
    await updateDoc(docRef, { ...data });
  } else {
    const payload = {
      title: data.title || '',
      content: data.content || '',
      badge: data.badge || 'PENTING',
      published: data.published ?? true,
      authorName: 'Pentadbir',
      createdAt: now,
    };
    await addDoc(collection(db, 'announcements'), payload);
  }
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'announcements', id));
};
