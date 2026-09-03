import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPublishedNotes, getPublishedSubjects, getPublishedAnnouncements, getAllUserNoteProgress } from '../../services/contentService';
import { getUserQuizAttempts } from '../../services/quizService';
import { getSeminars } from '../../services/seminarService';
import { Note, Subject, Announcement, QuizAttempt, UserNoteProgress, Seminar } from '../../types';
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
  Video,
  ExternalLink,
  Radio,
  Clock,
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
  const [seminars, setSeminars] = useState<Seminar[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const [subjRes, notesRes, annRes, attemptsRes, progRes, seminarsRes] = await Promise.all([
          getPublishedSubjects(),
          getPublishedNotes({ tingkatan: userProfile.tingkatan }),
          getPublishedAnnouncements(),
          getUserQuizAttempts(userProfile.uid),
          getAllUserNoteProgress(userProfile.uid),
          getSeminars(),
        ]);

        setSubjects(subjRes);
        setNotes(notesRes.slice(0, 6)); // Top notes for current tingkatan
        setAnnouncements(annRes.slice(0, 2));
        setRecentAttempts(attemptsRes.slice(0, 3));
        setUserProgressMap(progRes);
        setSeminars(seminarsRes);
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

      {/* AI Tutor Interactive Banner */}
      <div
        id="dashboard-ai-tutor-banner"
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent dark:from-emerald-950/40 dark:via-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                Ada persoalan pembelajaran KSSM?
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                Pintar & Pantas
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
              Tanya soalan Matematik, Sains, Sejarah, atau Bahasa Melayu kepada CikguDermarians. Dapatkan penjelasan langkah demi langkah mengikut format KSSM terkini!
            </p>
          </div>
        </div>

        <button
          id="dashboard-launch-tutor-btn"
          onClick={() => navigate('/ai-tutor')}
          className="px-5 py-2.5 rounded-2xl bg-theme-primary text-white text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Buka CikguDermarians</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Seminar Section on Dashboard */}
      {seminars.length > 0 && (
        <section id="dashboard-seminars-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display flex items-center gap-2">
                  <span>Live Seminar & Webinar KSSM</span>
                  {seminars.some((s) => s.status === 'live') && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                      LIVE SEKARANG
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Sertai bengkel teknik menjawab dan bimbingan langsung secara atas talian
                </p>
              </div>
            </div>

            <button
              id="dashboard-all-seminars-btn"
              onClick={() => navigate('/seminars')}
              className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Seminar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seminars.slice(0, 3).map((s) => {
              const isLive = s.status === 'live';
              const isUpcoming = s.status === 'upcoming';

              return (
                <div
                  key={s.id}
                  className={`p-5 rounded-3xl border bg-white dark:bg-stone-900 flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                    isLive
                      ? 'border-red-400 dark:border-red-900 ring-2 ring-red-500/20'
                      : 'border-stone-200/80 dark:border-stone-800'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          LIVE
                        </span>
                      ) : isUpcoming ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <Clock className="w-3 h-3" />
                          Akan Datang
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-500">
                          Selesai
                        </span>
                      )}

                      {s.subject && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/30 truncate max-w-[120px]">
                          {s.subject}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                      {s.title}
                    </h3>

                    <div className="text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{s.date} • {s.time}</span>
                      </div>
                      {s.speaker && (
                        <div className="truncate text-stone-600 dark:text-stone-300">
                          {s.speaker}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prominent Join Seminar button for upcoming or live */}
                  <div>
                    {isLive ? (
                      <a
                        id={`dashboard-join-live-${s.id}`}
                        href={s.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Video className="w-4 h-4" />
                        <span>Sertai Seminar (LIVE)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : isUpcoming ? (
                      <a
                        id={`dashboard-join-upcoming-${s.id}`}
                        href={s.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-98 transition-all flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4 text-theme-primary" />
                        <span>Sertai Seminar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate('/seminars')}
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-50 dark:bg-stone-800/40 hover:bg-stone-100 transition-all text-center"
                      >
                        Lihat Maklumat Sesi
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
