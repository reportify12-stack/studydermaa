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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Seminar, SeminarStatus } from '../types';

const COLLECTION_NAME = 'seminars';

// Initial sample seminars to seed if collection is empty
export const SAMPLE_SEMINARS: Omit<Seminar, 'id'>[] = [
  {
    title: 'Seminar Eksklusif SPM: Teknik Menjawab Kertas 2 Sains',
    description: 'Kupasan mendalam teknik menganalisis soalan kemahiran saintifik (KBAT), graf eksperimen, dan pembinaan hipotesis tepat bersama Guru Cemerlang KSSM.',
    date: new Date().toISOString().split('T')[0], // Today's date
    time: '20:30 - 22:00',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'live',
    speaker: 'Cikgu Noraini binti Yusof (Guru Cemerlang Sains Kebangsaan)',
    subject: 'Sains',
    tingkatan: 'Semua Tingkatan',
    targetAudience: 'Pelajar Tingkatan 4 & 5',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Klinik Skor A Matematik: Kuasai Graf Fungsi & Vektor',
    description: 'Sesi bimbingan intensif langkah demi langkah bagi tajuk-tajuk mencabar Tingkatan 4 & 5. Latihan berformat peperiksaan sebenar disediakan.',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // In 2 days
    time: '10:00 - 12:00',
    meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
    status: 'upcoming',
    speaker: 'Dr. Mohd Faizal (Pakar Kurikulum Matematik)',
    subject: 'Matematik',
    tingkatan: 'Tingkatan 5',
    targetAudience: 'Calon SPM 2026',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Bengkel Karangan Cemerlang Bahasa Melayu SPM',
    description: 'Format terkini KSSM bagi karangan respons terhad dan respons terbuka. Formula membina ungkapan menarik dan peribahasa tepat.',
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // In 5 days
    time: '15:00 - 17:00',
    meetingLink: 'https://zoom.us/j/98765432100',
    status: 'upcoming',
    speaker: 'Munsyi Dewan Cikgu Azman',
    subject: 'Bahasa Melayu',
    tingkatan: 'Tingkatan 4',
    targetAudience: 'Pelajar Tingkatan 4 & 5',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Bedah Siasat Bab Sejarah Tingkatan 1-3 (PMR/UASA Prep)',
    description: 'Pemetaan kronologi peristiwa penting dan tip mengingat fakta sejarah dengan kaedah akronim & visual.',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // Past seminar
    time: '14:00 - 16:00',
    meetingLink: 'https://meet.google.com/past-seminar-demo',
    status: 'completed',
    speaker: 'Ustazah Siti Rahmah',
    subject: 'Sejarah',
    tingkatan: 'Tingkatan 3',
    targetAudience: 'Pelajar Menengah Rendah',
    recordingUrl: 'https://youtube.com',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Fetch all seminars for students, ordered: 'live' first, then 'upcoming', then 'completed'
 */
export const getSeminars = async (): Promise<Seminar[]> => {
  try {
    const querySnap = await getDocs(collection(db, COLLECTION_NAME));
    
    // If no seminars exist yet, seed initial samples so user immediately sees live seminars
    if (querySnap.empty) {
      await seedInitialSeminars();
      const freshSnap = await getDocs(collection(db, COLLECTION_NAME));
      return sortSeminars(freshSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Seminar)));
    }

    const list = querySnap.docs.map((d) => ({ id: d.id, ...d.data() } as Seminar));
    return sortSeminars(list);
  } catch (error) {
    console.error('Error fetching seminars:', error);
    // Return sample fallback in case of connection drop
    return sortSeminars(
      SAMPLE_SEMINARS.map((s, idx) => ({ id: `sample-${idx}`, ...s }))
    );
  }
};

/**
 * Fetch all seminars for Admin management
 */
export const getAllSeminarsAdmin = async (): Promise<Seminar[]> => {
  try {
    const querySnap = await getDocs(collection(db, COLLECTION_NAME));
    if (querySnap.empty) {
      await seedInitialSeminars();
      const freshSnap = await getDocs(collection(db, COLLECTION_NAME));
      return sortSeminars(freshSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Seminar)));
    }
    const list = querySnap.docs.map((d) => ({ id: d.id, ...d.data() } as Seminar));
    return sortSeminars(list);
  } catch (error) {
    console.error('Error fetching admin seminars:', error);
    return sortSeminars(
      SAMPLE_SEMINARS.map((s, idx) => ({ id: `sample-${idx}`, ...s }))
    );
  }
};

/**
 * Get seminar by ID
 */
export const getSeminarById = async (id: string): Promise<Seminar | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Seminar;
    }
    return null;
  } catch (error) {
    console.error('Error getting seminar by id:', error);
    return null;
  }
};

/**
 * Create a new live seminar
 */
export const createSeminar = async (data: Omit<Seminar, 'id'>): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = {
      title: data.title.trim(),
      description: data.description.trim(),
      date: data.date,
      time: data.time.trim(),
      meetingLink: data.meetingLink.trim(),
      status: data.status || 'upcoming',
      speaker: data.speaker?.trim() || '',
      subject: data.subject?.trim() || '',
      tingkatan: data.tingkatan || 'Semua Tingkatan',
      targetAudience: data.targetAudience?.trim() || '',
      recordingUrl: data.recordingUrl?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating seminar:', error);
    throw error;
  }
};

/**
 * Update an existing live seminar
 */
export const updateSeminar = async (id: string, data: Partial<Seminar>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload.id; // Don't overwrite document ID field
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.error('Error updating seminar:', error);
    throw error;
  }
};

/**
 * Delete a seminar
 */
export const deleteSeminar = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting seminar:', error);
    throw error;
  }
};

/**
 * Seed initial sample seminars
 */
export const seedInitialSeminars = async (): Promise<void> => {
  try {
    for (const item of SAMPLE_SEMINARS) {
      await addDoc(collection(db, COLLECTION_NAME), item);
    }
  } catch (error) {
    console.warn('Could not seed initial seminars to Firestore:', error);
  }
};

/**
 * Helper to sort seminars by status priority:
 * 1. 'live'
 * 2. 'upcoming' (sorted by date asc)
 * 3. 'completed' (sorted by date desc)
 */
function sortSeminars(seminars: Seminar[]): Seminar[] {
  const statusWeight: Record<SeminarStatus, number> = {
    live: 1,
    upcoming: 2,
    completed: 3,
  };

  return [...seminars].sort((a, b) => {
    const weightA = statusWeight[a.status] || 99;
    const weightB = statusWeight[b.status] || 99;

    if (weightA !== weightB) {
      return weightA - weightB;
    }

    // For upcoming, closest date first
    if (a.status === 'upcoming') {
      return (a.date || '').localeCompare(b.date || '');
    }

    // For completed, newest first
    return (b.date || '').localeCompare(a.date || '');
  });
}
