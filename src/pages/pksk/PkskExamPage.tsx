import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  PkskLevel,
  PkskQuestion,
  PkskSimulationResult,
} from '../../types/pksk';
import {
  fetchPkskSimulation,
  savePkskAttempt,
} from '../../services/pkskService';
import {
  Brain,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  Check,
  ChevronRight,
  Loader2,
  Trophy,
  HelpCircle,
  Share2,
} from 'lucide-react';

interface PkskExamPageProps {
  navigate: (route: string) => void;
}

export const PkskExamPage: React.FC<PkskExamPageProps> = ({ navigate }) => {
  const { user, userProfile } = useAuth();

  const level: PkskLevel =
    userProfile?.pksk_target_level ||
    (userProfile?.tingkatan === 'Tingkatan 3' ? 'Tingkatan 3' : 'Tahun 6');
  const sekolahPilihan =
    userProfile?.pksk_sekolah_pilihan || 'MRSM Pengkalan Chepa (Premier)';

  // Simulation state
  const [status, setStatus] = useState<'loading' | 'active' | 'submitting' | 'submitted'>('loading');
  const [questions, setQuestions] = useState<PkskQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [generationSource, setGenerationSource] = useState<string>('gemini');

  // Result state
  const [result, setResult] = useState<PkskSimulationResult | null>(null);

  // Load questions on mount
  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      setStatus('loading');
      try {
        const response = await fetchPkskSimulation(level, sekolahPilihan);
        if (isMounted) {
          if (response.data?.questions && response.data.questions.length > 0) {
            setQuestions(response.data.questions);
            setGenerationSource(response.source || 'gemini');
            setStatus('active');
            setCurrentQuestionIndex(0);
            setAnswers({});
            setSecondsElapsed(0);
          } else {
            throw new Error('No questions returned');
          }
        }
      } catch (err) {
        console.error('Failed to load simulation questions:', err);
        if (isMounted) {
          setStatus('active'); // fallback handler in service ensures data exists
        }
      }
    }

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [level, sekolahPilihan]);

  // Active exam stopwatch
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (status === 'active') {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Select an option
  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (status !== 'active') return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  // Submit and calculate score
  const handleSubmitSimulation = async () => {
    if (status !== 'active' || questions.length === 0) return;
    setStatus('submitting');

    let totalCorrect = 0;
    let insaniahTotal = 0;
    let insaniahCorrect = 0;
    let intelekTotal = 0;
    let intelekCorrect = 0;

    questions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctIndex;

      if (q.type === 'insaniah') {
        insaniahTotal += 1;
        if (isCorrect) insaniahCorrect += 1;
      } else {
        intelekTotal += 1;
        if (isCorrect) intelekCorrect += 1;
      }

      if (isCorrect) {
        totalCorrect += 1;
      }
    });

    const scorePercentage = Math.round((totalCorrect / questions.length) * 100);

    const simulationResult: Omit<PkskSimulationResult, 'id'> = {
      uid: user?.uid || 'guest',
      studentName: userProfile?.fullName || 'Pelajar Cemerlang',
      level,
      sekolahPilihan,
      totalQuestions: questions.length,
      correctCount: totalCorrect,
      scorePercentage,
      insaniahScore: {
        total: insaniahTotal,
        correct: insaniahCorrect,
        percentage: insaniahTotal > 0 ? Math.round((insaniahCorrect / insaniahTotal) * 100) : 0,
      },
      intelekScore: {
        total: intelekTotal,
        correct: intelekCorrect,
        percentage: intelekTotal > 0 ? Math.round((intelekCorrect / intelekTotal) * 100) : 0,
      },
      answers,
      questions,
      timeSpentSeconds: secondsElapsed,
      completedAt: new Date().toISOString(),
    };

    try {
      const savedId = await savePkskAttempt(simulationResult);
      setResult({ id: savedId, ...simulationResult });
    } catch (e) {
      console.warn('Could not save attempt:', e);
      setResult({ id: `temp_${Date.now()}`, ...simulationResult });
    } finally {
      setStatus('submitted');
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // 1. Loading State Screen
  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin absolute -bottom-2 -right-2" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">
          Menjana Simulasi PKSK Pintar...
        </h2>
        <p className="text-xs sm:text-sm text-stone-400 max-w-md mb-4">
          Enjin AI Pentaksiran sedang menstrukturkan 5 soalan simulasi berformat piawai KPM (Kecerdasan Insaniah & Intelek) khusus untuk calon <span className="text-amber-300 font-bold">{level}</span> ke <span className="text-amber-300 font-bold">{sekolahPilihan}</span>.
        </p>
        <span className="text-[11px] font-semibold text-stone-500">
          Sila tunggu sebentar...
        </span>
      </div>
    );
  }

  // 2. Results & Review Screen
  if (status === 'submitted' && result) {
    const isPassing = result.scorePercentage >= 80;

    return (
      <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
        {/* Result Header Banner */}
        <div
          className={`p-8 rounded-3xl border shadow-xl text-center relative overflow-hidden ${
            isPassing
              ? 'bg-gradient-to-b from-stone-900 via-stone-900 to-emerald-950/40 border-emerald-500/40 shadow-emerald-500/10'
              : 'bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/40 border-amber-500/40 shadow-amber-500/10'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950/60 border border-stone-800 text-xs font-black uppercase tracking-wider mb-4">
            <Trophy className={`w-4 h-4 ${isPassing ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>Keputusan Simulasi PKSK</span>
          </div>

          <div className="text-5xl sm:text-6xl font-black text-white tracking-tight mb-2">
            {result.scorePercentage}%
          </div>

          <p className="text-sm font-bold text-amber-300 mb-1">
            {isPassing
              ? 'Tahniah! Anda Memenuhi Penanda Aras Kemasukan Sekolah Khusus'
              : 'Teruskan Usaha! Tingkatkan Latih Tubi Sebelum Hari Peperiksaan'}
          </p>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            {result.correctCount} daripada {result.totalQuestions} soalan dijawab dengan tepat dalam masa {formatTime(result.timeSpentSeconds || 0)}.
          </p>

          {/* Breakdown Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-lg mx-auto">
            {/* EQ Score */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Kecerdasan Insaniah</div>
                  <div className="text-[10px] text-stone-400">EQ, Integriti & Kepimpinan</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400">
                  {result.insaniahScore.correct} / {result.insaniahScore.total}
                </span>
              </div>
            </div>

            {/* IQ Score */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Kecerdasan Intelek</div>
                  <div className="text-[10px] text-stone-400">Logik, STEM & Am</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-indigo-400">
                  {result.intelekScore.correct} / {result.intelekScore.total}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              id="pksk-retry-btn"
              onClick={() => {
                setStatus('loading');
                fetchPkskSimulation(level, sekolahPilihan).then((res) => {
                  setQuestions(res.data.questions);
                  setStatus('active');
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setSecondsElapsed(0);
                });
              }}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cuba Simulasi Lain</span>
            </button>

            <button
              id="pksk-back-dashboard-btn"
              onClick={() => navigate('/pksk')}
              className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors"
            >
              Kembali ke Dashboard PKSK
            </button>
          </div>
        </div>

        {/* Detailed Question Review & Pedagogical Explanations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Semakan Jawapan & Skema Penerangan</h3>
          </div>

          {questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctIndex;
            const isAnswered = userAnswer !== undefined;

            return (
              <div
                key={q.id || idx}
                className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800/90 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-stone-800 text-xs font-black flex items-center justify-center text-stone-300">
                      #{idx + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        q.type === 'insaniah'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                      }`}
                    >
                      {q.categoryLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tepat</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        <span>Kurang Tepat</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-white leading-relaxed">
                  {q.question}
                </p>

                {/* Options Review */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isChosen = userAnswer === optIdx;
                    const isRightOption = optIdx === q.correctIndex;

                    let optClass = 'bg-stone-950/60 border-stone-800 text-stone-300';
                    if (isRightOption) {
                      optClass = 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-bold';
                    } else if (isChosen && !isRightOption) {
                      optClass = 'bg-rose-950/40 border-rose-600 text-rose-200 font-medium line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${optClass}`}
                      >
                        <span className="w-5 h-5 rounded-md bg-stone-900 border border-stone-700 flex items-center justify-center text-[10px] font-black shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                        {isRightOption && (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider shrink-0">
                            Jawapan Skema
                          </span>
                        )}
                        {isChosen && !isRightOption && (
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider shrink-0">
                            Pilihan Anda
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-400 leading-relaxed">
                    <span className="font-bold text-amber-400 block mb-1">
                      💡 Ulasan Pedagogi PKSK:
                    </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Active Exam Question Screen
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const isCurrentAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Exam Header: Question Pagination & Timer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Question Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={q.id}
                id={`pksk-question-tab-${idx}`}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400/50 shadow-md scale-105'
                    : isAnswered
                    ? 'bg-stone-800 text-amber-300 border border-amber-500/40'
                    : 'bg-stone-950 text-stone-500 border border-stone-800 hover:text-stone-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Right Info: Stopwatch & Category */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 font-mono text-amber-400 font-bold">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <span className="text-stone-400 font-medium">
            Dijawab: <strong className="text-white">{answeredCount}</strong> / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-6">
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-800">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                currentQuestion.type === 'insaniah'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
              }`}
            >
              {currentQuestion.categoryLabel}
            </span>

            <span className="text-xs text-stone-400">
              Soalan {currentQuestionIndex + 1} daripada {totalQuestions}
            </span>
          </div>

          {/* Question Statement */}
          <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQuestion.questionText || currentQuestion.question}
          </div>

          {/* Options List (A, B, C, D) */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((optionText, optIdx) => {
              const isSelected = answers[currentQuestion.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  id={`pksk-q${currentQuestion.id}-opt-${optIdx}`}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50 shadow-md'
                      : 'bg-stone-950/60 border-stone-800/80 text-stone-300 hover:border-stone-700 hover:bg-stone-950'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-900 text-stone-400 border border-stone-700'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed flex-1">
                    {optionText}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="pt-6 border-t border-stone-800 flex items-center justify-between gap-3">
            <button
              id="pksk-prev-question-btn"
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-bold text-stone-300 hover:text-white hover:border-stone-700 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                id="pksk-next-question-btn"
                type="button"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
              >
                <span>Seterusnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="pksk-submit-exam-btn"
                type="button"
                onClick={handleSubmitSimulation}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2"
              >
                <span>Hantar Jawapan</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
