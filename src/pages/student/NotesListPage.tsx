import React, { useState, useEffect } from 'react';
import { getPublishedNotes, getPublishedSubjects, getAllUserNoteProgress } from '../../services/contentService';
import { useAuth } from '../../contexts/AuthContext';
import { Note, Subject, TingkatanType, TINGKATAN_OPTIONS, UserNoteProgress } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface NotesListPageProps {
  navigate: (route: string) => void;
}

export const NotesListPage: React.FC<NotesListPageProps> = ({ navigate }) => {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, UserNoteProgress>>({});

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedTingkatan, setSelectedTingkatan] = useState<string>(userProfile?.tingkatan || 'all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Read query params from URL if any
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
        const [subList, noteList] = await Promise.all([
          getPublishedSubjects(),
          getPublishedNotes({
            subjectId: selectedSubjectId === 'all' ? undefined : selectedSubjectId,
            tingkatan: selectedTingkatan === 'all' ? undefined : (selectedTingkatan as TingkatanType),
            searchQuery: searchTerm,
          }),
        ]);
        setSubjects(subList);
        setNotes(noteList);

        if (userProfile) {
          const prog = await getAllUserNoteProgress(userProfile.uid);
          setUserProgressMap(prog);
        }
      } catch (err) {
        console.error('Error fetching notes list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSubjectId, selectedTingkatan, searchTerm, userProfile]);

  return (
    <div id="notes-list-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight mb-2">
          Koleksi Nota KSSM
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
          Semak dan baca nota ringkas, peta minda, dan fakta penting bagi setiap subjek kurikulum standard.
        </p>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          {/* Search input */}
          <div className="relative">
            <input
              id="notes-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tajuk nota atau topik..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>

          {/* Subject Filter */}
          <select
            id="notes-subject-filter"
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

          {/* Tingkatan Filter */}
          <select
            id="notes-tingkatan-filter"
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

      {/* Notes Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : notes.length === 0 ? (
        <EmptyState
          title="Belum ada nota tersedia."
          description="Tiada nota ditemui berdasarkan penapis yang dipilih. Sila pilih subjek atau tingkatan lain."
          icon={BookOpen}
          actionText="Set Semula Penapis"
          onAction={() => {
            setSelectedSubjectId('all');
            setSelectedTingkatan('all');
            setSearchTerm('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => {
            const isCompleted = userProgressMap[note.id]?.completed;
            return (
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
                    <span className="text-[11px] font-semibold text-stone-400">
                      {note.tingkatan}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors line-clamp-2 mb-2">
                    {note.title}
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {note.summary || 'Klik untuk membuka modul bacaan dan isi penting.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{note.readTimeMinutes || 5} minit</span>
                  </span>

                  {isCompleted ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <span className="font-bold text-theme-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Baca</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
