import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types';

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns yesterday's date formatted as YYYY-MM-DD
 */
export const getYesterdayDateString = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Process genuine student learning activity for streak tracking.
 * Strictly checks consecutive active dates.
 */
export const recordLearningActivity = async (uid: string): Promise<{
  streakUpdated: boolean;
  newStreak: number;
  longestStreak: number;
}> => {
  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    return { streakUpdated: false, newStreak: 0, longestStreak: 0 };
  }

  const profile = userSnap.data() as UserProfile;
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  let newStreak = profile.streak || 0;
  let newLongest = profile.longestStreak || 0;
  let streakUpdated = false;

  if (!profile.lastActiveDate) {
    // First ever activity
    newStreak = 1;
    newLongest = Math.max(newLongest, 1);
    streakUpdated = true;
  } else if (profile.lastActiveDate === today) {
    // Already active today, maintain streak without artificial increment
    return { streakUpdated: false, newStreak, longestStreak: newLongest };
  } else if (profile.lastActiveDate === yesterday) {
    // Consecutive day activity!
    newStreak = (profile.streak || 0) + 1;
    newLongest = Math.max(newLongest, newStreak);
    streakUpdated = true;
  } else {
    // Missed one or more days, streak resets to 1
    newStreak = 1;
    newLongest = Math.max(newLongest, 1);
    streakUpdated = true;
  }

  await updateDoc(userDocRef, {
    lastActiveDate: today,
    streak: newStreak,
    longestStreak: newLongest,
    updatedAt: new Date().toISOString(),
  });

  return { streakUpdated, newStreak, longestStreak: newLongest };
};
