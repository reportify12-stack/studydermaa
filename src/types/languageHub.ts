export type LanguageModuleId = 'thai' | 'korean' | 'japanese';

export interface LanguageModuleConfig {
  id: LanguageModuleId;
  name: 'Sawadee Thai' | 'Annyeonghaseyo Korea' | 'Konnichiwa Japan';
  greeting: string;
  nativeGreeting: string;
  scriptName: string;
  country: string;
  flag: string;
  tagline: string;
  themeColor: string;
  badgeClass: string;
  gradientClass: string;
  borderClass: string;
  iconBgClass: string;
  accentTextClass: string;
  popularTopics: string[];
}

export interface LanguageVocabulary {
  word: string;
  romanization: string;
  meaning: string;
  context: string;
}

export interface LanguagePhrase {
  phrase: string;
  romanization: string;
  meaning: string;
  situation: string;
}

export interface LanguageQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LanguageLessonData {
  languageId: LanguageModuleId;
  languageName: 'Sawadee Thai' | 'Annyeonghaseyo Korea' | 'Konnichiwa Japan';
  lessonTitle: string;
  culturalIntro: string;
  pronunciationGuide: string;
  vocabularies: LanguageVocabulary[]; // Exactly 5
  phrases: LanguagePhrase[];          // Exactly 3
  quiz: LanguageQuizQuestion[];       // Exactly 3
  generatedAt?: string;
  topic?: string;
}

export interface LanguageTutorMessage {
  id: string;
  role: 'student' | 'model';
  content: string;
  timestamp: string;
}
