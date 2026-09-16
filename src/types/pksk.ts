export type PkskLevel = 'Tahun 6' | 'Tingkatan 3';

export type PkskQuestionType = 'insaniah' | 'intelek';

export interface PkskQuestion {
  id: number;
  type: PkskQuestionType;
  categoryLabel: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PkskSimulationResult {
  id?: string;
  uid: string;
  studentName: string;
  level: PkskLevel;
  sekolahPilihan: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  insaniahScore: {
    correct: number;
    total: number;
    percentage: number;
  };
  intelekScore: {
    correct: number;
    total: number;
    percentage: number;
  };
  answers: Record<number, number>;
  questions: PkskQuestion[];
  timeSpentSeconds?: number;
  completedAt: string;
  evaluativeFeedback?: string;
}

export interface TargetSchoolOption {
  id: string;
  name: string;
  category: 'MRSM' | 'SBP' | 'SMKA' | 'MTD' | 'KV';
  badge: string;
  description: string;
  location: string;
}

export const PKSK_TARGET_SCHOOLS: TargetSchoolOption[] = [
  {
    id: 'mrsm-pengkalan-chepa',
    name: 'MRSM Pengkalan Chepa (Premier)',
    category: 'MRSM',
    badge: 'Premier',
    description: 'Pusat kecemerlangan akademik terkemuka MARA berfokuskan sains tulen dan kepimpinan global.',
    location: 'Kelantan',
  },
  {
    id: 'mrsm-taiping',
    name: 'MRSM Taiping (Premier)',
    category: 'MRSM',
    badge: 'Premier',
    description: 'Maktab berprestij tinggi dengan rekod kecemerlangan SPM bertaraf kebangsaan.',
    location: 'Perak',
  },
  {
    id: 'mrsm-ulul-albab-gemencheh',
    name: 'MRSM Ulul Albab Gemencheh',
    category: 'MRSM',
    badge: 'Ulul Albab',
    description: 'Integrasi kurikulum STEM MARA bersama hafazan 30 juzuk Al-Quran dan bahasa Arab.',
    location: 'Negeri Sembilan',
  },
  {
    id: 'mckk',
    name: 'Kolej Melayu Kuala Kangsar (MCKK)',
    category: 'SBP',
    badge: 'SBP Premier',
    description: 'Kolej tradisi berasrama penuh melahirkan pemimpin dan negarawan ulung Malaysia.',
    location: 'Perak',
  },
  {
    id: 'tkc',
    name: 'Kolej Tunku Kurshiah (TKC)',
    category: 'SBP',
    badge: 'SBP Premier',
    description: 'Sekolah berasrama penuh puteri berprestij berfokus kepimpinan wanita dan kecemerlangan.',
    location: 'Negeri Sembilan',
  },
  {
    id: 'kisas',
    name: 'Kolej Islam Sultan Alam Shah (KISAS)',
    category: 'SMKA',
    badge: 'SMKA Premier',
    description: 'Sekolah Menengah Kebangsaan Agama terulung melahirkan cendiakawan Islam kontemporari.',
    location: 'Selangor',
  },
  {
    id: 'mtd',
    name: 'Maktab Tentera Diraja (RMC - MTD)',
    category: 'MTD',
    badge: 'Tentera Diraja',
    description: 'Pusat latihan kepimpinan tentera, disiplin besi, patriotisme, dan kecemerlangan fizikal & intelek.',
    location: 'Kuala Lumpur',
  },
  {
    id: 'sms-alam-shah',
    name: 'Sekolah Menengah Sains Alam Shah (ASiS)',
    category: 'SBP',
    badge: 'SBP Sains',
    description: 'Pusat tumpuan sains teknikal dan penyelidikan inovasi peringkat antarabangsa.',
    location: 'Kuala Lumpur',
  },
  {
    id: 'kv-setapak',
    name: 'Kolej Vokasional Setapak',
    category: 'KV',
    badge: 'TVET Unggul',
    description: 'Pusat latihan teknikal & vokasional kemahiran tinggi bertaraf Diploma Vokasional Malaysia.',
    location: 'Kuala Lumpur',
  },
];
