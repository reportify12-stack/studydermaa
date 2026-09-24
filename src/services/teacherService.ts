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
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ClassRoom, Assignment, AssignmentSubmission, ClassStudent, TingkatanType } from '../types';

const CLASSES_COLLECTION = 'classes';
const ASSIGNMENTS_COLLECTION = 'assignments';
const SUBMISSIONS_COLLECTION = 'assignmentSubmissions';

/**
 * Generates an unambiguous 6-character alphanumeric join code (e.g., DRM4X2)
 */
export function generateJoinCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Fetch all classes owned by a specific teacher
 */
export async function fetchTeacherClasses(teacherId: string): Promise<ClassRoom[]> {
  try {
    const q = query(
      collection(db, CLASSES_COLLECTION),
      where('teacherId', '==', teacherId)
    );
    const snap = await getDocs(q);
    const classes: ClassRoom[] = [];
    snap.forEach((docSnap) => {
      classes.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ClassRoom, 'id'>),
      });
    });

    // Sort by createdAt descending
    classes.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return classes;
  } catch (err) {
    console.error('Failed to fetch teacher classes:', err);
    return [];
  }
}

/**
 * Create a new classroom
 */
export async function createClass(data: {
  name: string;
  subject: string;
  tingkatan: TingkatanType;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  schoolName: string;
  description?: string;
  section?: string;
}): Promise<ClassRoom> {
  const joinCode = generateJoinCode();
  const now = new Date().toISOString();

  const newClassData: Omit<ClassRoom, 'id'> = {
    name: data.name.trim(),
    subject: data.subject.trim(),
    tingkatan: data.tingkatan,
    teacherId: data.teacherId,
    teacherName: data.teacherName,
    teacherEmail: data.teacherEmail || '',
    schoolName: data.schoolName.trim() || 'SMK Derma',
    joinCode,
    description: data.description?.trim() || '',
    section: data.section?.trim() || '',
    studentIds: [],
    studentCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, CLASSES_COLLECTION), newClassData);
  return {
    id: docRef.id,
    ...newClassData,
  };
}

/**
 * Regenerate join code for a classroom
 */
export async function regenerateClassJoinCode(classId: string): Promise<string> {
  const newCode = generateJoinCode();
  const docRef = doc(db, CLASSES_COLLECTION, classId);
  await updateDoc(docRef, {
    joinCode: newCode,
    updatedAt: new Date().toISOString(),
  });
  return newCode;
}

/**
 * Delete classroom and its assignments
 */
export async function deleteClass(classId: string): Promise<void> {
  await deleteDoc(doc(db, CLASSES_COLLECTION, classId));

  // Clean up associated assignments
  try {
    const q = query(collection(db, ASSIGNMENTS_COLLECTION), where('classId', '==', classId));
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Could not cascade delete assignments for class:', err);
  }
}

/**
 * Fetch detailed student list for a class
 */
export async function fetchClassStudents(studentIds: string[]): Promise<ClassStudent[]> {
  if (!studentIds || studentIds.length === 0) return [];

  const students: ClassStudent[] = [];
  try {
    const promises = studentIds.map(async (uid) => {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          return {
            uid,
            fullName: userData.fullName || 'Pelajar',
            username: userData.username || 'pelajar',
            email: userData.email || userData.authEmail || '',
            school: userData.school || 'SMK Derma',
            tingkatan: userData.tingkatan || 'Tingkatan 4',
            joinedAt: userData.createdAt || '',
          } as ClassStudent;
        }
      } catch (e) {
        console.warn(`Could not load student profile for ${uid}:`, e);
      }
      return null;
    });

    const results = await Promise.all(promises);
    results.forEach((s) => {
      if (s) students.push(s);
    });
  } catch (err) {
    console.error('Error fetching students for class:', err);
  }

  return students;
}

/**
 * Fetch assignments created by a teacher
 */
export async function fetchTeacherAssignments(teacherId: string): Promise<Assignment[]> {
  try {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION),
      where('teacherId', '==', teacherId)
    );
    const snap = await getDocs(q);
    const list: Assignment[] = [];
    snap.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Assignment, 'id'>),
      });
    });

    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return list;
  } catch (err) {
    console.error('Failed to fetch teacher assignments:', err);
    return [];
  }
}

/**
 * Fetch assignments for a specific class
 */
export async function fetchClassAssignments(classId: string): Promise<Assignment[]> {
  try {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION),
      where('classId', '==', classId)
    );
    const snap = await getDocs(q);
    const list: Assignment[] = [];
    snap.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Assignment, 'id'>),
      });
    });
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return list;
  } catch (err) {
    console.error('Failed to fetch class assignments:', err);
    return [];
  }
}

