import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdTokenResult,
  IdTokenResult,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, UsernameRecord, TingkatanType, UserRole } from '../types';

export interface RegisterStudentData {
  fullName: string;
  username: string;
  password: string;
  tingkatan: TingkatanType;
  email?: string;
  school?: string;
}

/**
 * Format Firebase Auth errors into clear Bahasa Melayu messages
 */
export const formatFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Format emel atau username tidak sah.';
    case 'auth/user-disabled':
      return 'Akaun ini telah digantung atau dinyahaktifkan oleh pihak pentadbir.';
    case 'auth/user-not-found':
      return 'Akaun tidak dijumpai. Sila pastikan username/emel anda betul atau daftar akaun baru.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Kata laluan atau username tidak tepat. Sila semak semula.';
    case 'auth/email-already-in-use':
      return 'Emel ini telah digunakan oleh akaun lain.';
    case 'auth/weak-password':
      return 'Kata laluan terlalu lemah. Sila gunakan sekurang-kurangnya 8 aksara.';
    case 'auth/too-many-requests':
      return 'Akses disekat sementara akibat terlalu banyak percubaan gagal. Sila tunggu sebentar.';
    case 'auth/network-request-failed':
      return 'Ralat sambungan internet. Sila semak talian anda.';
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Akses ditolak. Anda tidak mempunyai kebenaran untuk melakukan operasi ini.';
    default:
      return 'Berlaku ralat semasa memproses permintaan. Sila cuba lagi.';
  }
};

/**
 * Validate username: alphanumeric and underscore only, 3 to 20 chars
 */
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username mestilah sekurang-kurangnya 3 aksara.' };
  }
  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username tidak boleh melebihi 20 aksara.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { isValid: false, error: 'Username hanya boleh mengandungi huruf, nombor, dan garis bawah (_).' };
  }
  return { isValid: true };
};

/**
 * Check if a username is available in usernameRegistry
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const usernameLower = username.trim().toLowerCase();
  try {
    const registryRef = doc(db, 'usernameRegistry', usernameLower);
    const registrySnap = await getDoc(registryRef);
    return !registrySnap.exists();
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

/**
 * Register a new student account
 * Strictly enforces zero-stat initialization and student role
 */
export const registerStudent = async (data: RegisterStudentData): Promise<UserProfile> => {
  const usernameLower = data.username.trim().toLowerCase();

  // 1. Client validation
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.isValid) {
    throw new Error(usernameValidation.error);
  }

  if (data.fullName.trim().length < 2) {
    throw new Error('Nama penuh mestilah sekurang-kurangnya 2 aksara.');
  }

  if (data.password.length < 8) {
    throw new Error('Kata laluan mestilah sekurang-kurangnya 8 aksara.');
  }

  // 2. Check username availability in Firestore
  const isAvailable = await checkUsernameAvailability(usernameLower);
  if (!isAvailable) {
    throw new Error('Username ini telah digunakan. Sila pilih username lain.');
  }

  // 3. Determine unique Firebase Auth email
  const authEmail = data.email && data.email.includes('@')
    ? data.email.trim().toLowerCase()
    : `${usernameLower}@auth.study.dermaa.internal`;

  // 4. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, authEmail, data.password);
  const user = userCredential.user;

  // 5. Create Username Registry Document
  const registryDoc: UsernameRecord = {
    uid: user.uid,
    authEmail: authEmail,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'usernameRegistry', usernameLower), registryDoc);

  // 6. Create User Profile in Firestore
  // CRITICAL: initial stats are genuinely zero, role is strictly 'student'
  const userProfile: UserProfile = {
    uid: user.uid,
    username: data.username.trim(),
    usernameLowercase: usernameLower,
    fullName: data.fullName.trim(),
    email: data.email?.trim() || '',
    authEmail: authEmail,
    school: data.school?.trim() || '',
    tingkatan: data.tingkatan,
    role: 'student', // ALWAYS student on registration
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    completedNotesCount: 0,
    completedQuizzesCount: 0,
    bookmarks: [],
    themePreference: 'pastel-green',
    colorMode: 'light',
    isSuspended: false,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);

  return userProfile;
};

/**
 * Login with username OR email and password
 */
export const loginUser = async (identifier: string, password: string): Promise<UserProfile> => {
  const cleanIdentifier = identifier.trim();
  let targetAuthEmail = cleanIdentifier;

  // If identifier doesn't contain '@', resolve username to authEmail via registry
  if (!cleanIdentifier.includes('@')) {
    const usernameLower = cleanIdentifier.toLowerCase();
    const registryRef = doc(db, 'usernameRegistry', usernameLower);
    const registrySnap = await getDoc(registryRef);

    if (!registrySnap.exists()) {
      throw new Error('Username tidak dijumpai. Sila pastikan username betul atau daftar akaun baru.');
    }

    const registryData = registrySnap.data() as UsernameRecord;
    targetAuthEmail = registryData.authEmail;
  }

  // Sign in to Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, targetAuthEmail, password);
  const uid = userCredential.user.uid;

  // Fetch Firestore Profile
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // If auth succeeds but profile missing (e.g., initial administrator created via Firebase Console)
    const fallbackProfile: UserProfile = {
      uid: uid,
      username: userCredential.user.displayName || targetAuthEmail.split('@')[0],
      usernameLowercase: (userCredential.user.displayName || targetAuthEmail.split('@')[0]).toLowerCase(),
      fullName: userCredential.user.displayName || 'Pentadbir Sistem',
      email: targetAuthEmail,
      authEmail: targetAuthEmail,
      tingkatan: 'Tingkatan 1',
      role: 'student',
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      completedNotesCount: 0,
      completedQuizzesCount: 0,
      bookmarks: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, fallbackProfile);
    return fallbackProfile;
  }

  const profile = userDocSnap.data() as UserProfile;

  if (profile.isSuspended) {
    await signOut(auth);
    throw new Error('Akaun anda telah digantung oleh pihak pentadbir. Sila hubungi sokongan.');
  }

  return profile;
};

/**
 * Send password reset email
 */
export const resetUserPassword = async (emailOrUsername: string): Promise<void> => {
  let targetEmail = emailOrUsername.trim();

  if (!targetEmail.includes('@')) {
    const usernameLower = targetEmail.toLowerCase();
    const registryRef = doc(db, 'usernameRegistry', usernameLower);
    const registrySnap = await getDoc(registryRef);

    if (!registrySnap.exists()) {
      throw new Error('Username tidak dijumpai.');
    }

    const registryData = registrySnap.data() as UsernameRecord;
    targetEmail = registryData.authEmail;
  }

  if (targetEmail.endsWith('@auth.study.dermaa.internal')) {
    throw new Error('Akaun ini didaftarkan tanpa emel luaran. Sila hubungi guru atau pentadbir untuk penetapan semula kata laluan.');
  }

  await sendPasswordResetEmail(auth, targetEmail);
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Fetch profile by UID
 */
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Get Custom Claims and Token Result from Firebase User
 */
export const getUserClaims = async (user: FirebaseUser, forceRefresh = false): Promise<IdTokenResult | null> => {
  try {
    return await getIdTokenResult(user, forceRefresh);
  } catch (error) {
    console.error('Error getting user token claims:', error);
    return null;
  }
};

/**
 * Update editable profile details (students can edit name, school, tingkatan, theme)
 */
export const updateUserProfile = async (
  uid: string,
  data: Partial<Pick<UserProfile, 'fullName' | 'school' | 'tingkatan' | 'themePreference' | 'colorMode'>>
): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export {
  auth,
  onAuthStateChanged,
};
export type { FirebaseUser };
