import React, { useState, useEffect } from 'react';
import { getPublishedQuizzes, getPublishedSubjects } from '../../services/quizService';
import { useAuth } from '../../contexts/AuthContext';
import { Quiz, Subject, TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  HelpCircle,
  Search,
  Clock,
  Award,
  Play,
  CheckCircle2,
  FileQuestion,
  Sparkles,
} from 'lucide-react';

interface QuizListPageProps {
  navigate: (route: string) => void;
}

export const QuizListPage: React.FC<QuizListPageProps> = ({ navigate }) => {
  const { userProfile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedTingkatan, setSelectedTingkatan] = useState<string>(userProfile?.tingkatan || 'all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subParam = params.get('subjectId');
    const tingParam = params.get('tingkatan');
    if (subParam) setSelectedSubjectId(subParam);
    if (tingParam) setSelectedTingkatan(tingParam);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subList, quizList] = await Promise.all([
          getPublishedSubjects(),
          getPublishedQuizzes(
            selectedSubjectId === 'all' ? undefined : selectedSubjectId,
            selectedTingkatan === 'all' ? undefined : (selectedTingkatan as TingkatanType)
          ),
        ]);
        setSubjects(subList);

        let filtered = quizList;
        if (searchTerm.trim()) {
          const sq = searchTerm.trim().toLowerCase();
          filtered = filtered.filter(
            (q) =>
              q.title.toLowerCase().includes(sq) ||
              q.subjectName.toLowerCase().includes(sq) ||
              q.description?.toLowerCase().includes(sq)
          );
        }
        setQuizzes(filtered);
      } catch (err) {
        console.error('Error fetching quiz list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSubjectId, selectedTingkatan, searchTerm]);

  return (
    <div id="quiz-list-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight mb-2">
          Kuiz & Latihan Interaktif KSSM
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
          Uji tahap kefahaman topik anda dengan soalan objektif, subjektif, dan KBAT. Kumpul markah dan mata XP!
        </p>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="relative">
            <input
              id="quiz-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tajuk kuiz atau topik..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>

          <select
            id="quiz-subject-filter"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all"
          >
            <option value="all">Semua Subjek</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            id="quiz-tingkatan-filter"
            value={selectedTingkatan}
            onChange={(e) => setSelectedTingkatan(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all"
          >
            <option value="all">Semua Tingkatan</option>
            {TINGKATAN_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="Belum ada kuiz tersedia."
          description="Tiada kuiz ditemui berdasarkan penapis yang dipilih. Pentadbir akan menambah soalan latihan dari semasa ke semasa."
          icon={HelpCircle}
          actionText="Set Semula Penapis"
          onAction={() => {
            setSelectedSubjectId('all');
            setSelectedTingkatan('all');
            setSearchTerm('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:border-theme-primary/60 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/20">
                    {quiz.subjectName}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-400">
                    {quiz.tingkatan}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors line-clamp-2 mb-2">
                  {quiz.title}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
                  {quiz.description || 'Uji pemahaman anda dengan menjawab set soalan ini.'}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-center">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Soalan</span>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {quiz.totalQuestions || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Masa</span>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {quiz.durationMinutes} min
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Lulus</span>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {quiz.passPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                  Maks {quiz.totalMarks} Markah
                </span>

                <button
                  id={`start-quiz-${quiz.id}-btn`}
                  onClick={() => navigate(`/kuiz/${quiz.id}`)}
                  className="py-2 px-4 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-1.5 group-hover:scale-102 transition-transform cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mula Kuiz</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
