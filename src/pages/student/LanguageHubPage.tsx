import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Globe,
  RotateCw,
  HelpCircle,
  Award,
  Layers,
  Search,
} from 'lucide-react';
import {
  LanguageModuleConfig,
  LanguageModuleId,
  LanguageLessonData,
} from '../../types/languageHub';
import {
  LANGUAGE_MODULES,
  fetchDynamicLanguageLesson,
} from '../../services/languageHubService';
import { LanguageCard } from '../../components/language/LanguageCard';
import { LessonQuizViewer } from '../../components/language/LessonQuizViewer';
import { LanguageTutorChat } from '../../components/language/LanguageTutorChat';

interface LanguageHubPageProps {
  navigate?: (route: string) => void;
}

export const LanguageHubPage: React.FC<LanguageHubPageProps> = ({ navigate }) => {
  const [selectedModule, setSelectedModule] = useState<LanguageModuleConfig>(LANGUAGE_MODULES[0]);
  const [currentLesson, setCurrentLesson] = useState<LanguageLessonData | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<string>('Asas Perbualan & Sapaan Sopan');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [dataSource, setDataSource] = useState<'gemini' | 'fallback'>('gemini');

  // Load lesson dynamically when module or topic changes
  const loadLesson = async (
    module: LanguageModuleConfig,
    topic: string,
    bypassCache: boolean = false
  ) => {
    setIsLoadingLesson(true);
    setLoadingStep('Menyambung ke Google Gemini 3.8 Flash...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Menganalisis fonetik & merangka 5 kosa kata asas...');
    }, 600);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Menyusun 3 frasa perbualan & menjana kuiz 3 soalan...');
    }, 1200);

    try {
      const result = await fetchDynamicLanguageLesson(
        module.id,
        module.name,
        topic,
        bypassCache
      );

      setCurrentLesson(result.data);
      setDataSource(result.source);
    } catch (err) {
      console.error('Failed to load dynamic language lesson:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoadingLesson(false);
      setLoadingStep('');
    }
  };

  // Initial load on mount
  useEffect(() => {
    loadLesson(selectedModule, activeTopic, false);
  }, [selectedModule.id]);

  const handleSelectModule = (mod: LanguageModuleConfig) => {
    if (selectedModule.id === mod.id && currentLesson) return;
    setSelectedModule(mod);
    setActiveTopic('Asas Perbualan & Sapaan Sopan');
  };

  const handleTopicClick = (topicName: string) => {
    setActiveTopic(topicName);
    loadLesson(selectedModule, topicName, true);
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopicInput.trim()) return;
    const topic = customTopicInput.trim();
    setActiveTopic(topic);
    setCustomTopicInput('');
    loadLesson(selectedModule, topic, true);
  };

  const handleRegenerateCurrent = () => {
    loadLesson(selectedModule, activeTopic, true);
  };

  return (
    <div id="language-hub-page" className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-stone-900 via-stone-900 to-stone-800 text-white shadow-md overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-theme-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-3 backdrop-blur-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Multilingual Language Hub</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-semibold">Gemini Generative Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Pusat Bahasa Antarabangsa AI
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-normal">
            Kandungan dijana secara dinamik terus oleh Google Gemini API mengikut tahap pemula anda.
            Pilih modul bahasa untuk meneroka 5 kosa kata, 3 frasa harian, kuiz pengukuhan segera, dan bimbingan tutor AI khas.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tiada Kandungan Kaku / Statik
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Award className="w-3.5 h-3.5 text-purple-400" /> Kuiz & Skor Interaktif
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Sebutan & Nada Suara Tepat
            </span>
          </div>
        </div>
      </div>

      {/* Module Selector (The 3 Modules) */}
      <section id="language-modules-section" aria-labelledby="heading-modules">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 id="heading-modules" className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Pilih Modul Bahasa
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Klik salah satu bahasa di bawah untuk menjana modul pembelajaran secara langsung.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-400">
            <span>Enjin Aktif:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              {dataSource === 'gemini' ? 'Google Gemini 3.8 Flash' : 'Dynamic Local Engine'}
            </span>
          </div>
        </div>

        {/* 3 Language Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LANGUAGE_MODULES.map((mod) => (
            <LanguageCard
              key={mod.id}
              module={mod}
              isSelected={selectedModule.id === mod.id}
              onSelect={handleSelectModule}
              isLoading={isLoadingLesson}
            />
          ))}
        </div>
      </section>

      {/* Topic Filter & Custom Topic Generator */}
      <section
        id="topic-selection-bar"
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 shrink-0 mr-1">
            Topik Pembelajaran:
          </span>
          {['Asas Perbualan & Sapaan Sopan', ...selectedModule.popularTopics].map((top, idx) => (
            <button
              key={idx}
              type="button"
              id={`btn-topic-${idx}`}
              onClick={() => handleTopicClick(top)}
              disabled={isLoadingLesson}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTopic === top
                  ? 'bg-theme-primary text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {top}
            </button>
          ))}
        </div>

        {/* Custom topic prompt input */}
        <form onSubmit={handleCustomTopicSubmit} className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              id="input-custom-topic"
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              placeholder="Topik khas (cth: Lapangan Terbang)..."
              disabled={isLoadingLesson}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>
          <button
            type="submit"
            disabled={!customTopicInput.trim() || isLoadingLesson}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Jana
          </button>
        </form>
      </section>

      {/* Main Content: Lesson + Quiz OR Loading State */}
      {isLoadingLesson ? (
        <div
          id="loading-lesson-skeleton"
          className="rounded-3xl p-12 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-theme-surface text-theme-primary flex items-center justify-center shadow-xs">
            <Sparkles className="w-7 h-7 animate-pulse text-theme-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
              Menjana Pembelajaran {selectedModule.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
              {loadingStep || 'Sedang menghubungkan ke Google Gemini API...'}
            </p>
          </div>

          <div className="w-48 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-theme-primary rounded-full animate-indeterminate" />
          </div>
        </div>
      ) : currentLesson ? (
        <>
          {/* Lesson & Quiz Viewer */}
          <LessonQuizViewer
            lesson={currentLesson}
            onGenerateNewTopic={handleRegenerateCurrent}
            isGeneratingNew={isLoadingLesson}
          />

          {/* AI Tutor Integration (Dedicated Chat) */}
          <LanguageTutorChat
            module={selectedModule}
            currentLesson={currentLesson}
          />
        </>
      ) : (
        <div className="rounded-3xl p-12 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center space-y-4">
          <p className="text-stone-500 text-sm">
            Tiada pelajaran dimuatkan. Sila klik salah satu modul di atas.
          </p>
          <button
            type="button"
            onClick={handleRegenerateCurrent}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-theme-primary text-white"
          >
            Muat Semula
          </button>
        </div>
      )}
    </div>
  );
};
