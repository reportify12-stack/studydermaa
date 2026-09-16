import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PkskLevel, PkskQuestion, PkskSimulationResult } from '../types/pksk';

export interface PkskSimulationApiResponse {
  success: boolean;
  source?: string;
  model?: string;
  data: {
    level: PkskLevel;
    sekolahPilihan: string;
    questions: PkskQuestion[];
  };
}

/**
 * Calls the backend Gemini AI simulation generator endpoint.
 * Has full fallback resilience.
 */
export async function fetchPkskSimulation(
  level: PkskLevel = 'Tingkatan 3',
  sekolahPilihan: string = 'MRSM Pengkalan Chepa'
): Promise<PkskSimulationApiResponse> {
  try {
    const res = await fetch('/api/gemini/pksk-simulation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level, sekolahPilihan }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: PkskSimulationApiResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('[PKSK Service] Error fetching simulation from API, using client fallback:', err);
    // Fallback in case network or server is unreachable
    return {
      success: true,
      source: 'client_fallback',
      data: {
        level,
        sekolahPilihan,
        questions: getLocalPkskFallback(level),
      },
    };
  }
}

/**
 * Checks Firestore user document directly for pksk_access === true
 */
export async function checkPkskAccess(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.pksk_access === true;
    }
    return false;
  } catch (err) {
    console.error('[PKSK Service] Error checking PKSK access:', err);
    return false;
  }
}

/**
 * Unlocks PKSK access in the user's Firestore document
 */
