import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  BookOpen,
  MessageSquareQuote,
  Lightbulb,
  Info,
} from 'lucide-react';
import {
  LanguageLessonData,
  LanguageModuleId,
} from '../../types/languageHub';
import { speakNativeLanguageWord } from '../../services/languageHubService';

interface LessonQuizViewerProps {
  lesson: LanguageLessonData;
  onGenerateNewTopic?: () => void;
  isGeneratingNew?: boolean;
}

export const LessonQuizViewer: React.FC<LessonQuizViewerProps> = ({
  lesson,
  onGenerateNewTopic,
  isGeneratingNew = false,
}) => {
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return; // Prevent changing after submit
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    let calculatedScore = 0;
    lesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);

    // Confetti celebration if scored 2/3 or 3/3
    if (calculatedScore >= 2) {
      try {
        confetti({
          particleCount: calculatedScore === 3 ? 90 : 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const handleSpeak = (text: string, languageId: LanguageModuleId) => {
    setSpeakingWord(text);
    speakNativeLanguageWord(text, languageId);
    setTimeout(() => {
      setSpeakingWord(null);
    }, 1200);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const isAllAnswered = lesson.quiz.every((_, idx) => selectedAnswers[idx] !== undefined);

  return (
    <div id="lesson-quiz-container" className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Lesson Header & Cultural Context */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-theme-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-theme-surface text-theme-primary border border-theme-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pelajaran AI Terkini • {lesson.languageName}</span>
          </div>

          {onGenerateNewTopic && (
            <button
              type="button"
              id="btn-regenerate-lesson"
              onClick={onGenerateNewTopic}
              disabled={isGeneratingNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isGeneratingNew ? 'animate-spin' : ''}`} />
              <span>{isGeneratingNew ? 'Menjana Pelajaran...' : 'Jana Topik Lain'}</span>
            </button>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight mb-3">
          {lesson.lessonTitle}
        </h2>

        {/* Cultural Intro */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <span className="font-bold text-stone-900 dark:text-stone-100 mr-1">
              Konteks Budaya:
            </span>
            {lesson.culturalIntro}
          </div>
        </div>

        {/* Pronunciation Guide */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60">
          <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
            <span className="font-bold mr-1">Petua Sebutan:</span>
            {lesson.pronunciationGuide}
          </div>
        </div>
      </div>

      {/* 2. 5 Beginner Vocabularies Section */}
      <section id="vocabularies-section" aria-labelledby="heading-vocabularies">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-theme-surface flex items-center justify-center text-theme-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 id="heading-vocabularies" className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                5 Kosa Kata Asas Pilihan (Vocabularies)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tekan ikon pembesar suara untuk mendengar sebutan penutur asli.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {lesson.vocabularies.length} Perkataan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lesson.vocabularies.map((vocab, index) => (
            <div
              key={index}
              id={`vocab-card-${index}`}
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:border-theme-primary/50 transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Kosa Kata #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSpeak(vocab.word, lesson.languageId)}
                      title="Dengar sebutan perkataan ini"
                      className={`p-1.5 rounded-lg text-stone-500 hover:text-theme-primary hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${
                        speakingWord === vocab.word ? 'text-theme-primary bg-theme-surface' : ''
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${vocab.word} (${vocab.romanization})`, `vocab-${index}`)}
                      title="Salin perkataan"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      {copiedIndex === `vocab-${index}` ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Native Script Word */}
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight my-1">
                  {vocab.word}
                </div>

                {/* Romanization / Phonetics */}
                <div className="text-xs font-semibold text-theme-primary tracking-wide mb-3">
                  /{vocab.romanization}/
                </div>

                {/* Meaning in Malay / English */}
                <p className="text-sm font-medium text-stone-700 dark:text-stone-200 leading-snug">
                  {vocab.meaning}
                </p>
              </div>

              {/* Context Tag */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <span className="inline-block text-[11px] font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md">
                  {vocab.context}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 3 Basic Phrases Section */}
      <section id="phrases-section" aria-labelledby="heading-phrases">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
            <div>
              <h3 id="heading-phrases" className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                3 Frasa Asas Perbualan (Basic Phrases)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Frasa praktikal yang sering digunakan dalam perbualan harian.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {lesson.phrases.length} Frasa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lesson.phrases.map((item, index) => (
            <div
              key={index}
              id={`phrase-card-${index}`}
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Frasa #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSpeak(item.phrase, lesson.languageId)}
                      title="Dengar sebutan frasa ini"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${item.phrase} (${item.romanization})`, `phrase-${index}`)}
                      title="Salin frasa"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      {copiedIndex === `phrase-${index}` ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                  {item.phrase}
                </div>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  /{item.romanization}/
                </div>
                <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                  {item.meaning}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 italic block">
                  Situasi: {item.situation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 3-Question Multiple Choice Quiz Section */}
      <section id="quiz-section" aria-labelledby="heading-quiz" className="scroll-mt-8">
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="heading-quiz" className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Kuiz Pengukuhan 3 Soalan
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Uji kefahaman kosa kata dan frasa daripada pelajaran di atas.
                </p>
              </div>
            </div>

            {isSubmitted && (
              <div
                id="quiz-score-badge"
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm border shadow-2xs ${
                  score === 3
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                    : score === 2
                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Skor Anda: {score} / 3</span>
              </div>
            )}
          </div>

          {/* Quiz Question Cards */}
          <div className="space-y-6">
            {lesson.quiz.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[qIndex];
              const isCorrect = isSubmitted && selectedOpt === q.correctIndex;
              const isWrong = isSubmitted && selectedOpt !== undefined && selectedOpt !== q.correctIndex;

              return (
                <div
                  key={q.id || qIndex}
                  id={`quiz-question-container-${qIndex}`}
                  className="p-5 sm:p-6 rounded-2xl bg-stone-50/80 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                      <span className="text-theme-primary font-black mr-2">
                        Soalan {qIndex + 1}:
                      </span>
                      {q.question}
                    </h4>

                    {isSubmitted && (
                      <span className="shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Betul
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> Salah
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((optionText, optIndex) => {
                      const isOptionSelected = selectedOpt === optIndex;
                      const isOptionCorrect = isSubmitted && optIndex === q.correctIndex;
                      const isOptionIncorrectSelected = isSubmitted && isOptionSelected && !isOptionCorrect;

                      let buttonStyle = 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-theme-primary/50';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          buttonStyle = 'bg-emerald-100/80 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                        } else if (isOptionIncorrectSelected) {
                          buttonStyle = 'bg-rose-100/80 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100 line-through';
                        } else {
                          buttonStyle = 'bg-stone-100/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-stone-400 opacity-60';
                        }
                      } else if (isOptionSelected) {
                        buttonStyle = 'bg-theme-surface border-theme-primary text-theme-primary font-bold shadow-2xs ring-1 ring-theme-primary';
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          id={`btn-quiz-q${qIndex}-opt${optIndex}`}
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(qIndex, optIndex)}
                          className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-2 ${buttonStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold border border-current shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{optionText}</span>
                          </div>

                          {isSubmitted && isOptionCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          {isSubmitted && isOptionIncorrectSelected && (
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* AI Explanation after submission */}
                  {isSubmitted && (
                    <div
                      id={`quiz-explanation-${qIndex}`}
                      className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed"
                    >
                      <span className="font-bold mr-1.5">Penjelasan AI:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz Action Footer */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {!isSubmitted
                ? `${Object.keys(selectedAnswers).length} daripada 3 soalan telah dijawab`
                : score === 3
                ? 'Tahniah! Anda telah menguasai semua kosa kata pelajaran ini!'
                : 'Ulang kaji semula kosa kata di atas dan cuba lagi untuk markah penuh!'}
            </p>

            <div className="flex items-center gap-3">
              {isSubmitted ? (
                <>
                  <button
                    type="button"
                    id="btn-retry-quiz"
                    onClick={handleResetQuiz}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Cuba Lagi</span>
                  </button>

                  {onGenerateNewTopic && (
                    <button
                      type="button"
                      id="btn-new-lesson-after-quiz"
                      onClick={onGenerateNewTopic}
                      disabled={isGeneratingNew}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-theme-primary text-white hover:opacity-95 shadow-sm transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Pelajaran Seterusnya</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  id="btn-submit-quiz"
                  disabled={!isAllAnswered}
                  onClick={handleSubmitQuiz}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isAllAnswered
                      ? 'bg-theme-primary text-white hover:opacity-95 shadow-sm cursor-pointer'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Hantar Jawapan Kuiz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
