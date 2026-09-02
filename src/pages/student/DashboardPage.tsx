import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPublishedNotes, getPublishedSubjects, getPublishedAnnouncements, getAllUserNoteProgress } from '../../services/contentService';
import { getUserQuizAttempts } from '../../services/quizService';
import { Note, Subject, Announcement, QuizAttempt, UserNoteProgress } from '../../types';
import { StreakBadge } from '../../components/common/StreakBadge';
import { XpBadge } from '../../components/common/XpBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  BookOpen,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Flame,
  Award,
  Bell,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Calendar,
  Compass,
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, UserNoteProgress>>({});

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const [subjRes, notesRes, annRes, attemptsRes, progRes] = await Promise.all([
          getPublishedSubjects(),
          getPublishedNotes({ tingkatan: userProfile.tingkatan }),
          getPublishedAnnouncements(),
          getUserQuizAttempts(userProfile.uid),
          getAllUserNoteProgress(userProfile.uid),
        ]);

        setSubjects(subjRes);
        setNotes(notesRes.slice(0, 6)); // Top notes for current tingkatan
        setAnnouncements(annRes.slice(0, 2));
        setRecentAttempts(attemptsRes.slice(0, 3));
        setUserProgressMap(progRes);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userProfile]);

  if (!userProfile) return null;

  return (
    <div id="student-dashboard" className="space-y-8 pb-12 animate-fade-in">
      {/* Top Greeting & Motivational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/30">
              {userProfile.tingkatan}
            </span>
            {userProfile.school && (
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate max-w-xs">
                {userProfile.school}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight">
            Selamat Kembali, {userProfile.fullName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Teruskan rentak kecemerlangan akademik KSSM anda hari ini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-explore-notes-btn"
            onClick={() => navigate('/nota')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm btn-theme-primary shadow-xs flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Teroka Nota</span>
          </button>
          <button
            id="dashboard-explore-quiz-btn"
            onClick={() => navigate('/kuiz')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-2xs flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-theme-primary" />
            <span>Jawab Kuiz</span>
          </button>
        </div>
      </div>

      {/* Announcements if any */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 flex items-start gap-3.5 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    {ann.title}
                  </span>
                  {ann.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                      {ann.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gamification & Streak Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          <XpBadge xp={userProfile.xp || 0} level={userProfile.level || 1} />
        </div>
        <div>
          <StreakBadge
            streak={userProfile.streak || 0}
            longestStreak={userProfile.longestStreak || 0}
            showDetails
          />
        </div>
      </div>

      {/* KSSM Subject Quick Launch */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
              Mata Pelajaran KSSM
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Pilih subjek untuk memulakan sesi pembelajaran dan ulangkaji
            </p>
          </div>
          <button
            id="view-all-subjects-btn"
            onClick={() => navigate('/belajar')}
            className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Subjek</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <CardSkeleton count={4} />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="Belum ada subjek tersedia."
            description="Pentadbir belum memasukkan senarai subjek. Sila semak semula sebentar lagi."
            icon={BookOpen}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.slice(0, 8).map((subject) => (
              <button
                key={subject.id}
                onClick={() => navigate(`/nota?subjectId=${subject.id}`)}
                className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-theme-primary/50 dark:hover:border-theme-primary/50 hover:shadow-md transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-theme-surface text-theme-primary flex items-center justify-center mb-3 font-bold text-sm border border-theme-primary/30 group-hover:scale-105 transition-transform">
                  {subject.code || subject.name.substring(0, 2)}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors line-clamp-1">
                  {subject.name}
                </h3>
                <span className="text-[11px] text-stone-400 font-medium">
                  {subject.category || 'KSSM'}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Notes for Tingkatan */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
              Nota Pilihan {userProfile.tingkatan}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ulangkaji topik terpilih mengikut silibus terkini
            </p>
          </div>
          <button
            id="view-all-notes-btn"
            onClick={() => navigate('/nota')}
            className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
          >
            <span>Semua Nota</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : notes.length === 0 ? (
          <EmptyState
            title="Belum ada nota tersedia."
            description={`Pentadbir belum menerbitkan nota untuk ${userProfile.tingkatan}.`}
            icon={BookOpen}
            actionText="Teroka Subjek Lain"
            onAction={() => navigate('/belajar')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => {
              const isCompleted = userProgressMap[note.id]?.completed;
              return (
                <div
                  key={note.id}
                  onClick={() => navigate(`/nota/${note.id}`)}
                  className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-theme-primary/60 dark:hover:border-theme-primary/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {note.subjectName}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors line-clamp-2 mb-1.5">
                      {note.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {note.summary || 'Klik untuk membaca nota padat dan latihan topik ini.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                    <span>{note.readTimeMinutes || 5} minit bacaan</span>
                    <span className="font-semibold text-theme-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Baca Nota <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Quiz Attempts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
            Aktiviti Kuiz Terkini
          </h2>
          <button
            onClick={() => navigate('/progress')}
            className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
          >
            <span>Rekod Penuh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAttempts.length === 0 ? (
          <EmptyState
            title="Belum ada aktiviti pembelajaran."
            description="Anda belum mencuba sebarang kuiz latihan. Jawab kuiz untuk kumpul mata XP dan semak kefahaman topik."
            icon={HelpCircle}
            actionText="Mula Jawab Kuiz"
            onAction={() => navigate('/kuiz')}
          />
        ) : (
          <div className="space-y-3">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                      attempt.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {attempt.percentage}%
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {attempt.quizTitle}
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      {attempt.subjectName} • {new Date(attempt.submittedAt).toLocaleDateString('ms-MY')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-theme-primary block">
                    +{attempt.xpEarned} XP
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      attempt.status === 'passed'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    }`}
                  >
                    {attempt.status === 'passed' ? 'Lulus' : 'Perlu Ulang'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
