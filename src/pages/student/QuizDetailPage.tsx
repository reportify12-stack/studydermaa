import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { getQuizById, getQuizQuestions, submitQuizAttempt } from '../../services/quizService';
import { Quiz, Question, QuizAttempt } from '../../types';
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Send,
  Loader2,
} from 'lucide-react';

interface QuizDetailPageProps {
  quizId: string;
  navigate: (route: string) => void;
}

export const QuizDetailPage: React.FC<QuizDetailPageProps> = ({ quizId, navigate }) => {
  const { userProfile, refreshProfile } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam States
  const [examStarted, setExamStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      setLoading(true);
      try {
        const [q, qList] = await Promise.all([getQuizById(quizId), getQuizQuestions(quizId)]);
        setQuiz(q);
        setQuestions(qList);
        if (q) {
          setTimeRemaining(q.durationMinutes * 60);
        }
      } catch (err) {
        console.error('Error fetching quiz details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndQuestions();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || attemptResult || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(); // Auto submit when time runs out!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, attemptResult, timeRemaining]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (attemptResult) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    if (attemptResult) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!userProfile || !quiz || submitting || attemptResult) return;
    setSubmitting(true);
    try {
      const timeSpent = quiz.durationMinutes * 60 - timeRemaining;
      const result = await submitQuizAttempt(
        userProfile.uid,
        userProfile.username,
        quiz,
        questions,
        userAnswers,
        Math.max(1, timeSpent)
      );

      setAttemptResult(result);
      if (result.status === 'passed') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6'],
        });
      }
      await refreshProfile();
    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-1/4" />
        <div className="h-10 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
        <div className="h-64 bg-stone-100 dark:bg-stone-800 rounded-3xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Kuiz Tidak Dijumpai
        </h2>
        <button
          onClick={() => navigate('/kuiz')}
          className="btn-theme-primary px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          Kembali ke Senarai Kuiz
        </button>
      </div>
    );
  }

  // 1. Initial Briefing Screen (Before clicking Mula)
  if (!examStarted && !attemptResult) {
    return (
      <div id="quiz-start-screen" className="max-w-3xl mx-auto space-y-8 pb-16 animate-fade-in">
        <button
          onClick={() => navigate('/kuiz')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Senarai Kuiz</span>
        </button>

        <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/30">
              {quiz.subjectName}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {quiz.tingkatan}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight">
            {quiz.title}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {quiz.description || 'Jawab semua soalan latihan untuk menguji kefahaman topik ini.'}
          </p>

          {/* Exam Rules & Details Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
            <div>
              <span className="text-[10px] text-stone-400 block font-bold uppercase">Masa Diberikan</span>
              <span className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
                {quiz.durationMinutes} Minit
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-bold uppercase">Bilangan Soalan</span>
              <span className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
                {questions.length} Soalan
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-bold uppercase">Jumlah Markah</span>
              <span className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
                {quiz.totalMarks} Markah
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-bold uppercase">Syarat Lulus</span>
              <span className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
                {quiz.passPercentage}%
              </span>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs">
              Kuiz ini belum mengandungi soalan. Pentadbir akan menambah soalan tidak lama lagi.
            </div>
          ) : (
            <button
              id="begin-exam-btn"
              onClick={() => setExamStarted(true)}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-sm btn-theme-primary shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>MULAKAN KUIZ SEKARANG</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Score Summary / Result Screen
  if (attemptResult && !showReview) {
    const isPassed = attemptResult.status === 'passed';
    return (
      <div id="quiz-result-screen" className="max-w-2xl mx-auto space-y-6 py-8 pb-16 animate-fade-in">
        <div className="p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl text-center space-y-6">
          <div
            className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center ${
              isPassed
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200'
            }`}
          >
            {isPassed ? <Award className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>

          <div>
            <span
              className={`text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider ${
                isPassed
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {isPassed ? 'Tahniah! Anda Lulus' : 'Perlu Ulangkaji'}
            </span>
            <h2 className="text-3xl font-black text-stone-900 dark:text-stone-100 font-display mt-2">
              {attemptResult.percentage}%
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Markah: {attemptResult.score} / {attemptResult.totalMarks} ({attemptResult.correctCount} /{' '}
              {attemptResult.totalQuestions} soalan betul)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 text-left">
            <div>
              <span className="text-[10px] text-stone-400 block font-bold uppercase">Mata XP Diperoleh</span>
              <span className="text-sm font-extrabold text-theme-primary">
                +{attemptResult.xpEarned} XP
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-bold uppercase">Masa Diambil</span>
              <span className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
                {formatTime(attemptResult.timeSpentSeconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="review-answers-btn"
              onClick={() => setShowReview(true)}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
            >
              Semak Jawapan & Penjelasan
            </button>
            <button
              id="retry-quiz-btn"
              onClick={() => {
                setAttemptResult(null);
                setUserAnswers({});
                setTimeRemaining(quiz.durationMinutes * 60);
                setCurrentQIndex(0);
                setExamStarted(true);
              }}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cuba Semula</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/kuiz')}
            className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-medium"
          >
            Kembali ke Senarai Kuiz
          </button>
        </div>
      </div>
    );
  }

  // 3. Review Mode (Show all questions with correct answers & explanations)
  if (attemptResult && showReview) {
    return (
      <div id="quiz-review-screen" className="max-w-3xl mx-auto space-y-6 pb-16 animate-fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowReview(false)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Ringkasan Skor</span>
          </button>
          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
            Skor: {attemptResult.percentage}%
          </span>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAns = attemptResult.answers[q.id];
            const isCorrect = q.type === 'objective' ? userAns === q.correctAnswer : true;

            return (
              <div
                key={q.id}
                className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400">
                    Soalan {idx + 1} daripada {questions.length} ({q.marks} Markah)
                  </span>
                  {q.type === 'objective' && (
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{isCorrect ? 'Betul' : 'Salah'}</span>
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
                  {q.questionText}
                </p>

                {/* Objective Options Review */}
                {q.type === 'objective' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isOptionCorrect = opt.id === q.correctAnswer;
                      const isSelectedByUser = userAns === opt.id;

                      let optStyle =
                        'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-stone-700 dark:text-stone-300';
                      if (isOptionCorrect) {
                        optStyle =
                          'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelectedByUser && !isOptionCorrect) {
                        optStyle =
                          'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-bold text-[11px]">
                              {opt.id}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {isOptionCorrect && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                              Jawapan Sebenar
                            </span>
                          )}
                          {isSelectedByUser && !isOptionCorrect && (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                              Jawapan Anda
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-0.5">💡 Penjelasan / Skema:</span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. Live Exam Taking View
  const currentQ = questions[currentQIndex];

  return (
    <div id="active-exam-container" className="max-w-3xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Sticky Header with Timer & Progress */}
      <div className="sticky top-20 z-20 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
            Soalan {currentQIndex + 1} / {questions.length}
          </span>
          <div className="w-36 bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="btn-theme-primary h-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
            timeRemaining < 120
              ? 'bg-rose-100 text-rose-700 animate-pulse'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'
          }`}
        >
          <Clock className="w-4 h-4 text-theme-primary" />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Current Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              {currentQ.type === 'objective' ? 'Objektif' : currentQ.type === 'kbat' ? 'KBAT' : 'Subjektif'}
            </span>
            <span className="text-xs font-semibold text-stone-400">
              {currentQ.marks} Markah
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
            {currentQ.questionText}
          </h2>

          {/* Question Options for Objective */}
          {currentQ.type === 'objective' && currentQ.options && (
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = userAnswers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-theme-primary ring-2 ring-theme-primary/30 bg-theme-surface text-theme-primary font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'btn-theme-primary text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Subjective/KBAT Answer Textarea */}
          {currentQ.type !== 'objective' && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-stone-500">
                Tuliskan jawapan atau hujah anda:
              </label>
              <textarea
                value={userAnswers[currentQ.id] || ''}
                onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                placeholder="Taip jawapan lengkap di sini..."
                rows={4}
                className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-theme-primary transition-all"
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation and Submit Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQIndex === 0}
          className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 disabled:opacity-40 flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        {currentQIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="px-5 py-2.5 rounded-xl btn-theme-primary text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <span>Seterusnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="submit-quiz-attempt-btn"
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl font-black text-xs btn-theme-primary shadow-md flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghantar Jawapan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>HANTAR JAWAPAN KUIZ</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Question quick grid selector */}
      <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 flex flex-wrap gap-2 justify-center">
        {questions.map((q, idx) => {
          const isAnswered = Boolean(userAnswers[q.id]);
          const isCurrent = idx === currentQIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'ring-2 ring-theme-primary btn-theme-primary text-white scale-105'
                  : isAnswered
                  ? 'bg-theme-surface text-theme-primary border border-theme-primary/30'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