export async function unlockPkskAccess(uid: string): Promise<void> {
  if (!uid) throw new Error('User UID is required');
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    pksk_access: true,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Updates the student's target school (Sekolah Pilihan) in Firestore
 */
export async function updateStudentTargetSchool(uid: string, sekolahPilihan: string): Promise<void> {
  if (!uid) throw new Error('User UID is required');
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    pksk_sekolah_pilihan: sekolahPilihan,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Updates the student's target PKSK level (Tahun 6 vs Tingkatan 3)
 */
export async function updateStudentTargetLevel(uid: string, level: PkskLevel): Promise<void> {
  if (!uid) throw new Error('User UID is required');
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    pksk_target_level: level,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Updates the target exam date
 */
export async function updateStudentExamDate(uid: string, examDate: string): Promise<void> {
  if (!uid) throw new Error('User UID is required');
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    pksk_exam_date: examDate,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Saves a completed PKSK simulation attempt to Firestore collection 'pkskAttempts'
 */
export async function savePkskAttempt(attempt: Omit<PkskSimulationResult, 'id'>): Promise<string> {
  try {
    const collectionRef = collection(db, 'pkskAttempts');
    const docRef = await addDoc(collectionRef, {
      ...attempt,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.error('[PKSK Service] Error saving attempt to Firestore:', err);
    // Return a random local ID if firestore fails
    return `local_${Date.now()}`;
  }
}

/**
 * Fetches previous PKSK attempts for the student from Firestore
 */
export async function fetchUserPkskAttempts(uid: string): Promise<PkskSimulationResult[]> {
  if (!uid) return [];
  try {
    const collectionRef = collection(db, 'pkskAttempts');
    const q = query(
      collectionRef,
      where('uid', '==', uid),
      orderBy('completedAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    const results: PkskSimulationResult[] = [];
    snap.forEach((d) => {
      results.push({ id: d.id, ...(d.data() as any) });
    });
    return results;
  } catch (err) {
    console.warn('[PKSK Service] Error querying pkskAttempts:', err);
    return [];
  }
}

function getLocalPkskFallback(level: PkskLevel): PkskQuestion[] {
  return [
    {
      id: 1,
      type: 'insaniah',
      categoryLabel: 'Kecerdasan Insaniah (EQ & Kepimpinan)',
      question:
        'Anda merupakan ketua asrama. Seorang rakan sebilik berasa sangat rungsing dan takut gagal dalam ujian kelayakan PKSK. Apakah bimbingan terbaik anda?',
      options: [
        'Menyuruhnya jangan mengada-ngada dan terus tidur.',
        'Mendengar kebimbangannya, berkongsi teknik pengurusan masa dan nota ulangkaji, serta memberikan kata semangat positif.',
        'Mengabaikannya kerana anda sendiri perlu belajar untuk skor tinggi.',
        'Melaporkan kepada warden bahawa rakan anda tidak stabil dari segi emosi.',
      ],
      correctIndex: 1,
      explanation:
        'Pemimpin yang mempunyai kecerdasan emosi tinggi sentiasa bersikap empati, memberikan dorongan konstruktif dan menyokong rakan sepasukan.',
    },
    {
      id: 2,
      type: 'insaniah',
      categoryLabel: 'Kecerdasan Insaniah (Integriti & Kejujuran)',
      question:
        'Semasa menjawab kuiz dalam talian, sistem komputer secara tidak sengaja memaparkan skema jawapan betul di skrin anda. Apakah tindakan berintegriti anda?',
      options: [
        'Menyalin semua jawapan cepat-cepat untuk mendapat markah 100%.',
        'Memberitahu semua rakan sekelas supaya mereka juga boleh melihat jawapan itu.',
        'Mengabaikan paparan skema tersebut, menjawab dengan keupayaan sendiri, dan memaklumkan guru mengenai pepijat (glitch) sistem selepas selesai.',
        'Menutup komputer dan terus pulang ke rumah.',
      ],
      correctIndex: 2,
      explanation:
        'Integriti bermaksud melakukan perkara yang betul walaupun tiada orang yang melihat. Ketelusan dan kejujuran ialah tunjang kecerdasan insaniah sekolah khusus.',
    },
    {
      id: 3,
      type: 'intelek',
      categoryLabel: 'Kecerdasan Intelek (Logik & Kuantitatif)',
      question:
        'Jika 5 orang tukang jahit dapat menyiapkan 5 pasang baju kurung dalam masa 5 hari, berapakah bilangan hari yang diperlukan oleh 100 orang tukang jahit untuk menyiapkan 100 pasang baju kurung dengan kadar produktiviti yang sama?',
      options: ['100 hari', '50 hari', '5 hari', '1 hari'],
      correctIndex: 2,
      explanation:
        '1 orang tukang jahit menyiapkan 1 pasang baju dalam masa 5 hari. Jadi 100 orang tukang jahit menyiapkan 100 pasang baju serentak juga dalam masa 5 hari.',
    },
    {
      id: 4,
      type: 'intelek',
      categoryLabel: 'Kecerdasan Intelek (Sains Alam & Teknologi)',
      question:
        'Kenderaan Elektrik (EV) semakin meluas di Malaysia. Apakah kelebihan utama kenderaan elektrik berbanding kenderaan berenjin petrol tradisional?',
      options: [
        'Tidak menghasilkan pelepasan gas ekzos terus (zero direct tailpipe emission) dan mengurangkan pencemaran udara bandar.',
        'Tidak memerlukan sebarang brek atau tayar.',
        'Boleh bergerak tanpa perlu dicas selama 5 tahun.',
        'Menggunakan petrol gred lebih rendah secara automatik.',
      ],
      correctIndex: 0,
      explanation:
        'EV menggunakan motor elektrik yang dikuasakan oleh bateri litium-ion dan tidak mengeluarkan gas rumah hijau atau asap ekzos semasa pemanduan.',
    },
    {
      id: 5,
      type: 'intelek',
      categoryLabel: 'Kecerdasan Intelek (Kenegaraan Malaysia)',
      question:
        'Berapakah jalur merah dan putih yang terdapat pada bendera Malaysia, Jalur Gemilang, dan apakah simboliknya?',
      options: [
        '13 jalur melambangkan 13 buah negeri.',
        '14 jalur melambangkan 13 buah negeri dan Kerajaan Persekutuan.',
        '12 jalur melambangkan 12 bulan dalam setahun.',
        '15 jalur melambangkan bilangan Yang di-Pertuan Agong terdahulu.',
      ],
      correctIndex: 1,
      explanation:
        'Jalur Gemilang mempunyai 14 jalur melintang merah dan putih yang sama lebar, melambangkan keanggotaan yang sama tara dalam persekutuan 13 buah negeri dan Wilayah Persekutuan.',
    },
  ];
}
