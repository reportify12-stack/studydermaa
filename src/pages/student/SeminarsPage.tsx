import React, { useState, useEffect } from 'react';
import { getSeminars } from '../../services/seminarService';
import { Seminar, SeminarStatus } from '../../types';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Video,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Radio,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface SeminarsPageProps {
  navigate: (route: string) => void;
}

export const SeminarsPage: React.FC<SeminarsPageProps> = ({ navigate }) => {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSeminars = async () => {
      setLoading(true);
      try {
        const data = await getSeminars();
        setSeminars(data);
      } catch (err) {
        console.error('Error loading seminars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeminars();
  }, []);

  const liveSeminars = seminars.filter((s) => s.status === 'live');
  const upcomingSeminars = seminars.filter((s) => s.status === 'upcoming');
  const completedSeminars = seminars.filter((s) => s.status === 'completed');

  const filteredSeminars = seminars.filter((s) => {
    const matchesTab = activeTab === 'all' || s.status === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      (s.speaker && s.speaker.toLowerCase().includes(q)) ||
      (s.subject && s.subject.toLowerCase().includes(q)) ||
      s.description.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <div id="student-seminars-page" className="space-y-8 pb-16 animate-fade-in">
      {/* Hero Banner with Live Badge */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                <Video className="w-4 h-4" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                Live Seminar & Webinar KSSM
              </span>
              {liveSeminars.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-500 text-white animate-pulse shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {liveSeminars.length} SESI SEDANG LIVE
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight">
              Seminar Interaktif Dalam Talian
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Sertai sesi bimbingan langsung bersama guru cemerlang KSSM. Pelajari tip peperiksaan, teknik menjawab soalan KBAT, dan bertanyakan soalan secara terus melalui Zoom atau Google Meet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Sesi Live</span>
              <span className="text-xl font-black text-red-600 dark:text-red-400 block">{liveSeminars.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Akan Datang</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 block">{upcomingSeminars.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Selesai</span>
              <span className="text-xl font-black text-stone-700 dark:text-stone-300 block">{completedSeminars.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE LIVE HIGHLIGHT (If any seminar is currently LIVE) */}
      {liveSeminars.length > 0 && (
        <section aria-labelledby="active-live-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h2 id="active-live-heading" className="text-sm font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              Sedang Berlangsung Sekarang — Sertai Segera!
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {liveSeminars.map((liveItem) => (
              <div
                key={liveItem.id}
                className="p-6 rounded-3xl border-2 border-red-500/80 dark:border-red-600 bg-gradient-to-br from-red-50/70 via-white to-orange-50/40 dark:from-red-950/40 dark:via-stone-900 dark:to-stone-900 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white animate-pulse">
                      <Radio className="w-3.5 h-3.5" />
                      LIVE SEKARANG
                    </span>
                    {liveItem.subject && (
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/30">
                        {liveItem.subject}
                      </span>
                    )}
                    <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {liveItem.time}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                    {liveItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {liveItem.description}
                  </p>

                  {liveItem.speaker && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 pt-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>Dibimbing oleh: <strong className="text-stone-900 dark:text-stone-100">{liveItem.speaker}</strong></span>
                    </div>
                  )}
                </div>

                {/* Primary Join Button */}
                <div className="shrink-0 flex flex-col items-stretch md:items-end gap-2">
                  <a
                    id={`join-live-btn-${liveItem.id}`}
                    href={liveItem.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-2xl text-sm font-black text-white bg-red-600 hover:bg-red-700 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 group"
                  >
                    <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Sertai Seminar Sekarang</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-[11px] text-stone-400 text-center md:text-right">
                    Pautan dibuka dalam tab baharu (Google Meet / Zoom)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 self-start">
          <button
            type="button"
            id="tab-seminars-all"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Semua ({seminars.length})
          </button>
          <button
            type="button"
            id="tab-seminars-live"
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-red-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Live ({liveSeminars.length})
          </button>
          <button
            type="button"
            id="tab-seminars-upcoming"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Akan Datang ({upcomingSeminars.length})
          </button>
          <button
            type="button"
            id="tab-seminars-completed"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Telah Selesai ({completedSeminars.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="student-seminar-search"
            type="text"
            placeholder="Cari topik atau subjek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-theme-primary"
          />
        </div>
      </div>

      {/* Seminars Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredSeminars.length === 0 ? (
        <EmptyState
          title="Tiada seminar ditemui"
          description={
            searchQuery || activeTab !== 'all'
              ? 'Cuba ubah kata carian atau tukar tab pilihan anda.'
              : 'Semua jadual seminar sedang dikemaskini oleh pihak pentadbir.'
          }
          icon={Video}
          actionText="Lihat Semua Seminar"
          onAction={() => {
            setActiveTab('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSeminars.map((s) => {
            const isLive = s.status === 'live';
            const isUpcoming = s.status === 'upcoming';
            const isCompleted = s.status === 'completed';

            return (
              <div
                key={s.id}
                className={`p-6 rounded-3xl border bg-white dark:bg-stone-900 transition-all flex flex-col justify-between gap-5 hover:shadow-md ${
                  isLive
                    ? 'border-red-300 dark:border-red-900/80 ring-1 ring-red-400/30'
                    : 'border-stone-200/90 dark:border-stone-800'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Status & Subject header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {isLive && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        SEDANG LIVE
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Clock className="w-3.5 h-3.5" />
                        Akan Datang
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Telah Selesai
                      </span>
                    )}

                    {s.subject && (
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/30">
                        {s.subject}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-black text-stone-900 dark:text-stone-100 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {/* Details metadata */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{s.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{s.time}</span>
                    </div>
                    {s.speaker && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{s.speaker}</span>
                      </div>
                    )}
                    {s.tingkatan && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{s.tingkatan}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action / Join Button */}
                <div className="pt-2">
                  {isLive ? (
                    <a
                      id={`join-seminar-live-${s.id}`}
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-white bg-red-600 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Video className="w-4 h-4" />
                      <span>Sertai Seminar (LIVE)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : isUpcoming ? (
                    <a
                      id={`join-seminar-upcoming-${s.id}`}
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Video className="w-4 h-4 text-theme-primary" />
                      <span>Sertai Seminar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    s.recordingUrl ? (
                      <a
                        id={`watch-recording-${s.id}`}
                        href={s.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4 text-theme-primary" />
                        <span>Tonton Rakaman Seminar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-center text-stone-400 bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                        Sesi Seminar Telah Tamat
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
