import { AiTutorSubjectOption } from '../types';

/**
 * System instruction configuration variable for CikguDermarians (AI Tutor) on study.dermaa.
 * Tells the AI tutor its persona, pedagogy, and Malaysian KSSM specialization.
 */
export const DEFAULT_AI_TUTOR_SYSTEM_INSTRUCTION =
  "You are CikguDermarians, an encouraging, brilliant AI Tutor for the study.dermaa platform. You specialize in the Malaysian KSSM syllabus. Explain concepts clearly, step-by-step, and in a friendly tone using either standard Malay or English depending on the student's language.";

/**
 * Default Gemini model for text and educational Q&A tasks
 */
export const AI_TUTOR_MODEL = 'gemini-3.8-flash';

/**
 * Quick subject prompts aligned with the Malaysian KSSM syllabus
 */
export const KSSM_TUTOR_SUBJECTS: AiTutorSubjectOption[] = [
  {
    id: 'all',
    name: 'Semua Subjek',
    code: 'ALL',
    iconName: 'Sparkles',
    promptSuggestions: [
      'Bantu saya buat jadual ulang kaji SPM yang berkesan.',
      'Apakah teknik Feynman dan cara menggunakannya untuk belajar?',
      'Bagaimana cara menguasai soalan Kemahiran Berfikir Aras Tinggi (KBAT)?',
      'Boleh terangkan cara mengurus masa semasa menjawab peperiksaan?',
    ],
  },
  {
    id: 'matematik',
    name: 'Matematik',
    code: 'MATH',
    iconName: 'Calculator',
    promptSuggestions: [
      'Terangkan konsep Teorem Pythagoras dan berikan contoh soalan KSSM.',
      'Bagaimana cara mudah memfaktorkan ungkapan kuadratik ax² + bx + c?',
      'Boleh jelaskan perbezaan antara sisihan piawai dan varians?',
      'Terangkan cara menyelesaikan persamaan serentak dengan kaedah penghapusan.',
    ],
  },
  {
    id: 'sains',
    name: 'Sains',
    code: 'SC',
    iconName: 'FlaskConical',
    promptSuggestions: [
      'Apakah perbezaan utama antara sel tumbuhan dan sel haiwan?',
      'Terangkan proses fotosintesis dan persamaan kimianya secara ringkas.',
      'Jelaskan Hukum Newton Pertama, Kedua dan Ketiga berserta contoh harian.',
      'Bagaimanakah sistem imunisasi badan manusia berfungsi melawan patogen?',
    ],
  },
  {
    id: 'sejarah',
    name: 'Sejarah',
    code: 'SEJ',
    iconName: 'Landmark',
    promptSuggestions: [
      'Huraikan faktor-faktor pembentukan gagasan Malaysia pada tahun 1963.',
      'Apakah iktibar daripada Peristiwa 13 Mei 1969 untuk perpaduan kaum?',
      'Terangkan sistem pentadbiran Kesultanan Melayu Melaka (Bendahara, Temenggung dll).',
      'Bagaimana teknik menjawab soalan Sejarah Kertas 2 Bahagian C (KBAT)?',
    ],
  },
  {
    id: 'bm',
    name: 'Bahasa Melayu',
    code: 'BM',
    iconName: 'BookOpen',
    promptSuggestions: [
      'Berikan contoh peribahasa menarik yang sesuai untuk karangan perpaduan kaum.',
      'Apakah format terkini Karangan Respons Terbuka SPM KSSM?',
      'Bagaimana cara mengenal pasti dan membetulkan kesalahan morfologi (tatabahasa)?',
      'Bantu saya membuat rangka karangan tentang peranan teknologi dalam pendidikan.',
    ],
  },
  {
    id: 'bi',
    name: 'Bahasa Inggeris',
    code: 'BI',
    iconName: 'Globe',
    promptSuggestions: [
      'Can you explain the differences between Present Perfect and Past Simple tense?',
      'How to write an engaging SPM English Section B argumentative essay?',
      'Give me useful transition words and idiomatic expressions for formal writing.',
      'Help me identify common grammar errors Malaysian students often make.',
    ],
  },
  {
    id: 'fizik',
    name: 'Fizik',
    code: 'PHY',
    iconName: 'Zap',
    promptSuggestions: [
      'Terangkan Hukum Archimedes dan prinsip keapungan kapal selam.',
      'Apakah perbezaan antara pantulan dalam penuh dan pembiasan cahaya?',
      'Bagaimana cara menggunakan formula Hukum Kegravitian Semesta Newton F = G(m1m2)/r²?',
      'Jelaskan konsep keabadian momentum dalam perlanggaran kenyal dan tak kenyal.',
    ],
  },
  {
    id: 'kimia',
    name: 'Kimia',
    code: 'CHEM',
    iconName: 'Atom',
    promptSuggestions: [
      'Terangkan cara menulis dan mengimbangkan persamaan kimia ionik.',
      'Apakah perbezaan antara ikatan ion dan ikatan kovalen?',
      'Bagaimana cara menentukan bilangan mol daripada jisim dan isi padu molar gas?',
      'Jelaskan konsep Asid Kuat vs Asid Lemah berdasarkan darjah penceraian.',
    ],
  },
  {
    id: 'biologi',
    name: 'Biologi',
    code: 'BIO',
    iconName: 'Dna',
    promptSuggestions: [
      'Terangkan peringkat-peringkat dalam pembahagian sel Meiosis I dan Meiosis II.',
      'Bagaimana molekul enzim berfungsi mengikut hipotesis "mangga dan kunci"?',
      'Jelaskan peranan nefron dalam proses pembentukan air kencing di ginjal.',
      'Apakah perbezaan pengangkutan pasif dan pengangkutan aktif merentasi membran plasma?',
    ],
  },
];

/**
 * Builds an enriched system instruction that maintains the user's required
 * base persona while augmenting it with the student's specific Tingkatan, subject, and study goals.
 */
export function buildTutorSystemInstruction(
  studentName?: string,
  tingkatan?: string,
  currentSubject?: string
): string {
  let instruction = DEFAULT_AI_TUTOR_SYSTEM_INSTRUCTION;

  const contextParts: string[] = [];
  if (studentName) {
    contextParts.push(`The student's name is ${studentName}.`);
  }
  if (tingkatan) {
    contextParts.push(`The student is studying at level: ${tingkatan} (KSSM Malaysian Secondary syllabus).`);
  }
  if (currentSubject && currentSubject !== 'all') {
    contextParts.push(`The current discussion focus is on the subject: ${currentSubject}.`);
  }

  if (contextParts.length > 0) {
    instruction += `\n\nContext:\n${contextParts.join(' ')}\nAlways tailor your explanations to the Malaysian KSSM standard syllabus and mark schemes where applicable. Provide positive reinforcement (e.g., "Bagus soalan ini!", "Hebat! Mari kita teliti bersama-sama").`;
  }

  return instruction;
}
