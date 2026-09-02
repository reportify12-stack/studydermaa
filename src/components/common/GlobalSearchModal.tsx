import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { getPublishedNotes } from '../../services/contentService';
import { getPublishedQuizzes } from '../../services/quizService';
import { Note, Quiz } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
  onSelectQuiz: (quizId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectNote,
  onSelectQuiz,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setNotes([]);
      setQuizzes([]);
      setHasSearched(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setNotes([]);
      setQuizzes([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [notesRes, quizzesRes] = await Promise.all([
          getPublishedNotes({ searchQuery: searchTerm }),
          getPublishedQuizzes(),
        ]);

        const sq = searchTerm.trim().toLowerCase();
        const filteredQuizzes = quizzesRes.filter(
          (q) =>
            q.title.toLowerCase().includes(sq) ||
            q.subjectName.toLowerCase().includes(sq) ||
            q.tingkatan.toLowerCase().includes(sq)
        );

        setNotes(notesRes);
        setQuizzes(filteredQuizzes);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="global-search-modal"
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nota, topik, kuiz, atau subjek..."
            className="w-full bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden text-sm sm:text-base"
            autoFocus
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-theme-primary animate-spin shrink-0" />
          ) : searchTerm ? (
            <button
              id="clear-search-btn"
              onClick={() => setSearchTerm('')}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-500">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!hasSearched && !loading && (
            <div className="py-12 text-center text-stone-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-theme-primary" />
              Taip kata kunci untuk mula mencari bahan rujukan KSSM.
            </div>
          )}

          {hasSearched && !loading && notes.length === 0 && quizzes.length === 0 && (
            <div className="py-10 text-center text-stone-500 dark:text-stone-400 text-sm">
              Tiada hasil ditemui untuk &quot;<span className="font-semibold text-stone-800 dark:text-stone-200">{searchTerm}</span>&quot;.
            </div>
          )}

          {/* Notes Results */}
          {notes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Nota Pembelajaran ({notes.length})</span>
              </div>
              <div className="space-y-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onSelectNote(note.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/60 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {note.subjectName}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {note.tingkatan}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors">
                        {note.title}
                      </h4>
                      {note.summary && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          {note.summary}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-theme-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes Results */}
          {quizzes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Kuiz Latihan ({quizzes.length})</span>
              </div>
              <div className="space-y-2">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => {
                      onSelectQuiz(quiz.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/60 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {quiz.subjectName}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {quiz.tingkatan}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {quiz.durationMinutes} minit
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors">
                        {quiz.title}
                      </h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-theme-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
