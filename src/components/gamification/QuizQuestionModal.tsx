import React, { useState } from 'react';
import { Sparkles, HeartPulse, Trophy, CheckCircle2, XCircle, ArrowRight, Zap } from 'lucide-react';
import { Question } from '../../types';

export interface QuizQuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  questionIndex: number;
  totalQuestions: number;
  mode: 'survival' | 'match3';
  onAnswer: (isCorrect: boolean, selectedOptionIndex: number) => void;
  onClose?: () => void;
}

export const checkAnswerCorrectness = (q: Question, selectedIndexOrValue: number | string): boolean => {
  const targetCorrect = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correctAnswer;
  const optionLetters = ['A', 'B', 'C', 'D'];

  const studentStr = String(selectedIndexOrValue ?? '').trim().toUpperCase();
  const correctStr = String(targetCorrect ?? '').trim().toUpperCase();

  const studentAsNum = Number(selectedIndexOrValue);
  const correctAsNum = Number(targetCorrect);

  if (!isNaN(studentAsNum) && !isNaN(correctAsNum) && studentAsNum === correctAsNum) {
    return true;
  }
  if (studentStr === correctStr) {
    return true;
  }
  if (!isNaN(correctAsNum) && correctAsNum >= 0 && correctAsNum < 4 && studentStr === optionLetters[correctAsNum]) {
    return true;
  }
  if (!isNaN(studentAsNum) && studentAsNum >= 0 && studentAsNum < 4 && correctStr === optionLetters[studentAsNum]) {
    return true;
  }
  if (Array.isArray(q.options) && typeof targetCorrect === 'number' && q.options[targetCorrect]) {
    if (String(q.options[targetCorrect]).trim().toLowerCase() === studentStr.toLowerCase()) {
      return true;
    }
  }
  return false;
};

export const QuizQuestionModal: React.FC<QuizQuestionModalProps> = ({
  isOpen,
  question,
  questionIndex,
  totalQuestions,
  mode,
  onAnswer,
  onClose,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  if (!isOpen || !question) return null;

  const optionLetters = ['A', 'B', 'C', 'D'];
  const questionTitle = question.questionText || question.question || 'Soalan Kuiz';

  const handleSelectOption = (idx: number) => {
    if (answeredState !== 'idle') return;
    setSelectedIdx(idx);

    const isCorrect = checkAnswerCorrectness(question, idx);
    setAnsweredState(isCorrect ? 'correct' : 'wrong');

    // Small delay so user sees feedback, then invoke onAnswer
    setTimeout(() => {
      onAnswer(isCorrect, idx);
      setSelectedIdx(null);
      setAnsweredState('idle');
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
        <div
          className={`p-6 text-white ${
            mode === 'survival'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-white">
              {mode === 'survival' ? (
                <>
                  <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                  <span>Mod Survival: Revive Nyawa</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 animate-bounce" />
                  <span>Mod Teka-Teki: +5 Moves Bonus</span>
                </>
              )}
            </div>
            <span className="text-xs font-bold text-white/90 bg-black/20 px-2.5 py-1 rounded-full">
              Soalan {questionIndex + 1} / {totalQuestions}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
            {mode === 'survival'
              ? '🦖 Dinosaur Terlanggar Rintangan!'
              : '💎 Dapatkan +5 Langkah Tambahan!'}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            {mode === 'survival'
              ? 'Jawab soalan ini dengan tepat untuk REVIVE dan teruskan kelangsungan larian.'
              : 'Jawab soalan ini dengan betul untuk menambah +5 langkah dan cipta kombo permata!'}
          </p>
        </div>

        {/* Question & Options Body */}
        <div className="p-6 space-y-6">
          {/* Question Text */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] font-black uppercase tracking-wider text-theme-primary block mb-1">
              Soalan #{questionIndex + 1}
            </span>
            <p className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
              {questionTitle}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options && question.options.length > 0 ? (
              question.options.map((option, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrectOption = checkAnswerCorrectness(question, idx);

                let btnStyles =
                  'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-800 dark:text-stone-200 hover:border-theme-primary/60 hover:bg-stone-100 dark:hover:bg-stone-800';

                if (answeredState !== 'idle') {
                  if (isSelected) {
                    if (isCorrectOption) {
                      btnStyles = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500';
                    } else {
                      btnStyles = 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500';
                    }
                  } else if (isCorrectOption) {
                    btnStyles = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                  } else {
                    btnStyles = 'opacity-50 border-stone-200 dark:border-stone-800';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={answeredState !== 'idle'}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer font-medium text-xs sm:text-sm active:scale-99 ${btnStyles}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-theme-primary text-white'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {optionLetters[idx] || idx + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{option}</span>
                    {answeredState !== 'idle' && isSelected && (
                      <span className="shrink-0 mt-0.5">
                        {isCorrectOption ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500 animate-shake" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-stone-500 italic">Tiada pilihan jawapan objektif.</p>
            )}
          </div>

          {/* Feedback Notice */}
          {answeredState === 'correct' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {mode === 'survival'
                  ? 'Tahniah! Jawapan Tepat! Mengaktifkan Revive Dinosaur...'
                  : 'Tahniah! Jawapan Tepat! Menambah +5 Langkah ke Papan Permata...'}
              </span>
            </div>
          )}

          {answeredState === 'wrong' && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center gap-2.5 text-xs font-bold animate-fade-in">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>
                {mode === 'survival'
                  ? 'Jawapan Salah! Permainan tamat. Menilai keputusan akhir...'
                  : 'Jawapan Kurang Tepat. Tiada langkah tambahan diberikan.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
