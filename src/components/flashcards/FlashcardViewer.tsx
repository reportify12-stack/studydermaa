import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Bookmark,
  Layers,
  Award,
  Volume2,
} from 'lucide-react';
import { Flashcard, TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { fetchFlashcardsFromFirestore } from '../../services/flashcardService';
import confetti from 'canvas-confetti';

interface FlashcardViewerProps {
  initialSubject?: string;
  initialTingkatan?: string;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  initialSubject = 'Semua',
  initialTingkatan = 'Semua',
}) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [selectedTingkatan, setSelectedTingkatan] = useState<string>(initialTingkatan);

  // Self-assessment stats
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());

  // Fetch flashcards from Firestore
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchFlashcardsFromFirestore(selectedSubject, selectedTingkatan);
        setCards(result);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowHint(false);
      } catch (err) {
        console.error('Failed to load flashcards:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedSubject, selectedTingkatan]);

  const currentCard = cards[currentIndex] || null;

  const handleNext = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    if (cards.length <= 1) return;
    setIsFlipped(false);
    setShowHint(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleMarkMastered = (cardId: string) => {
    setMasteredIds((prev) => new Set(prev).add(cardId));
    setReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
    });
    handleNext();
  };

  const handleMarkReview = (cardId: string) => {
    setReviewIds((prev) => new Set(prev).add(cardId));
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    handleNext();
  };

  const subjectOptions = ['Semua', 'Sains', 'Matematik', 'Sejarah', 'Bahasa Melayu'];

  return (
    <div id="flashcard-feature-root" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-stone-900 dark:text-stone-100">
              Kad Imbasan Pintar KSSM
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Kuatkan ingatan konsep dan formula dengan kaedah ulangkaji aktif (*Active Recall*).
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-theme-primary cursor-pointer"
          >
            {subjectOptions.map((subj) => (
              <option key={subj} value={subj}>
                Subjek: {subj}
              </option>
            ))}
          </select>

          {/* Tingkatan Filter */}
          <select
            value={selectedTingkatan}
            onChange={(e) => setSelectedTingkatan(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-theme-primary cursor-pointer"
          >
            <option value="Semua">Semua Tingkatan</option>
            {TINGKATAN_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            disabled={cards.length <= 1}
            title="Rawakkan Kad"
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Stat Banner */}
      {cards.length > 0 && (
        <div className="flex items-center justify-between text-xs px-2">
          <span className="font-bold text-stone-500 dark:text-stone-400">
            Kad {currentIndex + 1} daripada {cards.length}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              {masteredIds.size} Faham
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
              <RotateCcw className="w-3.5 h-3.5" />
              {reviewIds.size} Ulangkaji
            </span>
          </div>
        </div>
      )}

      {/* 3D Flip Card Container */}
      {loading ? (
        <div className="h-80 sm:h-96 rounded-3xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/40 animate-pulse flex items-center justify-center text-stone-400 text-sm font-bold">
          Memuatkan kad imbasan KSSM dari Firestore...
        </div>
      ) : !currentCard ? (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 space-y-3">
          <BookOpen className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <h3 className="font-bold text-stone-700 dark:text-stone-300">
            Tiada kad imbasan dijumpai
          </h3>
          <p className="text-xs text-stone-400">
            Cuba pilih subjek lain atau klik Semua Tingkatan untuk melihat kad imbasan KSSM.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main 3D Card Area */}
          <div
            className="w-full h-84 sm:h-96 [perspective:1200px] cursor-pointer select-none group"
            onClick={handleFlip}
          >
            <div
              className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-3xl shadow-xl ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* FRONT FACE (Term / Concept) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-8 sm:p-12 rounded-3xl border-2 border-stone-200/90 dark:border-stone-800 bg-linear-to-br from-white via-stone-50 to-amber-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800/80 flex flex-col justify-between shadow-lg">
                {/* Top Card Badge Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-theme-surface text-theme-primary border border-theme-primary/30">
                      {currentCard.subjectName}
                    </span>
                    {currentCard.category && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {currentCard.category}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-stone-400">
                    {currentCard.tingkatan || 'KSSM'}
                  </span>
                </div>

                {/* Center: Term / Concept */}
                <div className="text-center my-auto space-y-3 px-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                    Konsep / Istilah (Depan)
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black font-display text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                    {currentCard.term}
                  </h3>
                  {currentCard.chapter && (
                    <p className="text-xs text-stone-400 font-medium">
                      {currentCard.chapter}
                    </p>
                  )}

                  {/* Optional Hint */}
                  {currentCard.hint && (
                    <div className="pt-2">
                      {showHint ? (
                        <div className="inline-block px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs font-medium animate-fade-in">
                          💡 Pembayang: {currentCard.hint}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold inline-flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Lihat Pembayang (Hint)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Instruction */}
                <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-3">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Klik kad untuk pusingkan & lihat jawapan</span>
                  </span>
                  <span className="hidden sm:inline font-mono text-[10px]">Depan</span>
                </div>
              </div>

              {/* BACK FACE (Definition / Answer) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 sm:p-12 rounded-3xl border-2 border-emerald-400/80 dark:border-emerald-800 bg-linear-to-br from-emerald-50/90 via-white to-teal-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/30 flex flex-col justify-between shadow-xl">
                {/* Back Top Header */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Definisi / Jawapan
                  </span>
                  <span className="text-[11px] font-bold text-stone-400 font-mono">Belakang</span>
                </div>

                {/* Center Definition */}
                <div className="my-auto text-center px-4 space-y-3">
                  <h4 className="text-lg sm:text-xl font-extrabold text-stone-800 dark:text-stone-200 leading-snug whitespace-pre-line max-h-56 overflow-y-auto">
                    {currentCard.definition}
                  </h4>
                </div>

                {/* Back Bottom Instruction */}
                <div className="flex items-center justify-between text-xs text-stone-400 border-t border-emerald-100 dark:border-stone-800 pt-3">
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Klik semula untuk kembali ke depan</span>
                  </span>
                  <span className="text-emerald-600 font-bold">Ulang Kaji Aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action & Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={handleFlip}
                className="px-5 py-2.5 rounded-xl btn-theme-primary font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'Pusing ke Depan' : 'Pusingkan Kad'}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Seterusnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Self-Rating buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkReview(currentCard.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulang Kaji Semula</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkMastered(currentCard.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Saya Faham ✓</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
