import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { LearningVideo, TingkatanType } from '../types';
import { extractYouTubeVideoId } from '../utils/youtube';

const COLLECTION_NAME = 'learning_videos';

/**
 * Add a new learning video to the `learning_videos` Firestore collection.
 * Extracts the YouTube Video ID automatically before saving.
 */
export async function addLearningVideo(input: {
  subject: string;
  chapter: string;
  youtubeLink: string;
  title?: string;
  description?: string;
  tingkatan?: TingkatanType | string;
  order?: number;
  duration?: string;
  createdBy?: string;
}): Promise<string> {
  const subjectTrimmed = input.subject.trim();
  const chapterTrimmed = input.chapter.trim();
  const linkTrimmed = input.youtubeLink.trim();

  if (!subjectTrimmed) {
    throw new Error('Sila masukkan subjek pembelajaran.');
  }
  if (!chapterTrimmed) {
    throw new Error('Sila masukkan bab / topik video.');
  }
  if (!linkTrimmed) {
    throw new Error('Sila masukkan pautan YouTube.');
  }

  const extractedVideoId = extractYouTubeVideoId(linkTrimmed);
  if (!extractedVideoId) {
    throw new Error(
      'Format pautan YouTube tidak sah. Sila pastikan pautan adalah contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/...'
    );
  }

  const colRef = collection(db, COLLECTION_NAME);
  const now = new Date().toISOString();

  const docData = {
    subject: subjectTrimmed,
    chapter: chapterTrimmed,
    title: input.title?.trim() || `${subjectTrimmed} - ${chapterTrimmed}`,
    youtubeLink: linkTrimmed,
    youtubeVideoId: extractedVideoId,
    description: input.description?.trim() || '',
    tingkatan: input.tingkatan || 'Semua Tingkatan',
    order: Number.isFinite(input.order) ? Number(input.order) : 0,
    duration: input.duration || '',
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy || 'Admin',
  };

  const docRef = await addDoc(colRef, docData);
  return docRef.id;
}

/**
 * Updates an existing video document in `learning_videos`.
 */
export async function updateLearningVideo(
  id: string,
  updates: Partial<Omit<LearningVideo, 'id' | 'createdAt'>>
): Promise<void> {
  if (!id) throw new Error('ID video diperlukan.');

  const docRef = doc(db, COLLECTION_NAME, id);
  const payload: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.youtubeLink) {
    const extractedId = extractYouTubeVideoId(updates.youtubeLink);
    if (!extractedId) {
      throw new Error('Format pautan YouTube baharu tidak sah.');
    }
    payload.youtubeVideoId = extractedId;
  }

  await updateDoc(docRef, payload);
}

/**
 * Deletes a video document from `learning_videos`.
 */
export async function deleteLearningVideo(id: string): Promise<void> {
  if (!id) throw new Error('ID video diperlukan.');
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Fetches all learning videos from Firestore.
 */
export async function getAllLearningVideos(): Promise<LearningVideo[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);

    const videos = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        subject: data.subject || '',
        chapter: data.chapter || '',
        title: data.title || '',
        youtubeLink: data.youtubeLink || '',
        youtubeVideoId: data.youtubeVideoId || extractYouTubeVideoId(data.youtubeLink) || '',
        description: data.description || '',
        tingkatan: data.tingkatan || '',
        order: data.order ?? 0,
        duration: data.duration || '',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
        createdBy: data.createdBy || '',
      } as LearningVideo;
    });

    // Sort by order asc, then subject, then chapter
    return videos.sort((a, b) => {
      if (a.subject !== b.subject) {
        return a.subject.localeCompare(b.subject);
      }
      return (a.order ?? 0) - (b.order ?? 0) || a.chapter.localeCompare(b.chapter, undefined, { numeric: true });
    });
  } catch (error) {
    console.error('Error fetching all learning videos:', error);
    return [];
  }
}

/**
 * Fetches learning videos filtered by subject.
 */
export async function getLearningVideosBySubject(subject: string): Promise<LearningVideo[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('subject', '==', subject));
    const snap = await getDocs(q);

    const videos = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        subject: data.subject || '',
        chapter: data.chapter || '',
        title: data.title || '',
        youtubeLink: data.youtubeLink || '',
        youtubeVideoId: data.youtubeVideoId || extractYouTubeVideoId(data.youtubeLink) || '',
        description: data.description || '',
        tingkatan: data.tingkatan || '',
        order: data.order ?? 0,
        duration: data.duration || '',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
        createdBy: data.createdBy || '',
      } as LearningVideo;
    });

    return videos.sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.chapter.localeCompare(b.chapter, undefined, { numeric: true })
    );
  } catch (error) {
    console.error(`Error fetching videos for subject ${subject}:`, error);
    return [];
  }
}

