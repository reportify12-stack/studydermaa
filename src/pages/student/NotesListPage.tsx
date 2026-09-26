import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getPublishedSubjects, getAllUserNoteProgress } from '../../services/contentService';
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
  Globe,
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
        const subList = await getPublishedSubjects();
        setSubjects(subList);

        // Identify current subject
        const selectedSubject = subList.find((s) => s.id === selectedSubjectId);
        const subjectName = selectedSubject?.name || '';
        const isDlpSubject = subjectName === 'Matematik' || subjectName === 'Sains';

        // Base Firestore query
        let notesQuery = query(collection(db, 'notes'), where('published', '==', true));

        if (selectedSubjectId !== 'all') {
          notesQuery = query(notesQuery, where('subjectId', '==', selectedSubjectId));
        }

        if (selectedTingkatan !== 'all') {
          notesQuery = query(notesQuery, where('tingkatan', '==', selectedTingkatan));
        }

        // Strict Dual Language Programme (DLP) filtering:
        // If the selected subject is 'Matematik' or 'Sains', apply a filter: where('isDLP', '==', currentUserProfile.isDLP)
        // If it's any other subject, skip the DLP filter.
        if (isDlpSubject) {
          const currentUserIsDLP = Boolean(userProfile?.isDLP);
          notesQuery = query(notesQuery, where('isDLP', '==', currentUserIsDLP));
        }

        const snap = await getDocs(notesQuery);
        let noteList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note));

        // Client-side text search filtering
        if (searchTerm.trim().length > 0) {
          const sq = searchTerm.trim().toLowerCase();
          noteList = noteList.filter(
            (n) =>
              n.title.toLowerCase().includes(sq) ||
              n.summary.toLowerCase().includes(sq) ||
              n.subjectName.toLowerCase().includes(sq) ||
              (n.keyPoints && n.keyPoints.some((kp) => kp.toLowerCase().includes(sq)))
          );
        }

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
  }, [selectedSubjectId, selectedTingkatan, searchTerm, userProfile?.isDLP, userProfile?.uid]);

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

        {/* DLP Subject Notification Banner */}
        {(() => {
          const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
          const isDlp = selectedSubject?.name === 'Matematik' || selectedSubject?.name === 'Sains';
          if (!isDlp) return null;

          return (
            <div className="mt-4 p-3.5 rounded-2xl border border-sky-200/90 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <div>
                  <span className="font-bold text-sky-950 dark:text-sky-100">
                    Penapisan Program DwiBahasa (DLP) Aktif:
                  </span>{' '}
                  <span className="text-stone-600 dark:text-stone-300">
                    Memaparkan nota {selectedSubject?.name} versi{' '}
                    <strong className="text-sky-700 dark:text-sky-300 font-black">
                      {userProfile?.isDLP ? 'Bahasa Inggeris (DLP)' : 'Bahasa Melayu (Bukan DLP)'}
                    </strong>{' '}
                    mengikut tetapan profil anda.
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0 text-left sm:text-right"
              >
                Ubah Tetapan DLP &rarr;
              </button>
            </div>
          );
        })()}
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/20">
                        {note.subjectName}
                      </span>
                      {note.isDLP && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                          DLP
                        </span>
                      )}
                    </div>
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
