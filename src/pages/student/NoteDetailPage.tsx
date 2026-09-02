import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { getNoteById, getUserNoteProgress, markNoteCompleted, toggleNoteBookmark } from '../../services/contentService';
import { Note, UserNoteProgress } from '../../types';
import {
  ArrowLeft,
  CheckCircle,
  Bookmark,
  Clock,
  BookOpen,
  Share2,
  Sparkles,
  Award,
  ChevronRight,
  Printer,
  Check,
} from 'lucide-react';

interface NoteDetailPageProps {
  noteId: string;
  navigate: (route: string) => void;
}

export const NoteDetailPage: React.FC<NoteDetailPageProps> = ({ noteId, navigate }) => {
  const { userProfile, refreshProfile } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [progress, setProgress] = useState<UserNoteProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [completionBanner, setCompletionBanner] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const n = await getNoteById(noteId);
        setNote(n);

        if (userProfile && n) {
          const p = await getUserNoteProgress(userProfile.uid, n.id);
          setProgress(p);
        }
      } catch (err) {
        console.error('Error fetching note details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, userProfile]);

  const handleMarkCompleted = async () => {
    if (!userProfile || !note || progress?.completed) return;
    setActionLoading(true);
    try {
      const result = await markNoteCompleted(userProfile.uid, note.id);
      setProgress((prev) => ({
        noteId: note.id,
        completed: true,
        bookmarked: prev?.bookmarked || false,
        lastViewed: new Date().toISOString(),
        completionDate: new Date().toISOString(),
      }));

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', '#eab308'],
      });

      setCompletionBanner(true);
      await refreshProfile();
    } catch (err) {
      console.error('Error completing note:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!userProfile || !note) return;
    try {
      const currentBookmarked = progress?.bookmarked || false;
      const newStatus = await toggleNoteBookmark(userProfile.uid, note.id, currentBookmarked);
      setProgress((prev) => ({
        noteId: note.id,
        completed: prev?.completed || false,
        bookmarked: newStatus,
        lastViewed: new Date().toISOString(),
      }));
      await refreshProfile();
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-1/4" />
        <div className="h-10 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
        <div className="h-64 bg-stone-100 dark:bg-stone-800 rounded-3xl" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Nota Tidak Dijumpai
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Nota ini mungkin telah dipadam atau tidak lagi diterbitkan.
        </p>
        <button
          onClick={() => navigate('/nota')}
          className="btn-theme-primary px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          Kembali ke Senarai Nota
        </button>
      </div>
    );
  }

  return (
    <div id="note-detail-page" className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Top navigation actions */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-notes-btn"
          onClick={() => navigate('/nota')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Senarai Nota</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="note-bookmark-btn"
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              progress?.bookmarked
                ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400 shadow-2xs'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
            }`}
            title="Simpan ke Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${progress?.bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">
              {progress?.bookmarked ? 'Disimpan' : 'Bookmark'}
            </span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 text-xs font-semibold hidden sm:flex items-center gap-1.5"
            title="Cetak Nota"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {completionBanner && (
        <div
          id="completion-success-banner"
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-bounce"
        >
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-bold">
                Tahniah! Anda telah menamatkan pembacaan nota ini.
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                +25 XP telah dimasukkan ke profil pembelajaran anda!
              </p>
            </div>
          </div>
          <button
            onClick={() => setCompletionBanner(false)}
            className="text-xs text-emerald-600 hover:underline font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Note Header Info */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/30">
            {note.subjectName}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            {note.tingkatan}
          </span>
          {note.chapterTitle && (
            <span className="text-xs text-stone-400 font-medium truncate max-w-xs">
              Bab: {note.chapterTitle}
            </span>
          )}
          <span className="text-xs text-stone-400 flex items-center gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            <span>{note.readTimeMinutes || 5} minit bacaan</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight">
          {note.title}
        </h1>

        {note.summary && (
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50/80 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800/60 italic">
            &quot;{note.summary}&quot;
          </p>
        )}
      </div>

      {/* Key Points Checklist */}
      {note.keyPoints && note.keyPoints.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl border border-theme-primary/30 bg-theme-surface/50 dark:bg-stone-900/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-theme-primary">
            <Sparkles className="w-4 h-4" />
            <span>Fakta Penting & Rumusan Utama</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {note.keyPoints.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/60 dark:border-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 shadow-2xs"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="p-6 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div className="prose dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
          {note.content}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Selesai Membaca Nota Ini?
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Tandakan sebagai selesai untuk mengemas kini rekod pembelajaran anda dan kumpul +25 XP.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {progress?.completed ? (
            <div className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Nota Selesai Dipelajari</span>
            </div>
          ) : (
            <button
              id="mark-note-completed-btn"
              onClick={handleMarkCompleted}
              disabled={actionLoading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs btn-theme-primary shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Tandakan Selesai (+25 XP)</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/kuiz?subjectId=${note.subjectId}`)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Uji Kuiz</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
