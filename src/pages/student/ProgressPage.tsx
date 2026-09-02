import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserQuizAttempts } from '../../services/quizService';
import { getAllUserNoteProgress } from '../../services/contentService';
import { calculateLevelFromXp } from '../../services/xpService';
import { QuizAttempt, UserNoteProgress } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import {
  TrendingUp,
  Award,
  Flame,
  BookOpen,
  CheckCircle2,
  Calendar,
  Zap,
  Target,
  BarChart2,
} from 'lucide-react';

interface ProgressPageProps {
  navigate: (route: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ navigate }) => {
  const { userProfile } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [noteProgress, setNoteProgress] = useState<Record<string, UserNoteProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const [attList, progList] = await Promise.all([
          getUserQuizAttempts(userProfile.uid),
          getAllUserNoteProgress(userProfile.uid),
        ]);
        setAttempts(attList);
        setNoteProgress(progList);
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userProfile]);

  if (!userProfile) return null;

  const levelInfo = calculateLevelFromXp(userProfile.xp || 0);
  const completedNotesCount = (Object.values(noteProgress) as UserNoteProgress[]).filter((p) => p.completed).length;
  const passedQuizzesCount = attempts.filter((a) => a.status === 'passed').length;
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length)
      : 0;

  return (
    <div id="progress-page" className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight mb-2">
          Kemajuan Pembelajaran
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
          Pantau rekod pencapaian, aktiviti kuiz, dan status mata pengalaman (XP) sepanjang sesi pembelajaran KSSM anda.
        </p>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100 block">
            {userProfile.xp || 0}
          </span>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Mata XP (Tahap {levelInfo.level})
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100 block">
            {userProfile.streak || 0} Hari
          </span>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Streak Pembelajaran
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100 block">
            {completedNotesCount}
          </span>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Nota Selesai Dibaca
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center mb-3">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100 block">
            {avgScore}%
          </span>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Purata Skor Kuiz ({passedQuizzesCount}/{attempts.length} Lulus)
          </span>
        </div>
      </div>

      {/* Quiz History Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
          Sejarah Percubaan Kuiz
        </h2>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : attempts.length === 0 ? (
          <EmptyState
            title="Belum ada aktiviti pembelajaran."
            description="Anda belum mengambil sebarang kuiz. Jawab kuiz latihan untuk membina rekod pencapaian anda."
            icon={Award}
            actionText="Jawab Kuiz Sekarang"
            onAction={() => navigate('/kuiz')}
          />
        ) : (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 sm:px-6">Kuiz / Subjek</th>
                    <th className="py-3.5 px-4 text-center">Markah</th>
                    <th className="py-3.5 px-4 text-center">Peratusan</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">XP</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Tarikh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold">
                        <div>{attempt.quizTitle}</div>
                        <div className="text-[11px] text-stone-400 font-normal">
                          {attempt.subjectName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {attempt.score} / {attempt.totalMarks}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black">
                        {attempt.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            attempt.status === 'passed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {attempt.status === 'passed' ? 'Lulus' : 'Gagal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-theme-primary">
                        +{attempt.xpEarned}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right text-stone-400 text-xs">
                        {new Date(attempt.submittedAt).toLocaleDateString('ms-MY')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
