import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Flashcard, TingkatanType } from '../types';

/**
 * Curated initial KSSM flashcards seeded automatically if Firestore collection is empty.
 */
export const DEFAULT_KSSM_FLASHCARDS: Omit<Flashcard, 'id'>[] = [
  // SAINS
  {
    term: 'Fotosintesis',
    definition:
      'Proses tumbuhan hijau menghasilkan glukosa dan oksigen daripada karbon dioksida dan air dengan kehadiran cahaya matahari dan klorofil.\n\nPersamaan:\nKarbon Dioksida + Air → Glukosa + Oksigen',
    subjectName: 'Sains',
    chapter: 'Bab 2: Respirasi & Fotosintesis',
    tingkatan: 'Tingkatan 1',
    hint: 'Melibatkan klorofil dan cahaya matahari',
    category: 'Konsep',
    createdAt: new Date().toISOString(),
  },
  {
    term: 'Hukum Newton Pertama',
    definition:
      'Objek akan kekal dalam keadaan pegun atau bergerak dengan halaju seragam dalam garis lurus melainkan ditindak oleh daya luar.\n\nJuga dikenali sebagai Hukum Inersia.',
    subjectName: 'Sains',
    chapter: 'Bab 8: Daya dan Gerakan',
    tingkatan: 'Tingkatan 2',
    hint: 'Berkait rapat dengan inersia',
    category: 'Hukum Fizik',
    createdAt: new Date().toISOString(),
  },
  {
    term: 'Respirasi Sel',
    definition:
      'Proses penguraian glukosa untuk membebaskan tenaga kimia (ATP) di dalam mitokondria sel hidup dengan kehadiran oksigen.',
    subjectName: 'Sains',
    chapter: 'Bab 3: Nutrisi dan Sel',
    tingkatan: 'Tingkatan 3',
    hint: 'Berlaku di mitokondria',
    category: 'Proses Biologi',
    createdAt: new Date().toISOString(),
  },

  // MATEMATIK
  {
    term: 'Teorem Pythagoras',
    definition:
      'Bagi sebuah segi tiga bersudut tegak (90°):\nKuasa dua panjang hipotenus (c) adalah bersamaan dengan hasil tambah kuasa dua panjang dua sisi lain (a dan b).\n\nFormula: c² = a² + b²',
    subjectName: 'Matematik',
    chapter: 'Bab 13: Teorem Pythagoras',
    tingkatan: 'Tingkatan 1',
    hint: 'Segi tiga bersudut 90°',
    category: 'Formula',
    createdAt: new Date().toISOString(),
  },
  {
    term: 'Kecerunan Garis Lurus (m)',
    definition:
      'Nisbah jarak mencancang kepada jarak mengufuk antara dua titik pada satah Cartes.\n\nFormula:\nm = (y₂ - y₁) / (x₂ - x₁)',
    subjectName: 'Matematik',
    chapter: 'Bab 10: Kecerunan Garis Lurus',
    tingkatan: 'Tingkatan 2',
    hint: 'Kadar kecuraman graf',
    category: 'Formula',
    createdAt: new Date().toISOString(),
  },
  {
    term: 'Persamaan Kuadratik',
    definition:
      'Persamaan polinomial darjah kedua dengan bentuk am ax² + bx + c = 0 (di mana a ≠ 0).\nGrafnya berbentuk parabola simetri (senyum jika a > 0, masam jika a < 0).',
    subjectName: 'Matematik',
    chapter: 'Bab 1: Fungsi & Persamaan Kuadratik',
    tingkatan: 'Tingkatan 4',
    hint: 'Bentuk parabola graf',
    category: 'Konsep',
    createdAt: new Date().toISOString(),
  },

  // SEJARAH
  {
    term: 'Hukum Kanun Melaka',
    definition:
      'Undang-undang bertulis Kesultanan Melayu Melaka yang mengandungi 44 fasal, merangkumi aspek jenayah, bidang kuasa sultan/pembesar, kekeluargaan, dan hal ehwal Islam.',
    subjectName: 'Sejarah',
    chapter: 'Bab 5: Kesultanan Melayu Melaka',
    tingkatan: 'Tingkatan 2',
    hint: 'Mengandungi 44 fasal bertulis',
    category: 'Fakta Sejarah',
    createdAt: new Date().toISOString(),
  },
  {
    term: 'Perjanjian Pangkor 1874',
    definition:
      'Perjanjian antara British dengan Raja Abdullah yang menandakan bermulanya campur tangan rasmi British di Tanah Melayu melalui sistem Residen di negeri Perak.',
    subjectName: 'Sejarah',
    chapter: 'Bab 3: Campur Tangan British di Negeri Melayu',
    tingkatan: 'Tingkatan 3',
    hint: 'Sistem Residen pertama di Perak',
    category: 'Peristiwa Penting',
    createdAt: new Date().toISOString(),
  },
  {
    term: 'Rukun Negara (1970)',
    definition:
      'Ideologi kebangsaan Malaysia yang diisytiharkan pada 31 Ogos 1970 susulan peristiwa 13 Mei 1969 untuk mengukuhkan perpaduan kaum.\n\n5 Prinsip:\n1. Kepercayaan kepada Tuhan\n2. Kesetiaan kepada Raja dan Negara\n3. Keluhuran Perlembagaan\n4. Kedaulatan Undang-Undang\n5. Kesopanan dan Kesusilaan',
    subjectName: 'Sejarah',
    chapter: 'Bab 7: Membina Kesejahteraan Negara',
    tingkatan: 'Tingkatan 5',
    hint: 'Ideologi kebangsaan 5 prinsip',
    category: 'Kenegaraan',
    createdAt: new Date().toISOString(),
  },

  // BAHASA MELAYU
  {
    term: 'Kata Ganda Penuh',
    definition:
      'Penggandaan keseluruhan kata dasar tanpa sebarang perubahan bentuk bunyi, huruf atau imbuhan.\n\nContoh: buku-buku, murid-murid, cantik-cantik.',
    subjectName: 'Bahasa Melayu',
    chapter: 'Morfologi & Tatabahasa',
    tingkatan: 'Tingkatan 1',
    hint: 'Mengulang seluruh kata dasar',
    category: 'Tatabahasa',
    createdAt: new Date().toISOString(),
  },
  {
    term: 'Ayat Pasif',
    definition:
      'Ayat yang mengutamakan objek (benda/orang yang dikenakan perbuatan) berbanding pelaku (subjek asal).\n\nContoh: "Buku itu dibaca oleh Ali."',
    subjectName: 'Bahasa Melayu',
    chapter: 'Sintaksis & Pembentukan Ayat',
    tingkatan: 'Tingkatan 2',
    hint: 'Objek mendahului kata kerja pasif',
    category: 'Tatabahasa',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Fetch flashcards from Firestore with resilient seeding
 */
export async function fetchFlashcardsFromFirestore(
  subjectFilter?: string,
  tingkatanFilter?: string
): Promise<Flashcard[]> {
  try {
    const colRef = collection(db, 'flashcards');
    const snap = await getDocs(colRef);

    // If Firestore collection has no cards yet, seed initial default cards!
    if (snap.empty) {
      console.log('Seeding initial KSSM flashcards to Firestore...');
      const seededCards: Flashcard[] = [];
      for (const item of DEFAULT_KSSM_FLASHCARDS) {
        try {
          const docRef = await addDoc(colRef, item);
          seededCards.push({ id: docRef.id, ...item });
        } catch (seedErr) {
          console.warn('Could not write seed card to Firestore:', seedErr);
        }
      }

      if (seededCards.length > 0) {
        return filterCards(seededCards, subjectFilter, tingkatanFilter);
      }

      // If write was blocked by network/permissions, return fallback in-memory list
      return filterCards(
        DEFAULT_KSSM_FLASHCARDS.map((c, idx) => ({ id: `seed_${idx}`, ...c })),
        subjectFilter,
        tingkatanFilter
      );
    }

    const items: Flashcard[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Flashcard, 'id'>),
    }));

    return filterCards(items, subjectFilter, tingkatanFilter);
  } catch (err) {
    console.warn('Error querying Firestore flashcards, using memory defaults:', err);
    return filterCards(
      DEFAULT_KSSM_FLASHCARDS.map((c, idx) => ({ id: `fallback_${idx}`, ...c })),
      subjectFilter,
      tingkatanFilter
    );
  }
}

function filterCards(
  cards: Flashcard[],
  subjectFilter?: string,
  tingkatanFilter?: string
): Flashcard[] {
  return cards.filter((c) => {
    if (subjectFilter && subjectFilter !== 'Semua' && c.subjectName !== subjectFilter) {
      return false;
    }
    if (tingkatanFilter && tingkatanFilter !== 'Semua' && c.tingkatan !== tingkatanFilter) {
      return false;
    }
    return true;
  });
}

/**
 * Add a new flashcard to Firestore
 */
export async function createFlashcard(card: Omit<Flashcard, 'id'>): Promise<string> {
  const colRef = collection(db, 'flashcards');
  const docRef = await addDoc(colRef, {
    ...card,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Delete a flashcard from Firestore
 */
export async function deleteFlashcard(cardId: string): Promise<void> {
  const docRef = doc(db, 'flashcards', cardId);
  await deleteDoc(docRef);
}