/**
 * Create a new task / homework assignment
 */
export async function createAssignment(data: {
  classId: string;
  className: string;
  teacherId: string;
  title: string;
  description: string;
  deadline: string;
  points?: number;
  attachments?: { title: string; url: string }[];
}): Promise<Assignment> {
  const now = new Date().toISOString();
  const newAssignment: Omit<Assignment, 'id'> = {
    classId: data.classId,
    className: data.className,
    teacherId: data.teacherId,
    title: data.title.trim(),
    description: data.description.trim(),
    deadline: data.deadline,
    points: data.points || 100,
    attachments: data.attachments || [],
    submissionsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), newAssignment);
  return {
    id: docRef.id,
    ...newAssignment,
  };
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, assignmentId));
}

/**
 * Fetch submissions for an assignment
 */
export async function fetchAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('assignmentId', '==', assignmentId)
    );
    const snap = await getDocs(q);
    const submissions: AssignmentSubmission[] = [];
    snap.forEach((d) => {
      submissions.push({
        id: d.id,
        ...(d.data() as Omit<AssignmentSubmission, 'id'>),
      });
    });
    return submissions;
  } catch (err) {
    console.error('Failed to fetch assignment submissions:', err);
    return [];
  }
}

/**
 * Grade a student's submission
 */
export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string
): Promise<void> {
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  await updateDoc(docRef, {
    grade,
    feedback: feedback.trim(),
    status: 'graded',
    updatedAt: new Date().toISOString(),
  });
}

export interface JoinClassResult {
  success: boolean;
  classRoom?: ClassRoom;
  alreadyJoined?: boolean;
  error?: string;
}

/**
 * Allows a student to join a class using a 6-character class code.
 * 1. Queries classes collection where joinCode matches.
 * 2. Validates student isn't already a member.
 * 3. Updates class document with arrayUnion(studentUid) and increments studentCount.
 * 4. Updates student document in users collection with arrayUnion(classId).
 */
export async function joinClassByCode(
  classCode: string,
  studentUid: string
): Promise<JoinClassResult> {
  const cleanCode = classCode.trim().toUpperCase();

  if (!cleanCode) {
    return { success: false, error: 'Sila masukkan kod kelas.' };
  }

  if (!studentUid) {
    return { success: false, error: 'Pengguna tidak disahkan. Sila log masuk semula.' };
  }

  try {
    const q = query(
      collection(db, CLASSES_COLLECTION),
      where('joinCode', '==', cleanCode)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return {
        success: false,
        error: `Kod kelas "${cleanCode}" tidak dijumpai. Sila pastikan kod betul daripada guru anda.`,
      };
    }

    const classDocSnap = snap.docs[0];
    const classData = classDocSnap.data() as Omit<ClassRoom, 'id'>;
    const classId = classDocSnap.id;

    // Check if user is already enrolled
    const studentIds = classData.studentIds || [];
    if (studentIds.includes(studentUid)) {
      return {
        success: false,
        alreadyJoined: true,
        classRoom: { id: classId, ...classData },
        error: `Anda sudah pun menyertai kelas "${classData.name}".`,
      };
    }

    // 1. Update class doc: add studentUid to studentIds and increment count
    const classRef = doc(db, CLASSES_COLLECTION, classId);
    await updateDoc(classRef, {
      studentIds: arrayUnion(studentUid),
      studentCount: increment(1),
      updatedAt: new Date().toISOString(),
    });

    // 2. Update student doc in 'users' collection: add classId to joinedClasses array
    const userRef = doc(db, 'users', studentUid);
    await updateDoc(userRef, {
      joinedClasses: arrayUnion(classId),
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      classRoom: {
        id: classId,
        ...classData,
        studentIds: [...studentIds, studentUid],
        studentCount: (classData.studentCount || 0) + 1,
      },
    };
  } catch (err: any) {
    console.error('Error joining class by code:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyertai kelas. Sila cuba sebentar lagi.',
    };
  }
}

/**
 * Fetch all classes a student has joined
 */
export async function fetchStudentJoinedClasses(studentUid: string): Promise<ClassRoom[]> {
  if (!studentUid) return [];

  try {
    const q = query(
      collection(db, CLASSES_COLLECTION),
      where('studentIds', 'array-contains', studentUid)
    );
    const snap = await getDocs(q);
    const classes: ClassRoom[] = [];
    snap.forEach((docSnap) => {
      classes.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ClassRoom, 'id'>),
      });
    });

    classes.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return classes;
  } catch (err) {
    console.error('Failed to fetch student joined classes:', err);
    return [];
  }
}

