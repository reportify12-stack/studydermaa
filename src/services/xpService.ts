import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types';

export interface LevelTier {
  level: number;
  minXp: number;
  title: string;
  badgeColor: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, minXp: 0, title: 'Pemula KSSM', badgeColor: 'bg-stone-100 text-stone-700' },
  { level: 2, minXp: 100, title: 'Pelajar Gigih', badgeColor: 'bg-emerald-100 text-emerald-700' },
  { level: 3, minXp: 250, title: 'Pencari Ilmu', badgeColor: 'bg-sky-100 text-sky-700' },
  { level: 4, minXp: 500, title: 'Celik KSSM', badgeColor: 'bg-blue-100 text-blue-700' },
  { level: 5, minXp: 850, title: 'Bintang Kelas', badgeColor: 'bg-purple-100 text-purple-700' },
  { level: 6, minXp: 1300, title: 'Jaguh Akademik', badgeColor: 'bg-pink-100 text-pink-700' },
  { level: 7, minXp: 1900, title: 'Sarjana Muda', badgeColor: 'bg-amber-100 text-amber-700' },
  { level: 8, minXp: 2600, title: 'Pakar Subjek', badgeColor: 'bg-orange-100 text-orange-700' },
  { level: 9, minXp: 3500, title: 'Pendeta Ilmu', badgeColor: 'bg-indigo-100 text-indigo-700' },
  { level: 10, minXp: 4600, title: 'Mahaguru KSSM', badgeColor: 'bg-teal-100 text-teal-700' },
];

export const calculateLevelFromXp = (xp: number): {
  level: number;
  title: string;
  currentLevelMinXp: number;
  nextLevelMinXp: number;
  progressPercent: number;
  badgeColor: string;
} => {
  let currentTier = LEVEL_TIERS[0];
  let nextTier: LevelTier | null = LEVEL_TIERS[1];

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      currentTier = LEVEL_TIERS[i];
      nextTier = LEVEL_TIERS[i + 1] || null;
      break;
    }
  }

  const currentLevelMinXp = currentTier.minXp;
  const nextLevelMinXp = nextTier ? nextTier.minXp : currentTier.minXp + 1500;
  const range = nextLevelMinXp - currentLevelMinXp;
  const gained = xp - currentLevelMinXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));

  return {
    level: currentTier.level,
    title: currentTier.title,
    currentLevelMinXp,
    nextLevelMinXp,
    progressPercent,
    badgeColor: currentTier.badgeColor,
  };
};

/**
 * Award XP to a student when completing genuine activities (note read, quiz passed)
 */
export const awardUserXp = async (
  uid: string,
  xpEarned: number,
  category: 'note' | 'quiz'
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> => {
  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    return { newXp: 0, newLevel: 1, leveledUp: false };
  }

  const profile = userSnap.data() as UserProfile;
  const oldXp = profile.xp || 0;
  const oldLevel = profile.level || 1;
  const newXp = oldXp + xpEarned;
  const levelInfo = calculateLevelFromXp(newXp);
  const newLevel = levelInfo.level;
  const leveledUp = newLevel > oldLevel;

  const updatePayload: Record<string, any> = {
    xp: newXp,
    level: newLevel,
    updatedAt: new Date().toISOString(),
  };

  if (category === 'note') {
    updatePayload.completedNotesCount = increment(1);
  } else if (category === 'quiz') {
    updatePayload.completedQuizzesCount = increment(1);
  }

  await updateDoc(userDocRef, updatePayload);

  return {
    newXp,
    newLevel,
    leveledUp,
  };
};
