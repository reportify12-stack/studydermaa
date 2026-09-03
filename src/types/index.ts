export type UserRole = 'student' | 'admin';

export type TingkatanType = 
  | 'Tingkatan 1'
  | 'Tingkatan 2'
  | 'Tingkatan 3'
  | 'Tingkatan 4'
  | 'Tingkatan 5';

export const TINGKATAN_OPTIONS: TingkatanType[] = [
  'Tingkatan 1',
  'Tingkatan 2',
  'Tingkatan 3',
  'Tingkatan 4',
  'Tingkatan 5',
];

export const KSSM_DEFAULT_SUBJECTS = [
  { name: 'Bahasa Melayu', code: 'BM', icon: 'BookOpen', category: 'Teras' },
  { name: 'Bahasa Inggeris', code: 'BI', icon: 'Globe', category: 'Teras' },
  { name: 'Matematik', code: 'MATH', icon: 'Calculator', category: 'Teras' },
  { name: 'Sains', code: 'SC', icon: 'FlaskConical', category: 'Teras' },
  { name: 'Sejarah', code: 'SEJ', icon: 'Landmark', category: 'Teras' },
  { name: 'Geografi', code: 'GEO', icon: 'Compass', category: 'Elektif' },
  { name: 'Pendidikan Islam', code: 'PI', icon: 'Moon', category: 'Teras' },
  { name: 'Pendidikan Moral', code: 'PM', icon: 'HeartHandshake', category: 'Teras' },
  { name: 'Asas Sains Komputer', code: 'ASK', icon: 'Code', category: 'Elektif' },
  { name: 'Reka Bentuk dan Teknologi', code: 'RBT', icon: 'Cpu', category: 'Elektif' },
  { name: 'Bahasa Arab', code: 'BA', icon: 'Languages', category: 'Bahasa' },
  { name: 'Bahasa Cina', code: 'BC', icon: 'Languages', category: 'Bahasa' },
  { name: 'Bahasa Tamil', code: 'BT', icon: 'Languages', category: 'Bahasa' },
  { name: 'Pendidikan Jasmani & Kesihatan', code: 'PJPK', icon: 'Activity', category: 'Wajib' },
  { name: 'Pendidikan Seni Visual', code: 'PSV', icon: 'Palette', category: 'Wajib' },
  { name: 'Muzik', code: 'MZ', icon: 'Music', category: 'Wajib' },
];

export interface UserProfile {
  uid: string;
  username: string;
  usernameLowercase: string;
  fullName: string;
  email: string;
  authEmail: string;
  school?: string;
  tingkatan: TingkatanType;
  role: UserRole;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  completedNotesCount: number;
  completedQuizzesCount: number;
  bookmarks: string[]; // array of note or quiz ids
  themePreference?: string;
  colorMode?: 'light' | 'dark' | 'system';
  isSuspended?: boolean;
  status?: 'active' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface UsernameRecord {
  uid: string;
  authEmail: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  category: string;
  tingkatanList: TingkatanType[];
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  subjectName?: string;
  tingkatan: TingkatanType;
  chapterNumber: number;
  title: string;
  description?: string;
  order: number;
  published: boolean;
  createdAt: string;
}

export interface Topic {
  id: string;
  chapterId: string;
  subjectId: string;
  tingkatan: TingkatanType;
  topicNumber: number;
  title: string;
  order: number;
  published: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  subjectId: string;
  subjectName: string;
  chapterId?: string;
  chapterTitle?: string;
  topicId?: string;
  topicTitle?: string;
  tingkatan: TingkatanType;
  title: string;
  summary: string;
  content: string; // Markdown or structured sections
  keyPoints: string[];
  readTimeMinutes: number;
  published: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = 'objective' | 'subjective' | 'kbat';

export interface Question {
  id: string;
  quizId: string;
  question: string;
  type: QuestionType;
  options?: string[]; // For objective
  correctAnswer: string | number; // index or text
  marks: number;
  explanation?: string;
  kbatPrompt?: string;
  order: number;
  createdAt: string;
}

export interface Quiz {
  id: string;
  subjectId: string;
  subjectName: string;
  chapterId?: string;
  chapterTitle?: string;
  tingkatan: TingkatanType;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  passPercentage: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptAnswer {
  questionId: string;
  studentAnswer: string | number;
  isCorrect?: boolean;
  marksEarned?: number;
  maxMarks?: number;
}

export interface QuizAttempt {
  id: string;
  uid: string;
  studentName: string;
  studentUsername: string;
  quizId: string;
  quizTitle: string;
  subjectName: string;
  tingkatan: TingkatanType;
  startedAt: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'passed' | 'failed' | 'in_progress';
  answers: Record<string, QuizAttemptAnswer>;
  xpEarned: number;
}

export interface UserNoteProgress {
  noteId: string;
  completed: boolean;
  bookmarked: boolean;
  lastViewed: string;
  completionDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  badge?: string;
  pinned?: boolean;
  published: boolean;
  authorName: string;
  createdAt: string;
}

export interface PlatformStats {
  totalStudents: number;
  activeStudentsToday: number;
  totalSubjects: number;
  totalNotes: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  averageQuizScore: number;
}

export type SeminarStatus = 'upcoming' | 'live' | 'completed';

export interface Seminar {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD or readable date string
  time: string; // e.g. "20:30" or "8:30 PM"
  meetingLink: string; // Zoom / Google Meet / Microsoft Teams link
  status: SeminarStatus;
  subject?: string;
  speaker?: string;
  tingkatan?: TingkatanType | 'Semua Tingkatan';
  targetAudience?: string;
  recordingUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PastelThemeName = 
  | 'pastel-green'
  | 'pastel-blue'
  | 'pastel-purple'
  | 'pastel-pink'
  | 'pastel-yellow'
  | 'pastel-peach'
  | 'pastel-mint';

export interface ThemeConfig {
  id: PastelThemeName;
  name: string;
  description: string;
  primaryColor: string;
  accentBg: string;
  badgeBg: string;
  gradient: string;
  tagClass: string;
}

export type ChatRole = 'student' | 'model';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  subject?: string;
  isError?: boolean;
}

export interface AiTutorSubjectOption {
  id: string;
  name: string;
  code: string;
  iconName: string;
  promptSuggestions: string[];
}
