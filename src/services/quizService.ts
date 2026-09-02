import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Quiz,
  Question,
  QuizAttempt,
  QuizAttemptAnswer,
  TingkatanType,
  Subject,
} from '../types';
import { recordLearningActivity } from './streakService';
import { awardUserXp } from './xpService';
import { getPublishedSubjects } from './contentService';

export { getPublishedSubjects };

// ==========================================
// QUIZZES
// ==========================================

export const getPublishedQuizzes = async (
  filtersOrSubjectId?: { subjectId?: string; tingkatan?: TingkatanType } | string,
  tingkatanParam?: TingkatanType
): Promise<Quiz[]> => {
  try {
    let q = query(collection(db, 'quizzes'), where('published', '==', true));

    let subjectId: string | undefined;
    let tingkatan: TingkatanType | undefined;

    if (typeof filtersOrSubjectId === 'string') {
      subjectId = filtersOrSubjectId;
      tingkatan = tingkatanParam;
    } else if (filtersOrSubjectId) {
      subjectId = filtersOrSubjectId.subjectId;
      tingkatan = filtersOrSubjectId.tingkatan;
    }

    if (subjectId) {
      q = query(q, where('subjectId', '==', subjectId));
    }
    if (tingkatan) {
      q = query(q, where('tingkatan', '==', tingkatan));
    }

    const snap = await getDocs(q);
    const quizzes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz));
    return quizzes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching published quizzes:', error);
    return [];
  }
};

export const getQuizById = async (quizId: string): Promise<Quiz | null> => {
  try {
    const docRef = doc(db, 'quizzes', quizId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Quiz;
  } catch (error) {
    console.error('Error fetching quiz by id:', error);
    return null;
  }
};

// ==========================================
// QUESTIONS
// ==========================================

export const getQuizQuestions = async (quizId: string): Promise<Question[]> => {
  try {
    const q = query(
      collection(db, 'questions'),
      where('quizId', '==', quizId)
    );
    const snap = await getDocs(q);
    const questions = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question));
    return questions.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return [];
  }
};

// ==========================================
// QUIZ ATTEMPTS & EVALUATION
// ==========================================

export interface SubmitQuizPayload {
  uid: string;
  studentName: string;
  studentUsername: string;
  quizId: string;
  quizTitle: string;
  subjectName: string;
  tingkatan: TingkatanType;
  startedAt: string;
  rawAnswers: Record<string, string | number>;
  timeTakenSeconds?: number;
}

export async function submitQuizAttempt(
  arg1: SubmitQuizPayload | string,
  studentUsername?: string,
  quizObj?: Quiz,
  questionsList?: Question[],
  userAnswers?: Record<string, any>,
  timeSpentSeconds?: number
): Promise<QuizAttempt> {
  let uid: string;
  let studentName: string;
  let sUsername: string;
  let quizId: string;
  let quizTitle: string;
  let subjectName: string;
  let tingkatan: TingkatanType;
  let startedAt: string;
  let rawAnswers: Record<string, string | number>;
  let questions: Question[];
  let quiz: Quiz | null;
  let timeTaken = 0;

  if (typeof arg1 === 'object') {
    uid = arg1.uid;
    studentName = arg1.studentName || arg1.studentUsername;
    sUsername = arg1.studentUsername;
    quizId = arg1.quizId;
    quizTitle = arg1.quizTitle;
    subjectName = arg1.subjectName;
    tingkatan = arg1.tingkatan;
    startedAt = arg1.startedAt || new Date().toISOString();
    rawAnswers = arg1.rawAnswers || {};
    timeTaken = arg1.timeTakenSeconds || 60;

    questions = await getQuizQuestions(quizId);
    quiz = await getQuizById(quizId);
  } else {
    uid = arg1;
    sUsername = studentUsername || 'pelajar';
    studentName = sUsername;
    quiz = quizObj || null;
    quizId = quizObj?.id || '';
    quizTitle = quizObj?.title || 'Kuiz KSSM';
    subjectName = quizObj?.subjectName || 'Subjek';
    tingkatan = quizObj?.tingkatan || 'Tingkatan 1';
    startedAt = new Date().toISOString();
    rawAnswers = userAnswers || {};
    questions = questionsList || (await getQuizQuestions(quizId));
    timeTaken = timeSpentSeconds || 60;
  }

  let totalScore = 0;
  let maxPossibleMarks = 0;
  const evaluatedAnswers: Record<string, QuizAttemptAnswer> = {};

  questions.forEach((q) => {
    const questionMarks = q.marks || 1;
    maxPossibleMarks += questionMarks;
    const studentAns = rawAnswers[q.id];

    let isCorrect = false;
    let marksEarned = 0;

    if (q.type === 'objective') {
      if (
        studentAns !== undefined &&
        String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
      ) {
        isCorrect = true;
        marksEarned = questionMarks;
      }
    } else {
      if (
        studentAns !== undefined &&
        String(studentAns).trim().length > 0
      ) {
        const studentText = String(studentAns).trim().toLowerCase();
        const correctText = String(q.correctAnswer).trim().toLowerCase();
        if (studentText === correctText || (correctText.length > 3 && studentText.includes(correctText))) {
          isCorrect = true;
          marksEarned = questionMarks;
        } else {
          isCorrect = false;
          marksEarned = 0;
        }
      }
    }

    totalScore += marksEarned;
    evaluatedAnswers[q.id] = {
      questionId: q.id,
      studentAnswer: studentAns ?? '',
      isCorrect,
      marksEarned,
      maxMarks: questionMarks,
    };
  });

  const percentage = maxPossibleMarks > 0 ? Math.round((totalScore / maxPossibleMarks) * 100) : 0;
  const passThreshold = quiz?.passPercentage || 50;
  const isPassed = percentage >= passThreshold;
  const isPerfect = percentage === 100;

  let xpEarned = 0;
  if (isPerfect) {
    xpEarned = 100;
  } else if (isPassed) {
    xpEarned = 50;
  } else {
    xpEarned = 15;
  }

  const submittedAt = new Date().toISOString();

  const attemptData: Omit<QuizAttempt, 'id'> = {
    uid,
    studentName,
    studentUsername: sUsername,
    quizId,
    quizTitle,
    subjectName,
    tingkatan,
    startedAt,
    submittedAt,
    score: totalScore,
    totalMarks: maxPossibleMarks,
    percentage,
    status: isPassed ? 'passed' : 'failed',
    answers: evaluatedAnswers,
    xpEarned,
  };

  const docRef = await addDoc(collection(db, 'quizAttempts'), attemptData);

  // Update student streak
  await recordLearningActivity(uid);

  // Award XP
  await awardUserXp(uid, xpEarned, 'quiz');

  return {
    id: docRef.id,
    ...attemptData,
  };
}

export const getUserQuizAttempts = async (uid: string): Promise<QuizAttempt[]> => {
  try {
    const q = query(
      collection(db, 'quizAttempts'),
      where('uid', '==', uid)
    );
    const snap = await getDocs(q);
    const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizAttempt));
    return attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    console.error('Error fetching user quiz attempts:', error);
    return [];
  }
};

export const getAllQuizAttemptsAdmin = async (): Promise<QuizAttempt[]> => {
  try {
    const q = query(collection(db, 'quizAttempts'));
    const snap = await getDocs(q);
    const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizAttempt));
    return attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    console.error('Error fetching all quiz attempts (admin):', error);
    return [];
  }
};
