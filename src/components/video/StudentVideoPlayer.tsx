import React, { useState, useEffect, useMemo } from 'react';
import { LearningVideo, KSSM_DEFAULT_SUBJECTS } from '../../types';
import { getAllLearningVideos, seedInitialVideosIfEmpty } from '../../services/videoService';
import { extractYouTubeVideoId } from '../../utils/youtube';
import {
  Play,
  PlayCircle,
  Video,
  BookOpen,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Layers,
  Search,
  ExternalLink,
  Film,
  Award,
  Share2,
} from 'lucide-react';

interface StudentVideoPlayerProps {
  initialSubject?: string;
  navigate?: (route: string) => void;
}

export const StudentVideoPlayer: React.FC<StudentVideoPlayerProps> = ({
  initialSubject,
  navigate,
}) => {
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'Matematik');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('study_dermaa_watched_videos');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Load videos from Firestore
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        let data = await getAllLearningVideos();
        // If empty, auto-seed with standard KSSM sample lessons
        if (data.length === 0) {
          data = await seedInitialVideosIfEmpty();
        }
        setVideos(data);

        // Pick initial subject if specified or default to the first available subject
        if (data.length > 0) {
          const subjectsWithVideos = Array.from(new Set(data.map((v) => v.subject)));
          if (initialSubject && subjectsWithVideos.includes(initialSubject)) {
            setSelectedSubject(initialSubject);
          } else if (subjectsWithVideos.includes('Matematik')) {
            setSelectedSubject('Matematik');
          } else if (subjectsWithVideos[0]) {
            setSelectedSubject(subjectsWithVideos[0]);
          }
        }
      } catch (err) {
        console.error('Error loading learning videos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [initialSubject]);

  // Extract all distinct subjects from available videos
  const availableSubjects = useMemo(() => {
    const subjectsMap = new Map<string, number>();
    // First include default KSSM subjects
    KSSM_DEFAULT_SUBJECTS.forEach((s) => {
      subjectsMap.set(s.name, 0);
    });
    // Count videos
    videos.forEach((v) => {
      subjectsMap.set(v.subject, (subjectsMap.get(v.subject) || 0) + 1);
    });

    // Sort: subjects with videos first, then alphabetical
    return Array.from(subjectsMap.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [videos]);

  // Filter videos for currently selected subject
  const currentSubjectVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchSubject = v.subject.toLowerCase() === selectedSubject.toLowerCase();
      if (!matchSubject) return false;
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (
        v.chapter.toLowerCase().includes(q) ||
        (v.title && v.title.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    });
  }, [videos, selectedSubject, searchFilter]);

  // Set active video (defaults to first chapter in subject if not set or invalid)
  const activeVideo = useMemo(() => {
    if (selectedChapterId) {
      const found = currentSubjectVideos.find((v) => v.id === selectedChapterId);
      if (found) return found;
    }
    return currentSubjectVideos[0] || null;
  }, [currentSubjectVideos, selectedChapterId]);

  // Sync selectedChapterId when subject changes
  useEffect(() => {
    if (currentSubjectVideos.length > 0) {
      const exists = currentSubjectVideos.some((v) => v.id === selectedChapterId);
      if (!exists) {
        setSelectedChapterId(currentSubjectVideos[0].id);
      }
    } else {
      setSelectedChapterId(null);
    }
  }, [selectedSubject, currentSubjectVideos, selectedChapterId]);

  // Extract ID
  const activeVideoId = useMemo(() => {
    if (!activeVideo) return null;
    return activeVideo.youtubeVideoId || extractYouTubeVideoId(activeVideo.youtubeLink);
  }, [activeVideo]);

  // Navigation: Next & Previous Chapter
  const activeIndex = currentSubjectVideos.findIndex((v) => v.id === activeVideo?.id);
  const prevVideo = activeIndex > 0 ? currentSubjectVideos[activeIndex - 1] : null;
  const nextVideo =
    activeIndex >= 0 && activeIndex < currentSubjectVideos.length - 1
      ? currentSubjectVideos[activeIndex + 1]
      : null;

  const toggleWatchStatus = (videoId: string) => {
    setWatchedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      try {
        localStorage.setItem('study_dermaa_watched_videos', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div id="student-video-player-root" className="space-y-6">
      {/* Top Header & Subject Selector */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/60 mb-2">
              <Film className="w-3.5 h-3.5" />
              <span>Video Pembelajaran KSSM</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              Tonton & Kuasai Konsep Sukatan
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              Pilih subjek dan bab pilihan untuk menonton penerangan video interaktif terus di dalam portal.
            </p>
          </div>

          {/* Subject Dropdown Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[220px]">
              <label htmlFor="student-video-subject-select" className="sr-only">
                Pilih Subjek
              </label>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <select
                id="student-video-subject-select"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapterId(null);
                }}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-2xs transition-all"
              >
                {availableSubjects.map(([subj, count]) => (
                  <option key={subj} value={subj}>
                    {subj} {count > 0 ? `(${count} Video)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setTheaterMode(!theaterMode)}
              title={theaterMode ? 'Mod Standard' : 'Mod Teater'}
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/60 text-xs font-semibold shadow-2xs transition-all"
            >
              {theaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{theaterMode ? 'Mod Biasa' : 'Mod Teater'}</span>
            </button>
          </div>
        </div>

        {/* Quick Subject Tabs */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 shrink-0 mr-1">
            Subjek Utama:
          </span>
          {['Matematik', 'Sains', 'Sejarah', 'Bahasa Melayu', 'Bahasa Inggeris', 'Geografi'].map((s) => {
            const count = videos.filter((v) => v.subject.toLowerCase() === s.toLowerCase()).length;
            const isSelected = selectedSubject.toLowerCase() === s.toLowerCase();
            return (
              <button
                key={s}
                id={`student-video-subj-pill-${s.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setSelectedSubject(s);
                  setSelectedChapterId(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <span>{s}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-rose-700 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Video & Chapters Area */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video w-full rounded-2xl bg-stone-200 dark:bg-stone-800" />
            <div className="h-6 w-3/4 rounded-lg bg-stone-200 dark:bg-stone-800" />
            <div className="h-4 w-1/2 rounded-lg bg-stone-200 dark:bg-stone-800" />
          </div>
          <div className="space-y-3">
            <div className="h-10 w-full rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="h-20 w-full rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="h-20 w-full rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="h-20 w-full rounded-xl bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>
      ) : currentSubjectVideos.length === 0 ? (
        /* Empty State when no videos exist for this subject */
        <div
          id="student-video-empty-subject"
          className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center">
            <Film className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Belum Ada Video untuk Subjek &quot;{selectedSubject}&quot;
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              Guru dan pentadbir sedang menyediakan video pembelajaran terkini untuk subjek ini. Sila pilih subjek lain yang sedia ada.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              onClick={() => setSelectedSubject('Matematik')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-2xs"
            >
              Tonton Matematik (3+ Video)
            </button>
            <button
              onClick={() => setSelectedSubject('Sains')}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
            >
              Tonton Sains
            </button>
          </div>
        </div>
      ) : (
        /* Active Video & Chapter Navigation Layout */
        <div
          className={`grid gap-6 transition-all ${
            theaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
          }`}
        >
          {/* Video Player Column */}
          <div className={`${theaterMode ? 'w-full' : 'lg:col-span-8'} space-y-4`}>
            {/* Embedded Native <iframe> Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-stone-200 dark:border-stone-800">
              {activeVideoId ? (
                <iframe
                  id="student-active-video-iframe"
                  src={`https://www.youtube.com/embed/${activeVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
                  title={activeVideo?.title || activeVideo?.chapter || 'Video Pembelajaran'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center">
                  <PlayCircle className="w-12 h-12 mb-2 text-rose-500" />
                  <p className="font-bold text-sm">Pautan Video Tidak Sah</p>
                  <p className="text-xs text-white/50 mt-1">Sila hubungi pentadbir untuk semakan pautan.</p>
                </div>
              )}
            </div>

            {/* Video Controls & Information Card */}
            {activeVideo && (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs space-y-4">
                {/* Badges & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/60">
                      {activeVideo.subject}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-900/60">
                      {activeVideo.chapter}
                    </span>
                    {activeVideo.tingkatan && (
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold">
                        {activeVideo.tingkatan}
                      </span>
                    )}
                    {activeVideo.duration && (
                      <span className="inline-flex items-center gap-1 text-xs text-stone-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {activeVideo.duration}
                      </span>
                    )}
                  </div>

                  {/* Mark Watched Button */}
                  <button
                    id="student-video-mark-watched-btn"
                    onClick={() => toggleWatchStatus(activeVideo.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      watchedVideos.has(activeVideo.id)
                        ? 'bg-emerald-500 text-white shadow-2xs'
                        : 'border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {watchedVideos.has(activeVideo.id) ? 'Telah Ditonton' : 'Tanda Selesai Tonton'}
                    </span>
                  </button>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                    {activeVideo.title || `${activeVideo.subject} - ${activeVideo.chapter}`}
                  </h2>
                  {activeVideo.description && (
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      {activeVideo.description}
                    </p>
                  )}
                </div>

                {/* Next & Previous Chapter Navigation Bar */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                  {prevVideo ? (
                    <button
                      id="student-video-prev-chapter-btn"
                      onClick={() => setSelectedChapterId(prevVideo.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Bab Sebelumnya:</span>
                      <span className="truncate max-w-[120px]">{prevVideo.chapter}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextVideo ? (
                    <button
                      id="student-video-next-chapter-btn"
                      onClick={() => setSelectedChapterId(nextVideo.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition-all ml-auto"
                    >
                      <span>Seterusnya:</span>
                      <span className="truncate max-w-[120px]">{nextVideo.chapter}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-xs text-stone-400 font-medium">
                      Tahniah! Anda telah menamatkan semua bab untuk subjek ini.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chapters Sidebar / Playlist Column */}
          <div className={`${theaterMode ? 'w-full' : 'lg:col-span-4'} space-y-4`}>
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Senarai Bab ({currentSubjectVideos.length})
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-stone-400 uppercase">
                  {selectedSubject}
                </span>
              </div>

              {/* Search Chapters in Subject */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari tajuk bab..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Chapter Items List */}
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {currentSubjectVideos.map((video, index) => {
                  const isActive = video.id === activeVideo?.id;
                  const isWatched = watchedVideos.has(video.id);

                  return (
                    <button
                      key={video.id}
                      id={`student-chapter-btn-${video.id}`}
                      onClick={() => setSelectedChapterId(video.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                        isActive
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/80 shadow-2xs'
                          : 'bg-white dark:bg-stone-900/60 border-stone-200/80 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                      }`}
                    >
                      {/* Play State / Number Indicator */}
                      <div
                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 ${
                          isActive
                            ? 'bg-rose-500 text-white'
                            : isWatched
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                        }`}
                      >
                        {isActive ? (
                          <Play className="w-3.5 h-3.5 fill-white" />
                        ) : isWatched ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Chapter Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs font-bold truncate ${
                              isActive
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-stone-900 dark:text-stone-100'
                            }`}
                          >
                            {video.chapter}
                          </p>
                          {video.duration && (
                            <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                              {video.duration}
                            </span>
                          )}
                        </div>

                        {video.title && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                            {video.title}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Helper Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-rose-50 dark:from-purple-950/30 dark:to-rose-950/30 border border-purple-200/60 dark:border-purple-900/40 space-y-2">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Tip Pembelajaran KSSM</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                Tonton video secara berperingkat mengikut bab. Selesai menonton, cuba uji kefahaman anda melalui Kuiz Interaktif di tab menu sebelah.
              </p>
              {navigate && (
                <button
                  onClick={() => navigate('/kuiz')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline pt-1"
                >
                  <span>Buka Kuiz Latihan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