/**
 * Seed initial sample learning videos if the collection is empty.
 * Ensures the platform is immediately usable with real educational content.
 */
export async function seedInitialVideosIfEmpty(): Promise<LearningVideo[]> {
  try {
    const existing = await getAllLearningVideos();
    if (existing.length > 0) {
      return existing;
    }

    const defaultSeedVideos = [
      {
        subject: 'Matematik',
        chapter: 'Bab 1: Nombor Nisbah',
        title: 'Pengenalan Integer, Pecahan dan Nombor Nisbah KSSM',
        youtubeLink: 'https://www.youtube.com/watch?v=kYJqD9P_u_0',
        description: 'Penerangan komprehensif konsep integer positif, integer negatif, garis nombor serta operasi asas aritmetik mengikut sukatan KSSM.',
        tingkatan: 'Tingkatan 1',
        order: 1,
        duration: '14:20',
      },
      {
        subject: 'Matematik',
        chapter: 'Bab 2: Faktor dan Gandaan',
        title: 'Faktor Sepunya Terbesar (FSTB) & Gandaan Sepunya Terkecil (GSTK)',
        youtubeLink: 'https://www.youtube.com/watch?v=34dZ7F_D8bE',
        description: 'Kaedah pembahagian berulang dan pemfaktoran perdana untuk mencari FSTB dan GSTK dengan pantas dan tepat.',
        tingkatan: 'Tingkatan 1',
        order: 2,
        duration: '18:45',
      },
      {
        subject: 'Matematik',
        chapter: 'Bab 3: Kuasa Dua, Punca Kuasa Dua, Kuasa Tiga',
        title: 'Konsep Kuasa Dua dan Punca Kuasa Dua Sempurna',
        youtubeLink: 'https://www.youtube.com/watch?v=P_VpWJ-o5sA',
        description: 'Memahami hubungan antara kuasa dua dan punca kuasa dua serta teknik pengiraan tanpa kalkulator.',
        tingkatan: 'Tingkatan 1',
        order: 3,
        duration: '16:10',
      },
      {
        subject: 'Sains',
        chapter: 'Bab 1: Pengenalan kepada Penyiasatan Saintifik',
        title: 'Kaedah Saintifik, Radas Makmal & Simbol Bahaya',
        youtubeLink: 'https://www.youtube.com/watch?v=fB8v34aN1E4',
        description: 'Langkah-langkah dalam penyiasatan saintifik, penggunaan radas makmal sains dengan betul, serta langkah keselamatan makmal KSSM.',
        tingkatan: 'Tingkatan 1',
        order: 1,
        duration: '12:35',
      },
      {
        subject: 'Sains',
        chapter: 'Bab 2: Sel Sebagai Unit Asas Hidupan',
        title: 'Struktur Sel Haiwan vs Sel Tumbuhan',
        youtubeLink: 'https://www.youtube.com/watch?v=URUJD5NEXC8',
        description: 'Perbezaan antara sel haiwan dan sel tumbuhan, fungsi kloroplas, membran sel, nukleus, dan dinding sel.',
        tingkatan: 'Tingkatan 1',
        order: 2,
        duration: '15:50',
      },
      {
        subject: 'Sejarah',
        chapter: 'Bab 1: Mengenal Sejarah',
        title: 'Pengertian Sejarah, Sumber Primer & Sumber Sekunder',
        youtubeLink: 'https://www.youtube.com/watch?v=aG9K0Q_9H8c',
        description: 'Pengenalan kepada konsep masa silam, kaedah penyelidikan sejarah lisan, arkeologi, dan bertulis.',
        tingkatan: 'Tingkatan 1',
        order: 1,
        duration: '11:15',
      },
      {
        subject: 'Bahasa Melayu',
        chapter: 'Bab 1: Morfologi & Golongan Kata',
        title: 'Kata Nama, Kata Kerja & Kata Adjektif Tatabahasa KSSM',
        youtubeLink: 'https://www.youtube.com/watch?v=mD4O6RkG9pA',
        description: 'Kupas tuntas golongan kata dan pembentukan ayat yang gramatis untuk peperiksaan UASA dan SPM.',
        tingkatan: 'Tingkatan 1',
        order: 1,
        duration: '13:40',
      },
    ];

    for (const v of defaultSeedVideos) {
      await addLearningVideo({
        ...v,
        createdBy: 'Admin Sistem',
      });
    }

    return await getAllLearningVideos();
  } catch (error) {
    console.error('Error seeding initial learning videos:', error);
    return [];
  }
}
