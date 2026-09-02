import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUserNoteProgress, getNoteById, toggleNoteBookmark } from '../../services/contentService';
import { Note } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { Bookmark, BookOpen, Clock, ArrowRight, Trash2 } from 'lucide-react';

interface BookmarksPageProps {
  navigate: (route: string) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ navigate }) => {
  const { userProfile, refreshProfile } = useAuth();
  const [bookmarkedNotes, setBookmarkedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const progMap = await getAllUserNoteProgress(userProfile.uid);
        const bookmarkedIds = Object.keys(progMap).filter((id) => progMap[id].bookmarked);

        const notes = await Promise.all(
          bookmarkedIds.map((id) => getNoteById(id).catch(() => null))
        );

        setBookmarkedNotes(notes.filter((n): n is Note => n !== null));
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [userProfile]);

  const handleRemoveBookmark = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) return;
    try {
      await toggleNoteBookmark(userProfile.uid, noteId, true);
      setBookmarkedNotes((prev) => prev.filter((n) => n.id !== noteId));
      await refreshProfile();
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  if (!userProfile) return null;

  return (
    <div id="bookmarks-page" className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight mb-2">
          Nota Disimpan (Bookmark)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
          Akses pantas kepada nota dan topik KSSM yang telah anda tandakan untuk rujukan dan ulangkaji pantas.
        </p>
      </div>

      {/* Bookmarked Notes Grid */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : bookmarkedNotes.length === 0 ? (
        <EmptyState
          title="Anda belum mempunyai bookmark."
          description="Simpan nota penting dengan menekan butang 'Bookmark' pada halaman nota untuk rujukan masa hadapan."
          icon={Bookmark}
          actionText="Teroka Nota Sekarang"
          onAction={() => navigate('/nota')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarkedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/nota/${note.id}`)}
              className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:border-theme-primary/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/20">
                    {note.subjectName}
                  </span>
                  <button
                    onClick={(e) => handleRemoveBookmark(note.id, e)}
                    className="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Buang dari Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors line-clamp-2 mb-2">
                  {note.title}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {note.summary || 'Klik untuk membuka rujukan nota ini.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{note.readTimeMinutes || 5} min</span>
                </span>
                <span className="font-bold text-theme-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Buka Nota</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
